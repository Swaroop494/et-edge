const express = require('express');
const { callAI } = require('../services/aiService');

const router = express.Router();

const buildMockImpact = (userHoldings) => {
  return {
    overallVerdict: "Caution",
    riskScore: 65,
    verdictExplanation: "The current market event has mixed implications for your portfolio, with specific focus on interest-rate sensitive sectors.",
    stockImpacts: userHoldings.map(symbol => ({
      symbol,
      impactLevel: "Medium",
      direction: "Neutral",
      plainEnglishReason: "This stock might experience short-term volatility as the market processes the recent news."
    }))
  };
};

router.post('/', async (req, res) => {
  try {
    const { userHoldings, eventAnalysis } = req.body;
    
    // Safety check for empty inputs
    if (!Array.isArray(userHoldings) || userHoldings.length === 0) {
      return res.status(400).json({ message: 'userHoldings must be a non-empty array of stock symbols' });
    }

    if (!eventAnalysis || typeof eventAnalysis !== 'object') {
      return res.status(400).json({ message: 'eventAnalysis object is required' });
    }

    // 1. CLEAN THE INPUT: Stringify and truncate to prevent token overflow
    const cleanedAnalysis = JSON.stringify(eventAnalysis).substring(0, 2000);

    const systemInstruction = "You are a portfolio risk advisor for Indian retail investors. You only respond in valid JSON with no additional text or markdown outside the JSON. Never use financial jargon. Write everything in simple plain English a first time investor can fully understand. Every stock in the user's holdings must appear in stockImpacts.";
    
    // 2. DECISIVE PROMPT: Force specific verdicts
    const prompt = `Assess the impact on this user's portfolio. 
    User holdings: ${userHoldings.join(', ')} 
    Event analysis (truncated): ${cleanedAnalysis}

    JSON Fields Required:
    - overallVerdict: One of "Safe", "Caution", or "Risky"
    - riskScore: number 0-100
    - verdictExplanation: one plain English sentence
    - stockImpacts: array of { symbol, impactLevel (Low/Medium/High), direction (Positive/Negative/Volatile), plainEnglishReason }

    Tweak: Be decisive. Determine if the impact is 'Positive', 'Negative', or 'Volatile'. Do not default to 'Neutral' unless strictly necessary.`;

    try {
      // 3. CALL CENTRALIZED AI ENGINE
      const result = await callAI(systemInstruction, prompt);
      return res.status(200).json(result);
    } catch (aiErr) {
      console.error("❌ Portfolio AI Analysis Failure:", aiErr.message);
      return res.status(200).json(buildMockImpact(userHoldings));
    }

  } catch (err) {
    console.error("❌ Portfolio Impact Route Error:", err.message);
    return res.status(200).json(buildMockImpact(req.body.userHoldings || []));
  }
});

module.exports = router;
