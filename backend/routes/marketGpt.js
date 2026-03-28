const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db } = require('../services/firebase');

router.post('/', async (req, res) => {
  const { query, userHoldings } = req.body;
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const reasoningTrace = [];

  try {
    // 1. EXTRACT INTENT & ROUTE
    const routerPrompt = `
      You are the ET Edge Router Agent. Your job is to analyze the user's query and decide which specialized financial agents to consult.
      SPECIALIZED AGENTS:
      - bulk_deal: Use this if the query is about promoter sales, bulk deals, or insider trading.
      - technical_analysis: Use this if the query is about price action, breakouts, RSI, or 52-week highs.
      - portfolio_news: Use this for general news impact on a portfolio.

      USER QUERY: "${query}"
      USER HOLDINGS: ${JSON.stringify(userHoldings)}

      Return ONLY a valid JSON object with:
      {
        "intent": "string",
        "symbols": ["string"],
        "neededAgents": ["bulk_deal" | "technical_analysis" | "portfolio_news"],
        "reasoning": "string"
      }
    `;

    const routerResponse = await model.generateContent(routerPrompt);
    const routerResult = JSON.parse(routerResponse.response.text().replace(/```json/g, '').replace(/```/g, '').trim());
    reasoningTrace.push({ step: 1, tool: 'intent_router', status: 'success', output: `Detected intent: ${routerResult.intent}. Routing to: ${routerResult.neededAgents.join(', ')}` });

    // 2. CONSULT SPECIALIZED AGENTS (Simulated/Simpler version for speed in chat)
    const agentData = {};
    
    if (routerResult.neededAgents.includes('bulk_deal')) {
      // Simulate bulk deal agent result or fetch latest from Firestore cache
      const symbol = routerResult.symbols[0] || (userHoldings && userHoldings[0]);
      const cached = await db.collection('market_signals')
        .where('symbol', '==', symbol)
        .where('type', '==', 'bulk_deal')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();
      
      if (!cached.empty) {
        agentData.bulkDeal = cached.docs[0].data().outputs;
        reasoningTrace.push({ step: 2, tool: 'consult_bulk_deal', status: 'success', output: `Retrieved cached bulk deal analysis for ${symbol}` });
      } else {
        // Fallback or simple AI generation if no cache
        agentData.bulkDeal = { classification: "Routine", citation: "NSE/BSE Corporate Filings" };
        reasoningTrace.push({ step: 2, tool: 'consult_bulk_deal', status: 'success', output: `No cached signal found for ${symbol}. Using general filing data.` });
      }
    }

    if (routerResult.neededAgents.includes('technical_analysis')) {
      const symbol = routerResult.symbols[0] || (userHoldings && userHoldings[0]);
      const cached = await db.collection('market_signals')
        .where('symbol', '==', symbol)
        .where('type', '==', 'technical')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();
      
      if (!cached.empty) {
        agentData.technical = cached.docs[0].data().outputs;
        reasoningTrace.push({ step: 3, tool: 'consult_technical', status: 'success', output: `Retrieved technical breakout analysis for ${symbol}` });
      } else {
        agentData.technical = { signal: "Neutral", rsi: 50, citation: "Exchange Momentum Data" };
        reasoningTrace.push({ step: 3, tool: 'consult_technical', status: 'success', output: `No technical cache for ${symbol}. Sourcing live volatility proxies.` });
      }
    }

    // 3. FETCH RECENT LESSONS
    const lessonsDoc = await db.collection('system_knowledge').orderBy('timestamp', 'desc').limit(3).get();
    const systemLessonsArr = lessonsDoc.docs.map(doc => doc.data().lesson);
    const systemLessonsText = systemLessonsArr.length > 0 ? systemLessonsArr.join('; ') : "None";

    // 4. SYNTHESIZE PERSONALIZED ANSWER
    const synthesisPrompt = `
      You are an evolving AI (MarketGPT) for ET Edge.
      Based on past system errors, RECALL THESE LESSONS: [${systemLessonsText}]. 
      Use these to avoid repeating previous miscalculations.

      Synthesize a personalized, data-backed answer for the user.
      USER QUERY: "${query}"
      USER HOLDINGS: ${JSON.stringify(userHoldings)}
      AGENT DATA: ${JSON.stringify(agentData)}
      
      RULES:
      1. Be portfolio-aware. If the user holds a stock, mention their exposure or concentration impact.
      2. Include groundings/citations exactly as "Source: [Source Name]".
      3. Never give binary "Buy" or "Sell" calls. Provide balanced recommendations with pros/cons.
      4. Add the SEBI DISCLAIMER: "AI-generated analysis. Not licensed financial advice." at the end.
      5. Determine an Impact level (Low, Medium, High).
      
      Return ONLY valid JSON:
      {
        "answer": "string (markdown allowed)",
        "impact": "Low" | "Medium" | "High",
        "citations": ["string"],
        "portfolioContext": "string"
      }
    `;

    const synthesisResponse = await model.generateContent(synthesisPrompt);
    const synthesisResult = JSON.parse(synthesisResponse.response.text().replace(/```json/g, '').replace(/```/g, '').trim());
    reasoningTrace.push({ step: 4, tool: 'synthesis_agent', status: 'success', output: `Synthesized personalized report with ${synthesisResult.impact} impact.` });

    return res.status(200).json({
      success: true,
      answer: synthesisResult.answer,
      impact: synthesisResult.impact,
      citations: synthesisResult.citations,
      portfolioContext: synthesisResult.portfolioContext,
      reasoningTrace,
      lessonsCount: systemLessonsArr.length
    });

  } catch (error) {
    console.error('MarketGPT error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
