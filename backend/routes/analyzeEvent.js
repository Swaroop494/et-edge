// ET Edge — Analyze Event Route. Accepts headline + summary, returns Gemini AI event analysis.
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.post('/', async (req, res) => {
    const { headline, summary } = req.body;

    if (!headline || !summary) {
        return res.status(400).json({ error: "headline and summary are required" });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Use Gemini 2.0 Flash Lite for high speed and better quota availability
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash-lite",
            systemInstruction: "You are an Indian financial market event classifier. You only respond in valid JSON with no additional text, explanation, or markdown code blocks outside the JSON object. Never wrap response in backticks. Classify events as macro or micro. Macro events are broad economic events like RBI decisions, Union Budget, inflation data, global oil prices, geopolitical events affecting India. Micro events are company specific like quarterly earnings, mergers, acquisitions, management changes, block deals, insider trading. Return confidence score 0-100 based on clarity of market impact. Never use financial jargon."
        });

        const prompt = `Analyze this Indian market event and return ONLY a valid JSON object with exactly these fields — eventType: string macro or micro, affectedSectors: array, affectedStocks: array, confidenceScore: number, whatHappened: string, whyItMatters: string, impactDirection: string. Headline: ${headline} Summary: ${summary}`;

        const result = await model.generateContent(prompt);
        const textResponse = result.response.text();
        
        const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedResponse = JSON.parse(cleanedText);
        return res.status(200).json(parsedResponse);

    } catch (err) {
        console.error("Event analysis error (Gemini):", err);
        return res.status(500).json({ 
            message: "Event analysis unavailable. Please try again.",
            error: err.message 
        });
    }
});

module.exports = router;
