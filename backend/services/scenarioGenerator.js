const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db } = require('./firebase');

/**
 * ET Edge Scenario Generator
 * Fully agentic service that picks top signals and generates 3 distinct analysis paths.
 */
async function generateAgenticScenarios() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  const client = new GoogleGenerativeAI(apiKey);
  const proModel = client.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const flashModel = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // 1. SIGNAL SELECTION
  // Fetch top 5 'High Importance' signals from Opportunity Radar (marked is_video_worthy in our code)
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

  // Use Gemini 1.5 Pro to 'Rank' them based on Retail Investor Impact
  const rankingPrompt = `
    You are the ET Edge Ranking Agent. Below are high-impact Indian market signals.
    Rank them based on their direct relevance and urgency for a typical Retail Investor.
    Consider the following: liquidity hazards, promoter exits, and massive breakout momentum.
    
    SIGNALS POOL: ${JSON.stringify(highImpactPool.slice(0, 10))}
    
    Return ONLY a valid JSON array of the top 5 Signal IDs in order of importance. No text outside the JSON.
    Format: ["id1", "id2", "id3", "id4", "id5"]
  `;

  const rankingRes = await proModel.generateContent(rankingPrompt);
  const rawRanking = rankingRes.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
  const topIds = JSON.parse(rawRanking);
  
  // Pick the #1 ranked signal
  const topSignal = highImpactPool.find(s => s.id === topIds[0]);

  // 2. THE 3-PATH GENERATION
  const pathPrompt = `
    You are the ET Edge Scenario Architect. 
    Analyze the following market signal and generate 3 distinct real-time scenarios (paths).
    
    SIGNAL: ${JSON.stringify(topSignal)}
    
    PATHS TO GENERATE:
    1. Path A (The Bulk Deal Logic): Evaluate promoter intent and buyer quality. Is this a healthy hand-off or a distress dump?
    2. Path B (The Technical Logic): Verify breakout strength using typical RSI/Moving Average data points. Is it overbought?
    3. Path C (The Portfolio Logic): Simulate the 'Ripple Effect' on a sample investor portfolio with high sector concentration.
    
    FOR EACH PATH, RETURN:
    - title: Short catchy title (6-8 words)
    - narrative: Concise 1-sentence description.
    - ai_prediction: Estimated market impact percentage (-10 to 10 as a number).
    - reasoning: 1-sentence technical justification.
    
    Return ONLY a valid JSON object with keys: pathA, pathB, pathC.
  `;

  const pathRes = await flashModel.generateContent(pathPrompt);
  const rawPaths = pathRes.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
  const scenarios = JSON.parse(rawPaths);

  // 3. LEARNING LOOP INTEGRATION
  // For each dynamic scenario, store the 'AI Prediction' in learning_logs
  const logEntries = await Promise.all(['pathA', 'pathB', 'pathC'].map(async (key) => {
    const scenario = scenarios[key];
    const logData = {
      eventId: topSignal.id,
      prediction: scenario.ai_prediction,
      actual: null, // Null indicates awaiting 'Track Actual' manual/auto audit
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
