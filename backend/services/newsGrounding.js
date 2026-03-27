const { GoogleGenerativeAI } = require('@google/generative-ai');

async function fetchNewsContext(model, ticker, companyName) {
  const query = `Search for recent news about ${ticker} (${companyName}) Indian stock in the last 30 days. Focus on: earnings, SEBI actions, promoter activity, FII buying/selling, analyst upgrades/downgrades. Return a 3-bullet summary only.`;

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: query }],
      },
    ],
    tools: [{ googleSearch: {} }],
  });

  const candidate = result.response?.candidates?.[0];
  const parts = candidate?.content?.parts || [];
  return parts
    .filter((p) => typeof p.text === 'string')
    .map((p) => p.text)
    .join(' ');
}

function createProModel() {
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return client.getGenerativeModel({ model: 'gemini-1.5-pro' });
}

module.exports = {
  fetchNewsContext,
  createProModel,
};

