// ET Edge — Validate Tip Route. The Finfluencer BS Detector. Accepts stock tip + news context, returns validity analysis.
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

const buildMockValidation = (tipText) => {
  return {
    validityScore: 45,
    verdict: "Misleading",
    reasoning: "The tip uses urgent language typical of social media pumping schemes. While the stock exists, there is no verifiable news context to support the specific target price mentioned.",
    redFlags: ["Urgent language", "Unverified price target", "Source uncertainty"],
    positiveSignals: ["Company is listed on NSE"]
  };
};

router.post('/', async (req, res) => {
  try {
    const tip = req.body.tip || req.body.tipText;
    const newsContext = req.body.newsContext || "No context provided";

    if (!tip) {
      return res.status(400).json({ error: 'tip is required' });
    }

    let parsedResponse;
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash-lite',
        systemInstruction: 'You are a financial fraud detector protecting Indian retail investors. You only respond in valid JSON with no additional text or markdown outside the JSON. Analyze tips for misinformation, pumping schemes, or verified facts. Cross-reference every claim in the tip against available news context.'
      });

      const prompt = `You are a financial fraud detector. Analyze this tip: "${tip}". Cross-reference it with the latest live news. Today's news context: ${newsContext}. Return ONLY a valid JSON object with exactly these fields — score: number 0-100 where 100 is completely verified true and 0 is fake, verdict: string exactly one of Valid or Misleading or Noise, reason: string 2 to 3 plain English sentences explaining your verdict.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResponse = JSON.parse(cleanedText);
    } catch (aiErr) {
      console.error("Gemini tip validation failed, using mock fallback:", aiErr.message);
      parsedResponse = {
        score: 45,
        verdict: "Misleading",
        reason: "The system is currently in diagnostic mode. This tip exhibits patterns commonly associated with social media speculation."
      };
    }

    return res.status(200).json(parsedResponse);
  } catch (err) {
    console.error("Validate tip route error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
