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
    const signal = req.body.signal || {
      symbol: "TCS",
      currentPrice: 4285,
      fiftyTwoWeekHigh: 4280,
      breakoutVolume: "2.4x average",
      rsi: 78,
      fiiAction: "Reduced exposure by 1.2% in last quarterly filing",
      sector: "IT",
      historicalBreakouts: "3 prior 52-week breakouts in last 5 years"
    };

    // STEP 1 — detect breakout pattern
    const breakout = await callAI(
      'You are a technical analysis expert for Indian equities. Respond only in valid JSON with no markdown.',
      `Detect and classify this breakout pattern. Return ONLY valid JSON with: patternConfirmed (boolean), breakoutStrength (Weak or Moderate or Strong), volumeConfirmation (boolean), historicalSuccessRate (estimated percentage as number), successRateContext (one sentence explaining the historical pattern for this stock), technicalVerdict (Confirmed Breakout or False Breakout Risk or Needs Confirmation). Data: Symbol: ${signal.symbol}, Price: ${signal.currentPrice}, 52-week high: ${signal.fiftyTwoWeekHigh}, Volume: ${signal.breakoutVolume}, Historical breakouts: ${signal.historicalBreakouts}`
    );
    reasoningTrace.push({ step: 1, tool: 'detect_breakout', status: 'success', output: `Pattern: ${breakout.technicalVerdict}. Historical success rate: ${breakout.historicalSuccessRate}%. Volume confirmed: ${breakout.volumeConfirmation}` });

    // STEP 2 — surface conflicting signals
    const conflicts = await callAI(
      'You are a balanced equity analyst. Never give binary buy/sell calls. Respond only in valid JSON with no markdown.',
      `Surface and quantify the conflicting signals for this breakout. Return ONLY valid JSON with: bullishSignals (array of strings), bearishSignals (array of strings), rsiRisk (one sentence explaining what RSI of ${signal.rsi} means for this breakout specifically), fiiConcern (one sentence on what FII reduction means in context), overallBias (Bullish with Caution or Bearish with Opportunity or Genuinely Mixed), conflictSeverity (Low or Medium or High). Data: RSI: ${signal.rsi}, FII action: ${signal.fiiAction}, Breakout: ${JSON.stringify(breakout)}`
    );
    reasoningTrace.push({ step: 2, tool: 'surface_conflicts', status: 'success', output: `Bias: ${conflicts.overallBias}. Conflict severity: ${conflicts.conflictSeverity}. Bullish signals: ${conflicts.bullishSignals?.length}, Bearish: ${conflicts.bearishSignals?.length}` });

    // STEP 3 — generate balanced recommendation
    const recommendation = await callAI(
      'You are a retail investor advisor. Never say buy or sell. Give data-backed balanced recommendations. Respond only in valid JSON with no markdown.',
      `Generate a balanced data-backed recommendation for a retail investor watching ${signal.symbol}. Must NOT be a binary call. Return ONLY valid JSON with: headline (12 words max summarizing the situation), balancedView (3 sentences presenting both sides with specific data points), keyMetricToWatch (one specific metric or price level to monitor), riskRewardSummary (one sentence on risk/reward without saying buy/sell), watchPoints (array of 3 specific things to monitor), confidenceInBreakout (0-100). All data: ${JSON.stringify(signal)}, Breakout: ${JSON.stringify(breakout)}, Conflicts: ${JSON.stringify(conflicts)}`
    );
    reasoningTrace.push({ step: 3, tool: 'balanced_recommendation', status: 'success', output: `Headline: ${recommendation.headline}. Confidence: ${recommendation.confidenceInBreakout}%` });

    return res.status(200).json({
      success: true,
      agentGoal: 'Detect breakout pattern, surface conflicting signals, generate balanced recommendation',
      stepsCompleted: 3,
      reasoningTrace,
      outputs: { signal, breakout, conflicts, recommendation }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, reasoningTrace });
  }
});

module.exports = router;