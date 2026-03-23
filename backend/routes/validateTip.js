// ET Edge — Validate Tip Route. The Finfluencer BS Detector. Accepts stock tip + news context, returns validity analysis.
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    if (!req.body.tipText || !req.body.newsContext) {
      return res.status(400).json({ error: 'tipText and newsContext are required' });
    }

    const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: 'You are a financial misinformation detector protecting Indian retail investors from fake stock tips on WhatsApp and social media. You only respond in valid JSON with no additional text or markdown outside the JSON. Be appropriately skeptical of tips that promise guaranteed returns, give specific price targets with no evidence, use urgent language like buy now or last chance, mention insider information, or make claims contradicting recent verified news. Cross-reference every claim in the tip against the provided news context. Write all explanations in simple plain English for someone with zero finance knowledge.',
      messages: [
        {
          role: 'user',
          content: 'Analyze this stock tip and cross-reference against today\'s news context. Return ONLY a valid JSON object with exactly these fields — validityScore: number 0-100 where 100 is completely verified true and 0 is completely false, verdict: string exactly one of Likely True or Misleading or Likely False, reasoning: string 2 to 3 plain English sentences explaining your score mentioning specific facts from news context if relevant, redFlags: array of strings each being one suspicious claim or phrase found in the tip empty array if none, positiveSignals: array of strings each being one claim that checks out against news context empty array if none. Tip to validate: ' + req.body.tipText + ' Today\'s news context: ' + req.body.newsContext,
        },
      ],
    });

    let text = response.content[0].text;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(text);

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({
      message: 'Validation unavailable. Please try again.',
      error: err.message,
    });
  }
});

module.exports = router;
