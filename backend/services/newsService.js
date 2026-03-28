const { GoogleGenerativeAI } = require('@google/generative-ai');
const cache = require('./marketCache');

const FALLBACK_SIGNALS = [
  {
    headline: 'Market data temporarily unavailable',
    category: 'System',
    urgency: 'Normal',
    minutesAgo: 0,
  },
];

const PROMPT = `Find the 4 most important Indian stock market news items from the last 6 hours. Focus on: RBI decisions, FII/DII flows, major corporate earnings, SEBI actions, crude oil impact on Indian markets, global macro events affecting Nifty. For each news item return: headline (max 10 words), category (one of: Macro/Sector/Earnings/Flow/Policy), urgency (one of: High/Elevated/Watch/Normal). Respond ONLY as JSON array: [{ headline, category, urgency, minutesAgo }]`;

function extractJsonArray(text) {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fence ? fence[1] : trimmed;
  const start = body.indexOf('[');
  const end = body.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(body.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function fetchBreakingSignals() {
  const cacheKey = 'breakingSignals';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    cache.set(cacheKey, FALLBACK_SIGNALS, 300);
    return FALLBACK_SIGNALS;
  }

  const tryModels = ['gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-1.5-flash'];

  for (const modelName of tryModels) {
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({
        model: modelName,
        tools: [{ googleSearch: {} }],
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: PROMPT }] }],
      });

      const text =
        result.response?.text?.() ||
        result.response?.candidates?.[0]?.content?.parts
          ?.map((p) => p.text)
          .filter(Boolean)
          .join('') ||
        '';

      const arr = extractJsonArray(text);
      if (!arr || !arr.length) continue;

      const normalized = arr.slice(0, 4).map((item) => ({
        headline: String(item.headline || '').slice(0, 500),
        category: String(item.category || 'Macro'),
        urgency: String(item.urgency || 'Normal'),
        minutesAgo: Math.max(0, Math.min(360, Number(item.minutesAgo) || 0)),
      }));

      cache.set(cacheKey, normalized, 14400);
      return normalized;
    } catch {
      /* try next model */
    }
  }

  cache.set(cacheKey, FALLBACK_SIGNALS, 300);
  return FALLBACK_SIGNALS;
}

module.exports = {
  fetchBreakingSignals,
};
