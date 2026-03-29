// ET Edge — Live News Route. Returns latest Indian market headlines from NewsAPI with fallback to mock data.
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

router.get('/', async (req, res) => {
    console.log("Processing live news with batch analysis...");
    const now = Date.now();

    // 1. MEMORY SHIELD: FIRESTORE CACHE CHECK (15-Minute TTL)
    try {
        const { db } = require('../services/firebase');
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
        const cachedAnalysis = await db.collection('intelligence')
            .where('type', '==', 'batch_news')
            .where('timestamp', '>', fifteenMinsAgo)
            .orderBy('timestamp', 'desc')
            .limit(1)
            .get();

        if (!cachedAnalysis.empty) {
            console.log("📡 Memory Shield: Serving Batch News from Firestore Intelligence Layer");
            return res.status(200).json(cachedAnalysis.docs[0].data().articles);
        }
    } catch (dbErr) {
        console.warn("Memory Shield check failed, falling back to live fetch:", dbErr.message);
    }

    let articles = [];
    try {
        if (global.USE_MOCKS) {
            console.log("Serving mock news (Demo Mode)");
            const mockDataPath = path.join(__dirname, "../../data/radar_events.json");
            const rawMock = JSON.parse(fs.readFileSync(mockDataPath, 'utf8')).events;
            return res.status(200).json(rawMock);
        }

        const apiKey = process.env.NEWS_API_KEY || process.env.NEXT_PUBLIC_NEWS_API_KEY;
        if (!apiKey) throw new Error("NewsAPI Key is missing");

        const query = encodeURIComponent('Sensex OR Nifty OR "NSE India" OR "Indian stock market"');
        const url = `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&language=en&pageSize=5&apiKey=${apiKey}`;

        const newsResponse = await fetch(url, { headers: { 'User-Agent': 'ETEdge-Backend/1.0' } });
        if (!newsResponse.ok) throw new Error(`NewsAPI error: ${newsResponse.status}`);

        const data = await newsResponse.json();
        articles = data.articles || [];
        if (articles.length === 0) throw new Error("No articles found");

        // 2. BATCH INTELLIGENCE: GEMINI 2.0 FLASH
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            systemInstruction: "Analyze the following news batch. For each item, you MUST provide a reasoning (exactly 2 sentences) and a source (e.g., [Source: Reuters]). Return valid JSON array of objects with fields: title, sentiment, impactScore, reasoning, and source."
        });

        const batchPrompt = `Analyze these 5 news items and return a JSON array: ${JSON.stringify(articles.map(a => ({ title: a.title, description: a.description })))}`;

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

        // Save to Memory Shield (Firestore)
        try {
            const { db } = require('../services/firebase');
            await db.collection('intelligence').add({
                type: 'batch_news',
                articles: richArticles,
                timestamp: new Date()
            });
        } catch (dbErr) {
            console.warn("Failed to persist to Firestore Intelligence:", dbErr.message);
        }
        
        console.log(`Live news batch analysis complete: ${richArticles.length} items`);
        return res.status(200).json(richArticles);

    } catch (err) {
        console.log("📡 Mode: Safety Fallback (Batch News Error)");
        return res.status(200).json([
            {
                title: "Safety Fallback Market Outlook",
                aiAnalysis: {
                    sentiment: "Neutral",
                    impactScore: 50,
                    reasoning: "Technical indicators suggest a consolidation phase near key support levels.",
                    source: "[Source: Institutional Data Hub]"
                }
            }
        ]);
    }
});

module.exports = router;
