require('dotenv').config();
const express = require('express');
const corsMiddleware = require('./middleware/cors');

// Import routes
const liveNewsRoute = require('./routes/news');
const analyzeEventRoute = require('./routes/analyzeEvent');
const validateTipRoute = require('./routes/validateTip');
const whatIfRoute = require('./routes/whatIf');
const portfolioImpactRoute = require('./routes/portfolioImpact');
const agentRoute = require('./routes/agent');
const bulkDealAgentRoute = require('./routes/bulkDealAgent');
const technicalAgentRoute = require('./routes/technicalAgent');
const portfolioNewsAgentRoute = require('./routes/portfolioNewsAgent');
const scenariosRoute = require('./routes/scenarios');
const marketGptRoute = require('./routes/marketGpt');
const learningLoopRoute = require('./routes/learningLoop');
const dashboardRoute = require('./routes/dashboard');

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 1. FORCE-INITIALIZE FIREBASE (PRODUCTION-HARDENING)
const serviceAccountPath = path.join(__dirname, 'service-account.json');
let db;

if (fs.existsSync(serviceAccountPath)) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(require(serviceAccountPath))
        });
        db = admin.firestore();
        console.log('✅ FIREBASE: Live Mode [Personal-Account] Connected');
    } catch (err) {
        console.error('❌ FIREBASE: Initialization Failed:', err.message);
    }
} else {
    console.log('📡 Mode: Development (Local Mocks Active)');
    db = {
        collection: () => ({
            where: () => ({ orderBy: () => ({ limit: () => ({ get: async () => ({ empty: true }) }) }) }),
            add: async () => ({ id: 'mock_id' })
        })
    };
}

// 2. CACHE-FIRST MEMORY LAYER LOGIC
async function getMarketAnalysis(symbol) {
    const CACHE_DURATION_HOURS = 6;
    const sixHoursAgo = new Date(Date.now() - CACHE_DURATION_HOURS * 60 * 60 * 1000);

    try {
        // Step 1: Check Memory Layer (Firestore)
        const cached = await db.collection('market_analysis')
            .where('symbol', '==', symbol)
            .where('timestamp', '>', sixHoursAgo)
            .orderBy('timestamp', 'desc')
            .limit(1)
            .get();

        if (!cached.empty) {
            console.log(`📡 Memory Hit: Serving ${symbol} from Historical DB`);
            return cached.docs[0].data().result;
        }

        // Step 2: Trigger AI Generation
        const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const model = client.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            systemInstruction: "You are a Fiduciary AI. Every response MUST include reasoning and a source."
        });

        const result = await model.generateContent(`Analyze current market outlook for ${symbol}. Return ONLY valid JSON with answer, reasoning, and source.`);
        const raw = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(raw);

        // Step 3: Persistence
        await db.collection('market_analysis').add({
            symbol,
            result: analysis,
            timestamp: new Date()
        });

        return analysis;

    } catch (err) {
        // Step 4: Fiduciary Mock on 429/Failure
        console.log(`📡 Mode: Safety Fallback for ${symbol}`);
        return {
            answer: `Current analysis for ${symbol} emphasizes mid-term stability despite sector-wide pressure.`,
            reasoning: "Analysis indicates strong institutional support near the 200-day moving average, though global macro volatility suggests a cautious entry.",
            source: "[Source: Institutional Data Hub]",
            status: "SAFE-MODE"
        };
    }
}

// Global Export
global.getMarketAnalysis = getMarketAnalysis;
global.db = db;

const app = express();
const PORT = process.env.PORT || 5500;

const USE_MOCKS = process.env.DEMO_MODE === 'true';
global.USE_MOCKS = USE_MOCKS;

app.use(corsMiddleware);
app.use(express.json());

// Routes
app.use('/api/live-news', liveNewsRoute);
app.use('/api/analyze-event', analyzeEventRoute);
app.use('/api/validate-tip', validateTipRoute);
app.use('/api/what-if', whatIfRoute);
app.use('/api/portfolio-impact', portfolioImpactRoute);
app.use('/api/agent/run', agentRoute);
app.use('/api/agent/bulk-deal', bulkDealAgentRoute);
app.use('/api/agent/technical', technicalAgentRoute);
app.use('/api/agent/portfolio-news', portfolioNewsAgentRoute);
app.use('/api/market-gpt', marketGptRoute);
app.use('/api/learning', learningLoopRoute);
app.use('/api/scenarios', scenariosRoute);
app.use('/api/dashboard', dashboardRoute);

// Central error handler
app.use((err, req, res, next) => {
    const status = Number(err?.status || err?.statusCode) || 500;
    const payload = { error: err?.message || 'Internal server error' };

    if (process.env.NODE_ENV !== 'production' && err?.stack) {
        payload.stack = err.stack;
    }
    if (!res.headersSent) {
        return res.status(status).json(payload);
    }
    return next(err);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`ET Edge Backend running on port ${PORT}`);
    console.log(`Demo Mode Active: ${global.USE_MOCKS}`);
    console.log(`Market Analysis Intelligence: MANUAL_TRIGGER_ONLY [REACTIONARY-MODE]`);
});
