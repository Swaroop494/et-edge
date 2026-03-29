const { db } = require('./firebase');
const { callAI } = require('./aiService');

/**
 * ET Edge Scenario Generator
 * Fully agentic service that picks top signals and generates 3 distinct analysis paths using OpenAI.
 */
async function generateAgenticScenarios() {
  // 1. SIGNAL SELECTION
  // Fetch top 30 signals from Opportunity Radar
  const signalsSnapshot = await db.collection('market_signals')
    .orderBy('timestamp', 'desc')
    .limit(30)
    .get();

  const highImpactPool = [];
  signalsSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.is_video_worthy) {
      highImpactPool.push({ id: doc.id, ...data });
    }
  });

  if (highImpactPool.length === 0) {
    throw new Error("Insufficient high-impact signals found in the market_signals collection.");
  }

  // Use OpenAI to 'Rank' them based on Retail Investor Impact
  const rankingSystem = "You are the ET Edge Ranking Agent. Rank Indian market signals based on retail investor urgency. Respond in valid JSON.";
  const rankingPrompt = `
    Rank these signals based on liquidity hazards, promoter exits, or massive breakout momentum.
    SIGNALS POOL: ${JSON.stringify(highImpactPool.slice(0, 10))}
    Return ONLY a valid JSON array of the top 3 IDs in order of importance. 
    Format: ["id1", "id2", "id3"]
  `;

  const topIds = await callAI(rankingSystem, rankingPrompt);
  const topSignal = highImpactPool.find(s => s.id === topIds[0]) || highImpactPool[0];

  // 2. THE 3-PATH GENERATION
  const pathSystem = "You are the ET Edge Scenario Architect. Generate 3 distinct market paths. Respond in valid JSON.";
  const pathPrompt = `
    Analyze this market signal: ${JSON.stringify(topSignal)}. 
    Generate 3 paths: pathA (Promoter/Bulk), pathB (Technical), pathC (Ripple Effect/Portfolio).
    For each path, return: title, narrative, ai_prediction (number -10 to 10), and reasoning.
    Return JSON with keys: pathA, pathB, pathC.
  `;

  const scenarios = await callAI(pathSystem, pathPrompt);

  // 3. LEARNING LOOP INTEGRATION
  const logEntries = await Promise.all(['pathA', 'pathB', 'pathC'].map(async (key) => {
    const scenario = scenarios[key];
    const logData = {
      eventId: topSignal.id,
      prediction: scenario.ai_prediction,
      actual: null,
      status: 'pending',
      metadata: {
        path: key,
        scenarioTitle: scenario.title,
        narrative: scenario.narrative,
        reasoning: scenario.reasoning,
        symbol: topSignal.symbol,
        fullSignal: topSignal
      },
      timestamp: new Date()
    };
    const logRef = await db.collection('learning_logs').add(logData);
    return { ...logData, logId: logRef.id };
  }));

  return {
    topSignal,
    scenarios: {
      pathA: { ...scenarios.pathA, logId: logEntries[0].logId },
      pathB: { ...scenarios.pathB, logId: logEntries[1].logId },
      pathC: { ...scenarios.pathC, logId: logEntries[2].logId }
    }
  };
}

module.exports = { generateAgenticScenarios };
