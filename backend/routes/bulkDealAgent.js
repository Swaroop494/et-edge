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
    const filing = req.body.filing || {
      company: "Marico Ltd",
      symbol: "MARICO",
      promoterName: "Harsh Mariwala Family Trust",
      stakeSold: 4.2,
      discountToMarket: 6,
      dealValue: "₹312 Cr",
      date: "2026-03-24",
      recentEarnings: "Q3 PAT up 8% YoY, volume growth 4%",
      managementCommentary: "Management guided for steady growth in rural markets"
    };

    // STEP 1 — retrieve and parse filing
    reasoningTrace.push({ step: 1, tool: 'retrieve_filing', status: 'success', output: `Filing retrieved: ${filing.promoterName} sold ${filing.stakeSold}% of ${filing.company} at ${filing.discountToMarket}% discount. Deal value: ${filing.dealValue}` });

    // STEP 2 — assess distress vs routine
    const distressAnalysis = await callAI(
      'You are an expert Indian equity analyst specializing in insider transactions and bulk deals. Respond only in valid JSON with no markdown.',
      `A promoter bulk deal has been filed. Assess whether this is distress selling or a routine block transaction. Return ONLY valid JSON with: classification (Distress Selling or Routine Block or Ambiguous), confidenceScore (0-100), distressSignals (array of strings, each a specific red flag found in the data), routineSignals (array of strings, each a reason this could be normal), earningsContext (one sentence on what recent earnings suggest about company health), riskLevel (Low or Medium or High). Filing data: Company: ${filing.company}, Symbol: ${filing.symbol}, Promoter: ${filing.promoterName}, Stake sold: ${filing.stakeSold}%, Discount to market: ${filing.discountToMarket}%, Deal value: ${filing.dealValue}, Recent earnings: ${filing.recentEarnings}, Management commentary: ${filing.managementCommentary}`
    );
    reasoningTrace.push({ step: 2, tool: 'assess_distress_vs_routine', status: 'success', output: `Classification: ${distressAnalysis.classification}. Confidence: ${distressAnalysis.confidenceScore}%. Risk: ${distressAnalysis.riskLevel}` });

    // STEP 3 — cross reference management commentary
    const crossRef = await callAI(
      'You are an Indian equity analyst. Respond only in valid JSON with no markdown.',
      `Cross-reference this promoter sale against recent management commentary and earnings. Return ONLY valid JSON with: alignment (Consistent or Contradictory or Mixed), explanation (2 sentences explaining if the sale aligns with or contradicts what management has said publicly), earningsTrend (Improving or Stable or Deteriorating), redFlag (boolean, true if sale contradicts positive guidance). Data: Classification: ${distressAnalysis.classification}, Earnings: ${filing.recentEarnings}, Commentary: ${filing.managementCommentary}, Distress signals: ${distressAnalysis.distressSignals?.join(', ')}`
    );
    reasoningTrace.push({ step: 3, tool: 'cross_reference_commentary', status: 'success', output: `Alignment: ${crossRef.alignment}. Earnings trend: ${crossRef.earningsTrend}. Red flag: ${crossRef.redFlag}` });

    // STEP 4 — generate risk-adjusted alert
    const alert = await callAI(
      'You are a financial advisor generating retail investor alerts. Never say buy or sell. Be specific, cite the filing. Respond only in valid JSON with no markdown.',
      `Generate a risk-adjusted alert for a retail investor holding ${filing.symbol}. The alert must cite the specific filing details, not give vague warnings. Return ONLY valid JSON with: alertTitle (10 words max), severity (Low or Medium or High), recommendedAction (one specific sentence — not buy/sell — telling investor exactly what to monitor or do), filingCitation (one sentence citing the specific filing: who sold, how much, at what discount, on what date), contextSummary (2 sentences combining earnings context and management commentary alignment), watchPoints (array of 3 strings, each a specific thing to monitor in coming weeks). Filing: ${JSON.stringify(filing)}, Analysis: ${JSON.stringify(distressAnalysis)}, Cross-ref: ${JSON.stringify(crossRef)}`
    );
    reasoningTrace.push({ step: 4, tool: 'generate_risk_alert', status: 'success', output: `Alert: ${alert.alertTitle}. Severity: ${alert.severity}. Action: ${alert.recommendedAction}` });

    return res.status(200).json({
      success: true,
      agentGoal: 'Assess bulk deal filing and generate risk-adjusted retail investor alert',
      stepsCompleted: 4,
      reasoningTrace,
      outputs: { filing, distressAnalysis, crossRef, alert }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, reasoningTrace });
  }
});

module.exports = router;
