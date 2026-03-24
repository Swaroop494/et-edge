require('dotenv').config();
const express = require('express');
const corsMiddleware = require('./middleware/cors');

// Import routes
const liveNewsRoute = require('./routes/liveNews');
const analyzeEventRoute = require('./routes/analyzeEvent');
const validateTipRoute = require('./routes/validateTip');
const portfolioImpactRoute = require('./routes/portfolioImpact');

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
app.use('/api/portfolio-impact', portfolioImpactRoute);

app.listen(PORT, () => {
    console.log(`ET Edge Backend running on port ${PORT}`);
    console.log(`News fetch interval set to ${NEWS_FETCH_INTERVAL_MS}ms`);
});
