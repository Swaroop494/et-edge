// ET Edge — Live News Route. Returns latest Indian market headlines from NewsAPI with fallback to mock data.
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', async (req, res) => {
    console.log("Fetching live news...");
    try {
        const apiKey = process.env.NEWS_API_KEY || process.env.NEXT_PUBLIC_NEWS_API_KEY;
        if (!apiKey) {
            throw new Error("NewsAPI Key is missing in environment variables");
        }

        const query = encodeURIComponent('Sensex OR Nifty OR "NSE India" OR "Indian stock market"');
        const url = `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&language=en&pageSize=10&apiKey=${apiKey}`;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'ETEdge-Backend/1.0' }
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `NewsAPI responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'ok' && data.articles && data.articles.length > 0) {
            const articles = data.articles.map(article => ({
                title: article.title,
                source: article.source.name || "Unknown Source",
                url: article.url,
                publishedAt: article.publishedAt,
                description: article.description || ""
            }));
            console.log(`Live news fetched: ${articles.length} articles`);
            return res.status(200).json(articles);
        } else {
            throw new Error("Articles list empty or status not ok");
        }
    } catch (err) {
        console.error("NewsAPI failed, using mock data:", err.message);
        try {
            const mockDataPath = path.join(__dirname, "../../data/radar_events.json");
            const rawData = fs.readFileSync(mockDataPath, 'utf8');
            const mockData = JSON.parse(rawData);
            return res.status(200).json(mockData.events);
        } catch (fsErr) {
            return res.status(500).json({ error: "Failed to load news and mock data" });
        }
    }
});

module.exports = router;
