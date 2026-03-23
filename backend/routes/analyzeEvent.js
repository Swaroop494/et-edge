// ET Edge — Analyze Event Route. Accepts headline + summary, returns Claude AI event analysis.
const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

router.post('/', async (req, res) => {
    const { headline, summary } = req.body;

    if (!headline || !summary) {
        return res.status(400).json({ error: "headline and summary are required" });
    }

    try {
        const client = new Anthropic({
            apiKey: process.env.CLAUDE_API_KEY,
        });

        const systemPrompt = "You are an Indian financial market event classifier. You only respond in valid JSON with no additional text, explanation, or markdown code blocks outside the JSON object. Never wrap response in backticks. Classify events as macro or micro. Macro events are broad economic events like RBI decisions, Union Budget, inflation data, global oil prices, geopolitical events affecting India. Micro events are company specific like quarterly earnings, mergers, acquisitions, management changes, block deals, insider trading. Return confidence score 0-100 based on clarity of market impact. Never use financial jargon — write for a first time investor who has never traded stocks.";
        const userMessage = `Analyze this Indian market event and return ONLY a valid JSON object with exactly these fields — eventType: string exactly macro or micro, affectedSectors: array of strings from this list only Banking IT Energy Pharma Auto FMCG RealEstate Defense NBFC NewAgeTech, affectedStocks: array of NSE stock symbol strings, confidenceScore: number 0-100, whatHappened: one plain English sentence what happened, whyItMatters: one plain English sentence why retail investors should care, impactDirection: string exactly positive or negative or mixed. Headline: ${headline} Summary: ${summary}`;

        const response = await client.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: systemPrompt,
            messages: [
                { role: "user", content: userMessage }
            ]
        });

        let textResponse = response.content[0].text;
        
        // Cleaning the response text
        const cleanedText = textResponse
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        const parsedResponse = JSON.parse(cleanedText);
        return res.status(200).json(parsedResponse);

    } catch (err) {
        console.error("Event analysis error:", err);
        return res.status(500).json({ 
            message: "Event analysis unavailable. Please try again.",
            error: err.message 
        });
    }
});

module.exports = router;
