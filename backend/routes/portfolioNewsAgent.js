const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db } = require('../services/firebase');
const crypto = require('crypto');

router.post('/', async (req, res) => {
  const reasoningTrace = [];
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const portfolio = req.body.portfolio || [
    { symbol: 'HDFCBANK', allocation: 18 },
    { symbol: 'SBIN', allocation: 12 },
    { symbol: 'TCS', allocation: 15 },
    { symbol: 'INFY', allocation: 10 },
    { symbol: 'RELIANCE', allocation: 14 },
    { symbol: 'SUNPHARMA', allocation: 8 },
    { symbol: 'DLF', allocation: 11 },
    { symbol: 'MARICO', allocation: 12 }
  ];

  const events = req.body.events || [
    { id: 'rbi_cut', title: 'RBI cuts repo rate by 25bps to 6.25%', type: 'macro', description: 'RBI monetary policy committee cuts repo rate citing easing inflation and growth support needs' },
    { id: 'sebi_fmcg', title: 'SEBI introduces new labelling regulations for FMCG companies', type: 'regulatory', description: 'SEBI mandates new ESG disclosure norms specifically for listed FMCG companies effective Q1 2027' }
  ];

  // Create a unique hash for this portfolio + events combination for caching
  const cacheKey = crypto.createHash('md5').update(JSON.stringify({ portfolio, events })).digest('hex');
  const CACHE_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours

  async function callAI(system, user) {
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
    try {
      const response = await model.generateContent(system + '\n\n' + user);
      const raw = response.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(raw);
    } catch (err) {
      if (err.status === 429 || (err.message && err.message.includes('429'))) {
        throw { status: 429, message: 'Google API Quota Exceeded' };
      }
      throw err;
    }
  }

  try {
    // 1. THE 'CHECK-BEFORE-CALL' LOGIC
    const fourHoursAgo = new Date(Date.now() - CACHE_DURATION_MS);
    const cachedSignalDoc = await db.collection('market_signals')
      .where('cache_key', '==', cacheKey)
      .where('type', '==', 'portfolio_news')
      .where('timestamp', '>', fourHoursAgo)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (!cachedSignalDoc.empty) {
      const cachedData = cachedSignalDoc.docs[0].data();
      reasoningTrace.push({ step: 0, tool: 'cache_check', status: 'cache_hit', output: `Retrieved fresh JSON from market_signals for portfolio analysis` });
      return res.status(200).json({
        success: true,
        agentGoal: 'Prioritise portfolio news (CACHED)',
        stepsCompleted: 3,
        reasoningTrace,
        outputs: cachedData.outputs,
        cachedAt: cachedData.timestamp.toDate()
      });
    }

    // 2. NO CACHE — PROCEED WITH STEPS
    reasoningTrace.push({ step: 1, tool: 'map_events_to_portfolio', status: 'success', output: `Processing ${events.length} events for ${portfolio.length} holdings.` });

    // STEP 1 — map events to portfolio
    const mapping = await callAI(
      'You are a portfolio analyst for Indian retail investors. Respond only in valid JSON with no markdown.',
      `Map these market events to this specific portfolio and identify which stocks are directly affected by each event. Return ONLY valid JSON with: event1Affected (array of stock symbols from portfolio directly affected by event 1), event2Affected (array of stock symbols from portfolio directly affected by event 2), event1Type (Direct or Indirect or Minimal for this portfolio), event2Type (Direct or Indirect or Minimal for this portfolio). Portfolio: ${JSON.stringify(portfolio)}, Events: ${JSON.stringify(events)}`
    );
    reasoningTrace.push({ step: 1, tool: 'map_events_to_portfolio', status: 'success', output: `Event 1 affects: ${mapping.event1Affected?.join(', ')}. Event 2 affects: ${mapping.event2Affected?.join(', ')}` });

    // STEP 2 — quantify P&L impact per event
    const plImpact = await callAI(
      'You are a quantitative portfolio analyst. Respond only in valid JSON with no markdown. Be specific with numbers.',
      `Quantify the estimated P&L impact of each event on this specific portfolio. Return ONLY valid JSON with: event1Impact (object with estimatedPortfolioMovePercent as number, affectedAllocationPercent as number, direction as Positive or Negative or Mixed, stockImpacts as array of objects each with symbol and estimatedMovePercent as number), event2Impact (same structure), moreMateriialEvent (1 or 2, whichever event has larger financial impact on THIS portfolio), materialityReason (2 sentences explaining why that event is more material using specific allocation numbers). Portfolio total: 100%. Holdings: ${JSON.stringify(portfolio)}, Mapping: ${JSON.stringify(mapping)}, Events: ${JSON.stringify(events)}`
    );
    reasoningTrace.push({ step: 2, tool: 'quantify_pl_impact', status: 'success', output: `More material event: Event ${plImpact.moreMateriialEvent}.` });

    // STEP 3 — generate prioritised alert
    const prioritisedAlert = await callAI(
      'You are a portfolio advisor generating prioritised alerts for retail investors. Never say buy or sell. Respond only in valid JSON with no markdown.',
      `Generate a prioritised alert telling this investor which event to focus on first and why, with specific context for their holdings. Return ONLY valid JSON with: priorityEvent (title of the more important event), priorityReason (2 sentences with specific allocation numbers explaining why this event matters more to THIS portfolio), impactScore (number between 0 and 1 for overall impact), event1Alert (object with title, impact, affectedHoldings array, action string), event2Alert (same structure), combinedRiskScore (0-100 for total portfolio risk from both events simultaneously), executiveSummary (3 sentences covering both events with specific stock names and estimated impacts). Data: ${JSON.stringify(plImpact)}, Events: ${JSON.stringify(events)}, Portfolio: ${JSON.stringify(portfolio)}`
    );
    reasoningTrace.push({ step: 3, tool: 'prioritise_alerts', status: 'success', output: `Priority: ${prioritisedAlert.priorityEvent}. Combined risk: ${prioritisedAlert.combinedRiskScore}/100` });

    const finalOutputs = { portfolio, events, mapping, plImpact, prioritisedAlert };

    // 2. THE 'SYNC & SAVE' LOGIC
    await db.collection('market_signals').add({
      cache_key: cacheKey,
      type: 'portfolio_news',
      timestamp: new Date(),
      is_video_worthy: (prioritisedAlert.impactScore || 0) > 0.7,
      outputs: finalOutputs
    });

    return res.status(200).json({
      success: true,
      agentGoal: 'Identify which simultaneous market event is more material to this specific portfolio and quantify P&L impact',
      stepsCompleted: 3,
      reasoningTrace,
      outputs: finalOutputs
    });

  } catch (err) {
    // 3. ERROR HANDLING (QUOTA SAFE)
    if (err.status === 429) {
      const fallbackDoc = await db.collection('market_signals')
        .where('cache_key', '==', cacheKey)
        .where('type', '==', 'portfolio_news')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      if (!fallbackDoc.empty) {
        const fallbackData = fallbackDoc.docs[0].data();
        return res.status(200).json({
          success: true,
          warning: 'Displaying cached intelligence due to high traffic',
          outputs: fallbackData.outputs,
          cachedAt: fallbackData.timestamp.toDate(),
          reasoningTrace
        });
      }
    }
    return res.status(500).json({ success: false, error: err.message, reasoningTrace });
  }
});

module.exports = router;

