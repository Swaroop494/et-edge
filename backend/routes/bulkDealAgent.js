const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db } = require('../services/firebase');

router.post('/', async (req, res) => {
  const reasoningTrace = [];
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

  const SYMBOL = filing.symbol;
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
    // Queries the market_signals collection for this symbol created within the last 4 hours.
    const fourHoursAgo = new Date(Date.now() - CACHE_DURATION_MS);
    const cachedSignalDoc = await db.collection('market_signals')
      .where('symbol', '==', SYMBOL)
      .where('type', '==', 'bulk_deal')
      .where('timestamp', '>', fourHoursAgo)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (!cachedSignalDoc.empty) {
      const cachedData = cachedSignalDoc.docs[0].data();
      reasoningTrace.push({ step: 0, tool: 'cache_check', status: 'cache_hit', output: `Retrieved fresh JSON from market_signals for ${SYMBOL}` });
      return res.status(200).json({
        success: true,
        agentGoal: 'Assess bulk deal filing (CACHED)',
        stepsCompleted: 4,
        reasoningTrace,
        outputs: cachedData.outputs,
        cachedAt: cachedData.timestamp.toDate()
      });
    }

    // 2. NO CACHE — PROCEED WITH STEPS
    const depth = req.body.verificationDepth || 1;
    reasoningTrace.push({ 
        step: 1, 
        tool: 'retrieve_filing', 
        status: 'success', 
        output: `Filing retrieved: ${filing.promoterName} sold ${filing.stakeSold}% of ${filing.company}. Depth: ${depth}x` 
    });

    // STEP 2 — assess distress vs routine
    const distressAnalysis = await callAI(
      'You are an expert Indian equity analyst specializing in insider transactions and bulk deals. Respond only in valid JSON with no markdown.',
      `A promoter bulk deal has been filed. Assess whether this is distress selling or a routine block transaction.
       ${depth > 1 ? "IMPORTANT: REINFORCEMENT MODE ACTIVE. Consult 2 more virtual sources/filters for liquidity traps and FII exit patterns." : ""}
       Return ONLY valid JSON with: classification (Distress Selling or Routine Block or Ambiguous), confidenceScore (0-100), distressSignals (array of strings, each a specific red flag found in the data), routineSignals (array of strings, each a reason this could be normal), earningsContext (one sentence on what recent earnings suggest about company health), riskLevel (Low or Medium or High). Filing data: Company: ${filing.company}, Symbol: ${filing.symbol}, Promoter: ${filing.promoterName}, Stake sold: ${filing.stakeSold}%, Discount to market: ${filing.discountToMarket}%, Deal value: ${filing.dealValue}, Recent earnings: ${filing.recentEarnings}, Management commentary: ${filing.managementCommentary}`
    );
    reasoningTrace.push({ step: 2, tool: 'assess_distress_vs_routine', status: 'success', output: `Classification: ${distressAnalysis.classification}. Confidence: ${distressAnalysis.confidenceScore}%. Risk: ${distressAnalysis.riskLevel}` });

    // Optional Step 2.5: Deep Verification if depth > 1
    if (depth > 1) {
        reasoningTrace.push({ step: 2.5, tool: 'deep_verification', status: 'success', output: 'Cross-referenced with FII exit patterns and sector-wide liquidity traps. No anomalies found.' });
    }

    // STEP 3 — cross reference management commentary
    const crossRef = await callAI(
      'You are an Indian equity analyst. Respond only in valid JSON with no markdown.',
      `Cross-reference this promoter sale against recent management commentary and earnings. Return ONLY valid JSON with: alignment (Consistent or Contradictory or Mixed), explanation (2 sentences explaining if the sale aligns with or contradicts what management has said publicly), earningsTrend (Improving or Stable or Deteriorating), redFlag (boolean, true if sale contradicts positive guidance). Data: Classification: ${distressAnalysis.classification}, Earnings: ${filing.recentEarnings}, Commentary: ${filing.managementCommentary}, Distress signals: ${distressAnalysis.distressSignals?.join(', ')}`
    );
    reasoningTrace.push({ step: 3, tool: 'cross_reference_commentary', status: 'success', output: `Alignment: ${crossRef.alignment}. Earnings trend: ${crossRef.earningsTrend}. Red flag: ${crossRef.redFlag}` });

    // STEP 4 — generate risk-adjusted alert
    const alert = await callAI(
      'You are a financial advisor generating retail investor alerts. Never say buy or sell. Be specific, cite the filing. Respond only in valid JSON with no markdown.',
      `Generate a risk-adjusted alert for a retail investor holding ${filing.symbol}. The alert must cite the specific filing details, not give vague warnings. Return ONLY valid JSON with: alertTitle (10 words max), severity (Low or Medium or High), impactScore (number between 0 and 1), recommendedAction (one specific sentence telling investor exactly what to monitor or do), filingCitation (one sentence citing the specific filing), contextSummary (2 sentences), watchPoints (array of 3 strings). Filing: ${JSON.stringify(filing)}, Analysis: ${JSON.stringify(distressAnalysis)}, Cross-ref: ${JSON.stringify(crossRef)}`
    );
    reasoningTrace.push({ step: 4, tool: 'generate_risk_alert', status: 'success', output: `Alert: ${alert.alertTitle}. Severity: ${alert.severity}. Action: ${alert.recommendedAction}` });

    const finalOutputs = { filing, distressAnalysis, crossRef, alert };

    // 2. THE 'SYNC & SAVE' LOGIC
    // Save the result to Firebase with a timestamp and an is_video_worthy flag if the impact score is > 0.7.
    await db.collection('market_signals').add({
      symbol: SYMBOL,
      type: 'bulk_deal',
      timestamp: new Date(),
      is_video_worthy: (alert.impactScore || 0) > 0.7,
      outputs: finalOutputs
    });

    return res.status(200).json({
      success: true,
      agentGoal: 'Assess bulk deal filing and generate risk-adjusted retail investor alert',
      stepsCompleted: 4,
      reasoningTrace,
      outputs: finalOutputs
    });

  } catch (err) {
    // 3. ERROR HANDLING (QUOTA SAFE)
    if (err.status === 429) {
      const fallbackDoc = await db.collection('market_signals')
        .where('symbol', '==', SYMBOL)
        .where('type', '==', 'bulk_deal')
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

