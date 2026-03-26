// ET Edge — Analyze Event Route. Accepts headline + summary, returns Gemini AI event analysis.
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

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
    if (headlineAnalysisCache.has(normalizedHeadline)) {
        return res.status(200).json(headlineAnalysisCache.get(normalizedHeadline));
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Use gemini-2.5-flash-lite for high-performance extraction
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash-lite",
            systemInstruction: "You are an Indian financial market event classifier. You only respond in valid JSON with no additional text, explanation, or markdown code blocks outside the JSON object. Never wrap response in backticks. Classify events as macro or micro. Macro events are broad economic events like RBI decisions, Union Budget, inflation data, global oil prices, geopolitical events affecting India. Micro events are company specific like quarterly earnings, mergers, acquisitions, management changes, block deals, insider trading. Return confidence score 0-100 based on clarity of market impact. Never use financial jargon."
        });

        const prompt = `Analyze this Indian market event and return ONLY a valid JSON object with exactly these fields — eventType: string macro or micro, affectedSectors: array, affectedStocks: array, confidenceScore: number, whatHappened: string, whyItMatters: string, impactDirection: string. Headline: ${headline} Summary: ${summary}`;

        let parsedResponse;
        try {
            const result = await model.generateContent(prompt);
            const textResponse = result.response.text();
            const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedResponse = JSON.parse(cleanedText);
        } catch (analysisErr) {
            console.error("Gemini analysis failed, returning mock analysis fallback:", analysisErr?.message || analysisErr);
            parsedResponse = buildMockAnalysis(headline, summary);
        }

        headlineAnalysisCache.set(normalizedHeadline, parsedResponse);
        return res.status(200).json(parsedResponse);

    } catch (err) {
        const fallback = buildMockAnalysis(headline, summary);
        headlineAnalysisCache.set(normalizedHeadline, fallback);
        console.error("Event analysis route failed, returning fallback:", err);
        return res.status(200).json(fallback);
    }
});

module.exports = router;
