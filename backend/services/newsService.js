const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function fetchLatestIndianNews() {
    const apiKey = process.env.NEWS_API_KEY || process.env.NEXT_PUBLIC_NEWS_API_KEY;
    if (!apiKey) throw new Error("NEWS_API_KEY is missing in environment.");

    // Fetching 5 real headlines for Indian Market
    const query = encodeURIComponent('NIFTY 50 OR "Indian stock market"');
    const url = `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&language=en&pageSize=5&apiKey=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`NewsAPI yielded status ${res.status}`);
    const data = await res.json();
    return data.articles || [];
}

async function analyzeNewsBatch(articles) {
    if (!articles.length) return [];

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        systemInstruction: "You are a Senior Fiduciary Analyst. Analyze the provided batch of news headlines for the Indian Market. For each, you MUST provide: headline, type (bullish/bearish), reasoning (min 2 sentences), and source (e.g., [Source: Reuters]). Return as a JSON array of objects."
    });

    const batchPrompt = `Analyze these 5 news headlines and return a JSON array: ${JSON.stringify(articles.map(a => ({ title: a.title, description: a.description })))}`;
    
    const result = await model.generateContent(batchPrompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const analyzed = JSON.parse(text);

    // Merge with original article data and normalize fields
    return articles.map((a, i) => {
        const ai = analyzed[i] || {};
        return {
            ...a,
            symbol: ai.symbol || "NIFTY", // Fallback symbol
            aiAnalysis: {
                sentiment: ai.type === 'bullish' ? 'Positive' : 'Negative',
                type: ai.type || 'bullish',
                impactScore: ai.type === 'bullish' ? 75 : 45,
                reasoning: ai.reasoning || "Deep analysis pending.",
                source: ai.source || "[Source: Institutional Feed]"
            }
        };
    });
}

module.exports = {
    fetchLatestIndianNews,
    analyzeNewsBatch
};
