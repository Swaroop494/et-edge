const axios = require('axios');
const { db } = require('./firebase');

async function callAI(systemInstruction, userPrompt, mockResponse = null) {
    const orApiKey = process.env.OPENROUTER_API_KEY;
    try {
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "openai/gpt-4o-mini",
            messages: [
                { role: "system", content: systemInstruction + " Respond ONLY with a valid JSON object. Do not include markdown or backticks." },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" } 
        }, {
            headers: { "Authorization": `Bearer ${orApiKey}`, "Content-Type": "application/json" }
        });

        const rawContent = response.data.choices[0].message.content;
        // CRITICAL FIX: Ensure we return an OBJECT, not a STRING
        const parsed = JSON.parse(rawContent.replace(/```json|```/g, ''));

        // Persistence for the "Learning Loop" (optional, from previous iteration)
        try { if(db) await db.collection('event_analysis_logs').add({ ...parsed, timestamp: new Date() }); } catch(e){}

        return parsed;
    } catch (err) {
        console.error("AI Error, falling back to clean object...");
        return mockResponse || { findings: "Analysis temporarily unavailable.", verdict: "Caution", confidence: 60 };
    }
}

module.exports = { callAI };
