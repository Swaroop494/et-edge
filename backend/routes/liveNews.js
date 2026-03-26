// ET Edge — Live News Route. Returns latest Indian market headlines from NewsAPI with fallback to mock data.
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const CACHE_FILE = path.join(__dirname, "../data/news_cache.json");
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

router.get('/', async (req, res) => {
    console.log("Processing live news with batch analysis...");
    const now = Date.now();

    // Task 2: Smart File Caching
    try {
        if (fs.existsSync(CACHE_FILE)) {
            const rawContent = fs.readFileSync(CACHE_FILE, 'utf8').trim();
            if (rawContent) {
                const cacheData = JSON.parse(rawContent);
                if (now - cacheData.fetchedAt < CACHE_DURATION_MS && cacheData.articles) {
                    console.log("Serving news from file cache.");
                    return res.status(200).json(cacheData.articles);
                }
            }
        }
    } catch (cacheErr) {
        console.warn("Cache read error, continuing to fresh fetch:", cacheErr.message);
    }

    try {
        const apiKey = process.env.NEWS_API_KEY || process.env.NEXT_PUBLIC_NEWS_API_KEY;
        if (!apiKey) throw new Error("NewsAPI Key is missing");

        const query = encodeURIComponent('Sensex OR Nifty OR "NSE India" OR "Indian stock market"');
        const url = `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&language=en&pageSize=10&apiKey=${apiKey}`;

        const newsResponse = await fetch(url, { headers: { 'User-Agent': 'ETEdge-Backend/1.0' } });
        if (!newsResponse.ok) throw new Error(`NewsAPI error: ${newsResponse.status}`);

        const data = await newsResponse.json();
        const articles = data.articles || [];
        if (articles.length === 0) throw new Error("No articles found");

        // Task 1: Batch Analysis with Gemini 2.5 Flash Lite
        if (process.env.GEMINI_API_KEY) {
            console.log('Gemini initialized with Server Key');
        }
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash-lite",
            systemInstruction: "You are an Indian financial news analyst. Analyze the provided list of news titles and descriptions. For each one, determine the market sentiment (Positive, Negative, or Neutral) and an impact score (0-100). Return exactly a JSON array of objects with fields: title (original), sentiment (string), impactScore (number), and reasoning (one short simple English sentence)."
        });

        const batchPrompt = `Analyze these 10 news items and return a JSON array: ${JSON.stringify(articles.map(a => ({ title: a.title, description: a.description })))}`;

        // Task 3: Rate Limiting Queue (Wait 2s if multiple fast refreshes occur before cache)
        await sleep(2000); 

        const result = await model.generateContent(batchPrompt);
        const analysisText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const analyzedData = JSON.parse(analysisText);

        // Merge news source data with AI analysis
        const richArticles = articles.map((article, index) => ({
            ...article,
            source: article.source.name || "Unknown",
            aiAnalysis: analyzedData[index] || { sentiment: "Neutral", impactScore: 50, reasoning: "Analysis unavailable." }
        }));

        // Save to cache
        fs.writeFileSync(CACHE_FILE, JSON.stringify({ fetchedAt: now, articles: richArticles }), 'utf8');
        
        console.log(`Live news batch analysis complete: ${richArticles.length} items`);
        return res.status(200).json(richArticles);

    } catch (err) {
        console.error("Batch news analysis failed, using fallback:", err.message);
        try {
            const mockDataPath = path.join(__dirname, "../../data/radar_events.json");
            const rawMock = JSON.parse(fs.readFileSync(mockDataPath, 'utf8')).events;
            return res.status(200).json(rawMock);
        } catch (fsErr) {
            return res.status(500).json({ error: "No data available." });
        }
    }
});

module.exports = router;
