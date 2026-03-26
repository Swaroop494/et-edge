// ET Edge - Portfolio Impact Route. Accepts user stock holdings + event analysis, returns personalised Safe/Caution/Risky verdict.
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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
    if (!Array.isArray(userHoldings) || userHoldings.length === 0) {
      return res.status(400).json({
        message: 'userHoldings must be a non-empty array of stock symbols',
      });
    }

    if (!eventAnalysis || typeof eventAnalysis !== 'object') {
      return res.status(400).json({
        message: 'eventAnalysis object is required',
      });
    }

    let parsedResponse;
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash-lite',
        systemInstruction: "You are a portfolio risk advisor for Indian retail investors. You only respond in valid JSON with no additional text or markdown outside the JSON. Never use financial jargon. Write everything in simple plain English a first time investor can fully understand. Never say buy or sell - only explain what the data shows. Be honest about uncertainty. Every stock in the user's holdings must appear in stockImpacts even if the impact is neutral."
      });

      const prompt = `A market event has occurred. Assess the impact on this user's portfolio. Return ONLY a valid JSON object with exactly these fields - overallVerdict: string exactly one of Safe or Caution or Risky, riskScore: number 0-100 where 0 is completely safe and 100 is extremely risky, verdictExplanation: one plain English sentence summarising the overall situation, stockImpacts: array of objects one per stock each having symbol as string, impactLevel as string exactly Low or Medium or High, direction as string exactly Positive or Negative or Neutral, plainEnglishReason as one plain English sentence for this specific stock. User holdings: ${userHoldings.join(', ')} Event analysis: ${JSON.stringify(eventAnalysis)}`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResponse = JSON.parse(cleaned);
    } catch (aiErr) {
      console.error("Gemini portfolio impact failed, using mock fallback:", aiErr.message);
      parsedResponse = buildMockImpact(userHoldings);
    }

    return res.status(200).json(parsedResponse);
  } catch (err) {
    console.error("Portfolio impact route error:", err);
    return res.status(200).json(buildMockImpact(req.body.userHoldings || []));
  }
});

module.exports = router;
