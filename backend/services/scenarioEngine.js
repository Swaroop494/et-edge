const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db } = require('./firebase');

/**
 * ET Edge Scenario Engine
 * Input-Agnostic and Generative: Accepts raw signals or picks the highest-impact signal to analyze.
 */
async function generateDynamicScenario(inputSignal = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  const client = new GoogleGenerativeAI(apiKey);
  const flashModel = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const proModel = client.getGenerativeModel({ model: 'gemini-1.5-pro' });

  let targetSignal = inputSignal;

  // 1. THE 'ANY-SIGNAL' PARSER
  // If no inputSignal is provided, fetch the latest 'High-Impact' signal from the database cache.
  if (!targetSignal) {
    const signalsSnapshot = await db.collection('market_signals')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();

    const highImpactSignals = [];
    signalsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.is_video_worthy) highImpactSignals.push({ id: doc.id, ...data });
    });

    if (highImpactSignals.length === 0) {
      throw new Error("No high-impact signals found in the database for auto-generation.");
    }
    // Select the latest high-impact one
    targetSignal = highImpactSignals[0];
  }

  // 2. TRIPLE-AXIS ANALYSIS (Triple-Perspective Logic)
  // AI evaluates the signal through three core fiduciary lenses.
  const analysisPrompt = `
    You are the ET Edge Scenario Engine. Analyze the following Indian market signal.
    SIGNAL: ${JSON.stringify(targetSignal)}
    
    You must generate a 'Triple-Axis Analysis' consisting of three distinct perspectives:

    Lens 1 (Bulk/Block Perspective): Identify the 'Money Movers'. Is this institutional, promoter, or high-net-worth activity?
    Lens 2 (Technical Perspective): What are the key Support and Resistance levels for the symbols mentioned in this event?
    Lens 3 (Portfolio Perspective): How does this impact the risk of a diversified Indian retail investor (e.g. mutual fund holder or blue-chip investor)?

    For each lens, provide:
    - title: Catchy title (5 words max)
    - analysis: Detailed 1-2 sentence fiduciary read.
    - predictionScore: Predicted impact (-10 to 10 as a number).
    - keyInsight: One-sentence "bottom line" for the investor.

    Return ONLY a valid JSON object with keys: bulkBlockRead, technicalRead, portfolioRead.
  `;

  const result = await flashModel.generateContent(analysisPrompt);
  const rawContent = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
  const axisAnalyses = JSON.parse(rawContent);

  // 3. LEARNING LOOP CONNECTION
  // Automatically create 'Prediction Logs' for this scenario to prove the system learns from even unexpected events.
  const auditEntries = await Promise.all(['bulkBlockRead', 'technicalRead', 'portfolioRead'].map(async (key) => {
    const analysis = axisAnalyses[key];
    const predictionLog = {
      eventId: targetSignal.id || 'manual_trigger',
      prediction: analysis.predictionScore,
      actual: null, // Awaiting 24h audit
      status: 'pending',
      metadata: {
        axis: key,
        signalSource: targetSignal.id ? 'DB_SIGNAL' : 'JUDGE_PROMPT',
        title: analysis.title,
        analysis: analysis.analysis,
        bottomLine: analysis.keyInsight,
        symbol: targetSignal.symbol || 'NIFTY'
      },
      timestamp: new Date()
    };
    const logRef = await db.collection('learning_logs').add(predictionLog);
    return { ...predictionLog, logId: logRef.id };
  }));

  return {
    originalSignal: targetSignal,
    tripleAxis: {
      bulkBlock: { ...axisAnalyses.bulkBlockRead, logId: auditEntries[0].logId },
      technical: { ...axisAnalyses.technicalRead, logId: auditEntries[1].logId },
      portfolio: { ...axisAnalyses.portfolioRead, logId: auditEntries[2].logId }
    }
  };
}

module.exports = { generateDynamicScenario };
