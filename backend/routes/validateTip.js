// ET Edge — Validate Tip Route with real market grounding.
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getStockData } = require('../services/stockData');
const { extractTicker } = require('../services/extractTicker');
const { fetchNewsContext } = require('../services/newsGrounding');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const tipText = req.body.tipText || req.body.tip;
    if (!tipText || typeof tipText !== 'string') {
      return res.status(400).json({ error: 'tipText is required' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const flashModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const proModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Step 3c — extract ticker
    const ticker = await extractTicker(flashModel, tipText);

    let stockData = null;
    let groundingContext = '';
    let newsContext = '';

    if (ticker === 'NONE') {
      groundingContext =
        'No specific NSE/BSE stock ticker could be extracted from this claim. The tip cannot be directly tied to a verifiable listed company.';
      newsContext =
        'No ticker-specific news. Provide only general reasoning based on the language and structure of the claim.';
    } else {
      // Step 3e — fetch stock grounding
      stockData = await getStockData(ticker);

      if (!stockData.valid) {
        return res.status(200).json({
          validityScore: 0,
          verdict: 'Invalid',
          reasoning: `"${ticker}" does not exist on NSE or BSE. This is a fabricated company or typo.`,
          redFlags: [
            'Stock does not exist on any Indian exchange',
            'Possible pump-and-dump on fake asset',
          ],
          positiveSignals: [],
          claimedPriceTarget: null,
          targetRealistic: null,
          stockData: null,
        });
      }

      const {
        currentPrice,
        previousClose,
        fiftyTwoWeekHigh,
        fiftyTwoWeekLow,
        marketCap,
        currency,
        signals,
        meta,
      } = stockData;

      groundingContext = [
        `Ticker: ${ticker}`,
        `Exchange symbol: ${meta.exchangeSymbol}`,
        `Company: ${meta.companyName}`,
        `Current price: ${currentPrice} ${currency}`,
        previousClose != null ? `Previous close: ${previousClose} ${currency}` : null,
        fiftyTwoWeekHigh != null
          ? `52-week high: ${fiftyTwoWeekHigh} ${currency}`
          : null,
        fiftyTwoWeekLow != null
          ? `52-week low: ${fiftyTwoWeekLow} ${currency}`
          : null,
        marketCap != null ? `Market cap: ${marketCap}` : null,
        signals.return3m != null
          ? `3M return: ${signals.return3m.toFixed(2)}%`
          : null,
        signals.volatility != null
          ? `Annualised volatility: ${(signals.volatility * 100).toFixed(2)}%`
          : null,
        signals.trend ? `Trend: ${signals.trend}` : null,
        signals.rsiProxy != null
          ? `RSI proxy: ${signals.rsiProxy.toFixed(2)}`
          : null,
        signals.distanceFrom52wHigh != null
          ? `Distance from 52W high: ${signals.distanceFrom52wHigh.toFixed(2)}%`
          : null,
        signals.momentum10d != null
          ? `10-day momentum: ${signals.momentum10d.toFixed(2)}%`
          : null,
        signals.avgVolume3m != null
          ? `Average daily volume (3M): ${Math.round(signals.avgVolume3m)}`
          : null,
      ]
        .filter(Boolean)
        .join('\n');

      // Step 3f — recent news using Gemini web_search tool
      newsContext = await fetchNewsContext(
        proModel,
        ticker,
        meta.companyName || ticker
      );
    }

    const prompt = `
You are a SEBI-aware financial fact-checker. Your job: detect finfluencer manipulation.

LIVE MARKET DATA (do not contradict these numbers):
${groundingContext}

RECENT NEWS:
${newsContext}

CLAIM: "${tipText}"

Red flag rules — apply automatically:
- Claim price target exceeds 52W high by >20%: automatic redFlag
- Claim says guaranteed/sure/100%: automatic redFlag  
- Stock in downtrend + claim says buy: automatic redFlag
- RSI proxy > 75 + claim says buy more: automatic redFlag (overbought)
- volatility > 60% annualised: add to redFlags as 'Highly volatile stock'
- momentum10d < -5% + bullish claim: add redFlag 'Negative near-term momentum'

Score guidance:
- 80-100: Claim is consistent with all market data and trends
- 60-79: Claim has some basis but uses hype language or mild overstatement
- 40-59: Claim contradicts some signals or lacks evidence
- 20-39: Claim contradicts majority of signals, urgent/emotional language
- 0-19: No basis in data, fake urgency, or impossible price target

Respond ONLY in this JSON, no markdown fences, no extra text:
{
  "validityScore": <0-100>,
  "verdict": <"Valid"|"Misleading"|"Hype"|"Invalid"|"Noise">,
  "reasoning": "<2-3 sentences, must reference at least one specific number from the live data>",
  "redFlags": ["<specific flag with data reference>"],
  "positiveSignals": ["<specific signal>"],
  "claimedPriceTarget": <number or null>,
  "targetRealistic": <true|false|null>
}
`.trim();

    const result = await proModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: [{ googleSearch: {} }],
    });

    const raw = result.response.text();
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (ticker === 'NONE' && typeof parsed.validityScore === 'number') {
      parsed.validityScore = Math.min(parsed.validityScore, 40);
    }

    if (stockData && stockData.valid) {
      // Strip internal historical meta before returning to client
      const { meta, ...publicStock } = stockData;
      parsed.stockData = publicStock;
    } else {
      parsed.stockData = null;
    }

    return res.status(200).json(parsed);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

