const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.post('/', async (req, res) => {
  const reasoningTrace = [];
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  async function callAI(system, user) {
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const response = await model.generateContent(system + '\n\n' + user);
    const raw = response.response.text().replace(/```json/g,'').replace(/```/g,'').trim();
    return JSON.parse(raw);
  }

  try {
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

    // STEP 1 — map events to portfolio
    const mapping = await callAI(
      'You are a portfolio analyst for Indian retail investors. Respond only in valid JSON with no markdown.',
      `Map these two simultaneous market events to this specific portfolio and identify which stocks are directly affected by each event. Return ONLY valid JSON with: event1Affected (array of stock symbols from portfolio directly affected by event 1), event2Affected (array of stock symbols from portfolio directly affected by event 2), event1Type (Direct or Indirect or Minimal for this portfolio), event2Type (Direct or Indirect or Minimal for this portfolio). Portfolio: ${JSON.stringify(portfolio)}, Event 1: ${JSON.stringify(events[0])}, Event 2: ${JSON.stringify(events[1])}`
    );
    reasoningTrace.push({ step: 1, tool: 'map_events_to_portfolio', status: 'success', output: `Event 1 affects: ${mapping.event1Affected?.join(', ')}. Event 2 affects: ${mapping.event2Affected?.join(', ')}` });

    // STEP 2 — quantify P&L impact per event
    const plImpact = await callAI(
      'You are a quantitative portfolio analyst. Respond only in valid JSON with no markdown. Be specific with numbers.',
      `Quantify the estimated P&L impact of each event on this specific portfolio. Return ONLY valid JSON with: event1Impact (object with estimatedPortfolioMovePercent as number, affectedAllocationPercent as number, direction as Positive or Negative or Mixed, stockImpacts as array of objects each with symbol and estimatedMovePercent as number), event2Impact (same structure), moreMateriialEvent (1 or 2, whichever event has larger financial impact on THIS portfolio), materialityReason (2 sentences explaining why that event is more material using specific allocation numbers). Portfolio total: 100%. Holdings: ${JSON.stringify(portfolio)}, Mapping: ${JSON.stringify(mapping)}, Event 1: ${JSON.stringify(events[0])}, Event 2: ${JSON.stringify(events[1])}`
    );
    reasoningTrace.push({ step: 2, tool: 'quantify_pl_impact', status: 'success', output: `More material event: Event ${plImpact.moreMateriialEvent}. Event 1 portfolio move: ${plImpact.event1Impact?.estimatedPortfolioMovePercent}%. Event 2: ${plImpact.event2Impact?.estimatedPortfolioMovePercent}%` });

    // STEP 3 — generate prioritised alert
    const prioritisedAlert = await callAI(
      'You are a portfolio advisor generating prioritised alerts for retail investors. Never say buy or sell. Respond only in valid JSON with no markdown.',
      `Generate a prioritised alert telling this investor which event to focus on first and why, with specific context for their holdings. Return ONLY valid JSON with: priorityEvent (title of the more important event), priorityReason (2 sentences with specific allocation numbers explaining why this event matters more to THIS portfolio), event1Alert (object with title, impact, affectedHoldings array, action string), event2Alert (same structure), combinedRiskScore (0-100 for total portfolio risk from both events simultaneously), executiveSummary (3 sentences covering both events with specific stock names and estimated impacts). Data: ${JSON.stringify(plImpact)}, Events: ${JSON.stringify(events)}, Portfolio: ${JSON.stringify(portfolio)}`
    );
    reasoningTrace.push({ step: 3, tool: 'prioritise_alerts', status: 'success', output: `Priority: ${prioritisedAlert.priorityEvent}. Combined risk: ${prioritisedAlert.combinedRiskScore}/100` });

    return res.status(200).json({
      success: true,
      agentGoal: 'Identify which simultaneous market event is more material to this specific portfolio and quantify P&L impact',
      stepsCompleted: 3,
      reasoningTrace,
      outputs: { portfolio, events, mapping, plImpact, prioritisedAlert }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, reasoningTrace });
  }
});

module.exports = router;
