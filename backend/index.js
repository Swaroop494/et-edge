require('dotenv').config();
const express = require('express');
const corsMiddleware = require('./middleware/cors');

// Import routes
const liveNewsRoute = require('./routes/liveNews');
const analyzeEventRoute = require('./routes/analyzeEvent');
const validateTipRoute = require('./routes/validateTip');
const whatIfRoute = require('./routes/whatIf');
const portfolioImpactRoute = require('./routes/portfolioImpact');
const agentRoute = require('./routes/agent');

const app = express();
const PORT = process.env.PORT || 5000;
const NEWS_FETCH_INTERVAL_MS = 900000;

// Middleware
app.use(express.json());
app.use(corsMiddleware);
app.locals.newsFetchIntervalMs = NEWS_FETCH_INTERVAL_MS;
app.locals.newsCache = {
    data: null,
    fetchedAt: 0
};

// Routes
app.use('/api/live-news', liveNewsRoute);
app.use('/api/analyze-event', analyzeEventRoute);
app.use('/api/validate-tip', validateTipRoute);
app.use('/api/what-if', whatIfRoute);
app.use('/api/portfolio-impact', portfolioImpactRoute);
app.use('/api/agent/run', agentRoute);

// Central error handler — always JSON (agent runner contract)
// Do not swallow errors; surface real messages.
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

app.listen(PORT, () => {
    console.log(`ET Edge Backend running on port ${PORT}`);
    console.log(`News fetch interval set to ${NEWS_FETCH_INTERVAL_MS}ms`);
});
