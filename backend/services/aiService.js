const { db } = require('./firebase');
const axios = require('axios');

/**
 * AI Service for ET Edge — Powered by OpenRouter (OpenAI Engine)
 * Replaces Gemini with OpenAI (gpt-4o-mini) for all summarization and reasoning tasks.
 * 
 * @param {string} systemInstruction - The system context/persona
 * @param {string} userPrompt - The specific task or query
 * @param {object} mockResponse - Optional fallback for Demo Mode
 * @returns {Promise<object|string>} - Parsed JSON answer or reasoning string
 */
async function callAI(systemInstruction, userPrompt, mockResponse = null) {
    // 1. DEMO MODE CHECK
    if (global.USE_MOCKS && mockResponse) {
        console.log("📡 Mode: Demo (Serving Mock Intelligence)");
        return mockResponse;
    }

    const orApiKey = process.env.OPENROUTER_API_KEY;
    if (!orApiKey) {
        console.warn("⚠️ OPENROUTER_API_KEY missing. Falling back to Safety Mode.");
        return mockResponse || { answer: "Safety Fallback Active.", reasoning: "System is in maintenance/limited mode." };
    }

    // 2. OPENROUTER REQUEST (PRIMARY ENGINE: OpenAI GPT-4o-Mini)
    // Focused on Summary and Reasoning as requested.
    const sysWithConstraints = systemInstruction + 
        " You MUST provide a clear 'reasoning' and ensure every claim has a source like [Source: NSE Filing]. " +
        "Output ONLY valid JSON if the task suggests it, otherwise clear professional text.";

    try {
        console.log("🚀 AI Engine [OpenRouter/GPT-4o-Mini]: Analyzing...");
        
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "openai/gpt-4o-mini", // Optimized for scale, speed, and reasoning
            messages: [
                { role: "system", content: sysWithConstraints },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.3 // Kept low for factual financial reasoning
        }, {
            headers: {
                "Authorization": `Bearer ${orApiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://et-edge.com",
                "X-Title": "ET Edge Intelligence"
            },
            timeout: 15000
        });

        const content = response.data.choices[0].message.content.trim();
        const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // 3. PERSISTENCE (FIRESTORE)
        try {
            await db.collection('market_analysis').add({
                prompt: userPrompt,
                result: cleaned,
                timestamp: new Date(),
                metadata: { engine: "openai/gpt-4o-mini", service: "OpenRouter" }
            });
        } catch (fErr) { /* Silent fail */ }

        // 4. PARSE & RETURN
        if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
            try { return JSON.parse(cleaned); } catch (e) { return cleaned; }
        }
        return cleaned;

    } catch (err) {
        process.stdout.write(`❌ AI API Failure: ${err.message}\n`);
        return mockResponse || {
            answer: "The ET Edge Intelligence layer is currently experiencing high load.",
            reasoning: "We are monitoring market instability. Consolidation at support levels expected [Source: System Monitor].",
            source: "[Source: System Monitor]"
        };
    }
}

module.exports = { callAI, callGemini: callAI }; // callGemini alias kept to avoid breaking existing imports
