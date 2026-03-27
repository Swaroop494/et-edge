const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.post('/', async (req, res) => {
  const reasoningTrace = [];
  const userHoldings = Array.isArray(req.body.userHoldings) ? req.body.userHoldings : [];
  const tip = typeof req.body.tip === 'string' ? req.body.tip.trim() : '';
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  async function callAI(system, user) {
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash'});
    const response = await model.generateContent(system + '\n\n' + user);
    const raw = response.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(raw);
  }

  try {
    // STEP 1 — fetch live news
    let topHeadline = { title: 'Indian markets show mixed signals amid global uncertainty', description: 'Markets remain volatile as global cues weigh on sentiment', source: 'Fallback' };
    try {
      const newsRes = await fetch(`https://newsapi.org/v2/everything?q=NSE%20India%20stocks%20Sensex%20Nifty%20market&sortBy=publishedAt&language=en&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`);
      const newsData = await newsRes.json();
      if (newsData.status === 'ok' && newsData.articles?.length > 0) {
        const a = newsData.articles[0];
        topHeadline = { title: a.title, description: a.description || a.title, source: a.source?.name || 'NewsAPI' };
      }
      reasoningTrace.push({ step: 1, tool: 'fetch_live_news', status: 'success', output: `Fetched headlines. Top story: ${topHeadline.title}` });
    } catch (e) {
      reasoningTrace.push({ step: 1, tool: 'fetch_live_news', status: 'failed', output: 'NewsAPI failed. Using fallback headline.' });
    }

    // STEP 2 — analyze event
    const headlineText = String(topHeadline.title || '');
    const descriptionText = String(topHeadline.description || topHeadline.title || '');
    const eventAnalysis = await callAI(
    'You are an Indian financial market event classifier. Respond only in valid JSON with no markdown.',
    `Analyze this Indian market event. Return ONLY valid JSON with: eventType (macro or micro), affectedSectors (array from: Banking IT Energy Pharma Auto FMCG RealEstate Defense NBFC NewAgeTech), affectedStocks (array of NSE symbols), confidenceScore (0-100), whatHappened (one plain English sentence), whyItMatters (one plain English sentence), impactDirection (positive or negative or mixed), actionableAlert (one sentence telling the investor exactly what to watch next based on affected stocks). Headline: ${headlineText} Summary: ${descriptionText}`
    );
    reasoningTrace.push({ step: 2, tool: 'analyze_event', status: 'success', output: `Event: ${eventAnalysis.eventType}. Sectors: ${eventAnalysis.affectedSectors?.join(', ')}. Confidence: ${eventAnalysis.confidenceScore}%` });

    // STEP 3 — validate tip (conditional)
    let tipValidation = null;
    if (tip.length > 0) {
      tipValidation = await callAI(
        'You are a financial misinformation detector. Respond only in valid JSON with no markdown.',
        `Validate this stock tip. Return ONLY valid JSON with: validityScore (0-100), verdict (Likely True or Misleading or Likely False), reasoning (2-3 sentences), redFlags (array of strings), positiveSignals (array of strings). Tip: ${tip} News context: ${eventAnalysis.whatHappened} ${eventAnalysis.whyItMatters}`
      );
      reasoningTrace.push({ step: 3, tool: 'validate_market_tip', status: 'success', output: `Verdict: ${tipValidation.verdict}. Score: ${tipValidation.validityScore}/100` });
    } else {
      reasoningTrace.push({ step: 3, tool: 'validate_market_tip', status: 'skipped', output: 'No tip provided. Agent skipped tip validation.' });
    }

    // STEP 4 — portfolio impact (conditional)
    let portfolioResult = null;
    if (userHoldings.length > 0) {
      portfolioResult = await callAI(
        'You are a portfolio risk advisor for Indian retail investors. Respond only in valid JSON with no markdown. Never say buy or sell.',
        `Assess portfolio impact. Return ONLY valid JSON with: overallVerdict (Safe or Caution or Risky), riskScore (0-100), verdictExplanation (one plain English sentence), stockImpacts (array of objects each with symbol, impactLevel (Low/Medium/High), direction (Positive/Negative/Neutral), plainEnglishReason (one sentence)). Holdings: ${userHoldings.join(', ')} Event: ${JSON.stringify(eventAnalysis)}`
      );
      reasoningTrace.push({ step: 4, tool: 'assess_portfolio_impact', status: 'success', output: `Verdict: ${portfolioResult.overallVerdict}. Risk: ${portfolioResult.riskScore}/100. ${portfolioResult.stockImpacts?.length} stocks assessed.` });
    } else {
      reasoningTrace.push({ step: 4, tool: 'assess_portfolio_impact', status: 'skipped', output: 'No holdings provided. Agent skipped portfolio assessment.' });
    }

    // STEP 5 — final summary (plain text, not JSON)
    const summaryModel = client.getGenerativeModel({ model: 'gemini-2.0-flash'});
const summaryResponse = await summaryModel.generateContent(
  `Summarize these findings in 2-3 plain English sentences for a first-time investor. No jargon. Event: ${eventAnalysis.whatHappened} Portfolio verdict: ${portfolioResult?.overallVerdict ?? 'not assessed'} Tip verdict: ${tipValidation?.verdict ?? 'not checked'}`
);
const agentSummary = summaryResponse.response.text().trim();

    reasoningTrace.push({ step: 5, tool: 'final_summary', status: 'success', output: 'Summary generated.' });

    const stepsCompleted = reasoningTrace.filter(t => t.status === 'success').length;

    return res.status(200).json({
      success: true,
      agentGoal: 'Analyze current Indian market situation and assess portfolio impact',
      stepsCompleted,
      reasoningTrace,
      outputs: {
        topHeadline,
        eventAnalysis,
        tipValidation,
        portfolioImpact: portfolioResult,
        agentSummary
      }
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, reasoningTrace });
  }
});

module.exports = router;