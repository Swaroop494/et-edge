const express = require('express');
const router = express.Router();
const { callAI } = require('../services/aiService');
const { getStockData } = require('../services/stockData');

router.post('/', async (req, res) => {
  try {
    const { scenarioText } = req.body;
    
    // 1. Get the real numbers for the AI to "anchor" to
    const stockData = await getStockData("RELIANCE"); // Defaulting for demo if no ticker found
    
    const systemInstruction = "You are the ET Edge Scenario Engine. Analyze the user's 'What-if' query against historical data.";
    const userPrompt = `Scenario: ${scenarioText}. Historical Context: Price ₹${stockData.currentPrice}. Analyze impact on Equities, Risk, and Momentum.`;

    // 2. Call the standardized service
    const aiResult = await callAI(systemInstruction, userPrompt, {
        actualOutcome: "Historical support held at ₹2400.",
        verdict: "Partially correct",
        reasoning: "Market trends suggest a mixed recovery."
    });

    // 3. Ensure frontend gets exactly what it needs
    return res.status(200).json({
      scenarioResult: aiResult,
      stockData: { currentPrice: stockData.currentPrice },
      // Fallbacks to keep UI gauges working
      riskLevel: aiResult.riskLevel || 50,
      impactSectors: aiResult.impactSectors || { Equities: 'Mixed', Risk: 'Mixed', Momentum: 'Mixed' }
    });
  } catch (err) {
    return res.status(500).json({ error: "Scenario analysis failed" });
  }
});

module.exports = router;
