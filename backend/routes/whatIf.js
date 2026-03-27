// ET Edge — What-if Scenario Route using verified historical data.
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getStockData, computeVolatility } = require('../services/stockData');
const { extractTicker } = require('../services/extractTicker');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const userScenario = req.body.scenarioText || req.body.scenario;

    if (!userScenario || typeof userScenario !== 'string') {
      return res.status(400).json({ error: 'scenarioText is required' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const flashModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const proModel = genAI.getGenerativeModel({ model: 'gemini-2.0-pro' });

    // Step 4a — extract ticker from scenario text
    const ticker = await extractTicker(flashModel, userScenario);

    // Step 4b — validate ticker exists
    if (ticker === 'NONE') {
      return res.status(400).json({
        error: 'Stock does not exist',
        ticker: 'NONE',
      });
    }

    const stockData = await getStockData(ticker);
    if (!stockData.valid) {
      return res.status(400).json({
        error: 'Stock does not exist',
        ticker,
      });
    }

    const { signals, currentPrice, meta } = stockData;
    const closes = meta.closes || [];
    const timestamps = meta.timestamps || [];

    if (!Array.isArray(closes) || closes.length < 2) {
      return res.status(500).json({
        error: 'Insufficient historical data for scenario analysis',
      });
    }

    // Step 4c — compute actualReturn, bestCase, worstCase, periodVolatility
    const openPrice = closes[0];
    const priceToday = closes[closes.length - 1];

    let actualReturn = null;
    if (openPrice && openPrice !== 0) {
      actualReturn = ((priceToday - openPrice) / openPrice) * 100;
    }

    let bestCase = priceToday;
    let worstCase = priceToday;
    let bestCaseDate = timestamps[timestamps.length - 1] || null;
    let worstCaseDate = bestCaseDate;

    for (let i = 0; i < closes.length; i += 1) {
      const price = closes[i];
      if (typeof price !== 'number') continue;
      if (price > bestCase) {
        bestCase = price;
        bestCaseDate = timestamps[i] || bestCaseDate;
      }
      if (price < worstCase) {
        worstCase = price;
        worstCaseDate = timestamps[i] || worstCaseDate;
      }
    }

    const periodVolatility = computeVolatility(closes);

    const formatDate = (ts) => {
      if (!ts) return 'Unknown date';
      const d = new Date(ts * 1000);
      return d.toISOString().split('T')[0];
    };

    const prompt = `
You are analyzing a hypothetical investment scenario using VERIFIED historical data only.

ACTUAL HISTORICAL DATA for ${ticker} (past 3 months):
- Price 3 months ago: ₹${openPrice}
- Price today: ₹${priceToday}  
- Actual 3-month return: ${actualReturn != null ? actualReturn.toFixed(2) : 'N/A'}%
- Best price in period: ₹${bestCase} (${formatDate(bestCaseDate)})
- Worst price in period: ₹${worstCase} (${formatDate(worstCaseDate)})
- Annualised volatility in period: ${
      periodVolatility != null ? (periodVolatility * 100).toFixed(2) : 'N/A'
    }%

SCENARIO: "${userScenario}"

Using ONLY the numbers above (invent no prices), respond in JSON:
{
  "actualOutcome": "<what actually happened, with numbers>",
  "scenarioAssessment": "<was the reasoning behind the scenario sound?>",
  "riskHighlights": ["<specific risk that played out>"],
  "verdict": <"Correct"|"Partially correct"|"Wrong"|"Unverifiable">,
  "confidenceNote": "<one sentence on data limitations>"
}
`.trim();

    const result = await proModel.generateContent(prompt);
    const raw = result.response.text();
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const scenarioResult = JSON.parse(cleaned);

    return res.status(200).json({
      scenarioResult,
      stockData: {
        signals,
        currentPrice,
      },
      actualReturn,
      bestCase,
      worstCase,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

