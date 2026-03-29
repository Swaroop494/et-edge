// ET Edge — Analyze Event Route. Accepts headline + summary, returns Gemini AI event analysis.
const path = require('path');
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const headlineAnalysisCache = new Map();

const buildMockAnalysis = (headline, summary) => {
    const text = `${headline} ${summary}`.toLowerCase();
    let impactDirection = "mixed";
    if (/(rise|rises|gain|gains|up|surge|beat|growth|record high|rally|strong)/.test(text)) {
        impactDirection = "positive";
    } else if (/(fall|falls|down|drop|drops|slump|miss|weak|decline|cut|loss)/.test(text)) {
        impactDirection = "negative";
    }

    return {
        eventType: /(rbi|inflation|gdp|budget|crude|oil|fed|interest rate|rupee|fii|geopolitical|policy)/.test(text) ? "macro" : "micro",
        affectedSectors: ["Banking", "IT Services", "Energy"],
        affectedStocks: ["HDFCBANK", "TCS", "RELIANCE"],
        confidenceScore: 55,
        whatHappened: headline,
        whyItMatters: summary || "This event can influence investor sentiment and near-term market movement in India.",
        impactDirection
    };
};

router.post('/', async (req, res) => {
    const { headline, summary } = req.body;

    if (!headline || !summary) {
        return res.status(400).json({ error: "headline and summary are required" });
    }

    const normalizedHeadline = headline.trim().toLowerCase();
    
    if (global.USE_MOCKS) {
        console.log("Serving mock analyzeEvent response (Demo Mode)");
        const mockResp = buildMockAnalysis(headline, summary);
        return res.status(200).json(mockResp);
    }
    
    if (headlineAnalysisCache.has(normalizedHeadline)) {
        return res.status(200).json(headlineAnalysisCache.get(normalizedHeadline));
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Use gemini-2.5-flash-lite for high-performance extraction
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash-lite",
            systemInstruction: `You are a Senior Fiduciary Analyst. For every market event or news item, you MUST return a JSON object with:
            - eventType: (e.g., "Macro", "Sector", "Regulatory")
            - whatHappened: (A concise headline)
            - whyItMatters: (2-3 sentences of deep financial reasoning)
            - source: (A specific citation like [Source: NSE Filing Q3])
            - affectedSectors: (An array of strings)
            - affectedStocks: (An array of strings)
            - impactDirection: ("positive" or "negative" or "mixed")
            
            The Explainability Requirement: If reasoning or a source is missing, the response is invalid. Do not return just numbers.`
        });

        const prompt = `Analyze this Indian market event and return a JSON object. Headline: ${headline} Summary: ${summary}`;

        let parsedResponse;
        try {
            const result = await model.generateContent(prompt);
            const textResponse = result.response.text();
            const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedResponse = JSON.parse(cleanedText);
        } catch (err) {
            console.log('📡 Mode: Safety Fallback (Analyze Event Error)');
            const mockDataPath = path.join(__dirname, "../../data/radar_events.json");
            const rawMock = JSON.parse(fs.readFileSync(mockDataPath, 'utf8')).events;
            return res.status(200).json(rawMock[0]);
        }

        headlineAnalysisCache.set(normalizedHeadline, parsedResponse);
        return res.status(200).json(parsedResponse);

    } catch (err) {
        const fallback = buildMockAnalysis(headline, summary);
        headlineAnalysisCache.set(normalizedHeadline, fallback);
        console.log("Event analysis route failed, returning fallback:", err);
        return res.status(200).json(fallback);
    }
});

module.exports = router;
