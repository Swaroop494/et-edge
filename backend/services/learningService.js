const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db } = require('./firebase');

/**
 * ET Edge Recursive Auditor
 * Performs a 'Post-Mortem' on an AI prediction to identify blind spots and generate refinement rules.
 */
async function refineIntelligence(logId, prediction, actual, metadata) {
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const eventDescription = metadata?.eventDescription || "Market Event Signal";
  const sector = metadata?.sector || "General Market";

  const prompt = `
    You are the ET Edge Recursive Auditor. Your job is to perform a 'Post-Mortem' on an AI prediction.
    
    Data Provided:
    - Original Event: [${eventDescription}]
    - AI's Prediction: [${prediction}% impact forecast]
    - Actual Market Reality: [${actual}% change observed]
    - Metadata: ${JSON.stringify(metadata)}

    Your Task:
    1. Identify the Blind Spot. Did the AI miss a specific variable (e.g., dividend announcement, short-covering, or a technical support level)?
    2. Generate a 'System Refinement Rule'. This must be a one-sentence instruction for future AI calls.
    
    Format: Return ONLY valid JSON with no markdown:
    {
      "blind_spot": "...",
      "refinement_rule": "In future [Sector] events, always cross-reference [Variable] before final impact scoring.",
      "severity": "Low" | "Medium" | "High",
      "confidence": number (0-100)
    }
  `;

  try {
    const response = await model.generateContent(prompt);
    const rawContent = response.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(rawContent);

    // Save refinement to the original log
    await db.collection('learning_logs').doc(logId).update({
      refinement: result,
      status: 'completed'
    });

    // Inject refined knowledge into system_knowledge for prompt injection
    await db.collection('system_knowledge').add({
      logId,
      lesson: result.refinement_rule,
      blindSpot: result.blind_spot,
      sector: sector,
      timestamp: new Date()
    });

    console.log(`[Recursive Auditor] Refined Intelligence for Log ${logId}: ${result.refinement_rule}`);
    return result;

  } catch (error) {
    console.error('[Recursive Auditor] Error in post-mortem analysis:', error);
    await db.collection('learning_logs').doc(logId).update({
      status: 'failed',
      error: error.message
    });
    throw error;
  }
}

module.exports = {
  refineIntelligence
};
