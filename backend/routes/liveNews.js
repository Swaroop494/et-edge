// ET Edge — Live News Route. Returns latest Indian market headlines from NewsAPI with fallback to mock data.
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', async (req, res) => {
    console.log("Fetching live news...");
    try {
        const url = `https://newsapi.org/v2/everything?q=NSE%20India%20stocks%20Sensex%20Nifty%20market&sortBy=publishedAt&language=en&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'ok' && data.articles && data.articles.length > 0) {
            const articles = data.articles.map(article => ({
                title: article.title,
                source: article.source.name,
                url: article.url,
                publishedAt: article.publishedAt,
                description: article.description || ""
            }));
            console.log(`Live news fetched: ${articles.length} articles`);
            return res.status(200).json(articles);
        } else {
            throw new Error("No articles found");
        }
    } catch (err) {
        console.log("NewsAPI failed, using mock data:", err.message);
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
