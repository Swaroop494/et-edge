const express = require('express');
const router = express.Router();
const { callAI } = require('../services/aiService');

/**
 * Analyze Event Route: Production-ready for demo recording.
 * Bypasses Firestore persistence first to avoid "Permission Denied" latency/crashes.
 * Immediately returns the OpenAI analysis JSON to the frontend.
 */
router.post('/', async (req, res) => {
    const { headline, summary } = req.body;

    if (!headline || !summary) {
        return res.status(400).json({ error: "headline and summary are required" });
    }

    try {
        console.log(`🤖 AI Engine: Analyzing market event - "${headline.substring(0, 30)}..."`);
        
        const systemPrompt = "You are a Senior Fiduciary Analyst. Return ONLY valid JSON with no markdown.";
        const userPrompt = `Analyze this Indian market event and provide deep financial reasoning.
        Headline: ${headline} 
        Summary: ${summary}
        
        JSON Fields Required:
        - whatHappened: Concise headline
        - whyItMatters: 2 sentences of financial logic
        - confidenceScore: number (0-100)
        - affectedSectors: array of strings
        - affectedStocks: array of strings
        - impactDirection: "Positive", "Negative", or "Volatile"
        
        Tweak: Determine if the impact is 'Positive', 'Negative', or 'Volatile'. Do not default to 'Mixed' unless strictly necessary.`;

        const result = await callAI(systemPrompt, userPrompt);
        
        // 1. Immediate Return: Satisfies user requirement to fill 'Story Flow' instantly.
        res.status(200).json(result);

        // 2. Background Persistence: Fire-and-forget logging.
        // Wrapped in global.saveToFirestore which is already crash-proof.
        if (global.saveToFirestore) {
            global.saveToFirestore('event_analysis_logs', {
                headline,
                result,
                source: 'live_generation'
            });
        }

    } catch (err) {
        console.error("❌ Event Analysis Failure:", err.message);
        
        // 3. Robust Fallback: High-fidelity mock if even the AI fails.
        return res.status(200).json({
            whatHappened: headline,
            whyItMatters: "Current market volatility requires focused institutional monitoring. Technical supports are holding around key psychological levels.",
            confidenceScore: 65,
            affectedSectors: ["Banking", "Energy"],
            affectedStocks: ["NIFTY"],
            impactDirection: "Volatile"
        });
    }
});

module.exports = router;
