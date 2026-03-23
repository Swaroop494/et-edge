// ET Edge - Portfolio Impact Route. Accepts user stock holdings + event analysis, returns personalised Safe/Caution/Risky verdict.
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    if (!Array.isArray(req.body.userHoldings) || req.body.userHoldings.length === 0) {
      return res.status(400).json({
        message: 'userHoldings must be a non-empty array of stock symbols',
      });
    }

    if (!req.body.eventAnalysis || typeof req.body.eventAnalysis !== 'object') {
      return res.status(400).json({
        message: 'eventAnalysis object is required',
      });
    }

    const client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system:
        "You are a portfolio risk advisor for Indian retail investors. You only respond in valid JSON with no additional text or markdown outside the JSON. Never use financial jargon. Write everything in simple plain English a first time investor can fully understand. Never say buy or sell - only explain what the data shows. Be honest about uncertainty. Every stock in the user's holdings must appear in stockImpacts even if the impact is neutral.",
      messages: [
        {
          role: 'user',
          content:
            "A market event has occurred. Assess the impact on this user's portfolio. Return ONLY a valid JSON object with exactly these fields - overallVerdict: string exactly one of Safe or Caution or Risky, riskScore: number 0-100 where 0 is completely safe and 100 is extremely risky, verdictExplanation: one plain English sentence summarising the overall situation, stockImpacts: array of objects one per stock each having symbol as string, impactLevel as string exactly Low or Medium or High, direction as string exactly Positive or Negative or Neutral, plainEnglishReason as one plain English sentence for this specific stock. User holdings: " +
            req.body.userHoldings.join(', ') +
            ' Event analysis: ' +
            JSON.stringify(req.body.eventAnalysis),
        },
      ],
    });

    const rawText = response.content[0].text;
    const cleaned = rawText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const parsed = JSON.parse(cleaned);

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({
      message: 'Portfolio analysis unavailable',
      error: err.message,
    });
  }
});

module.exports = router;
