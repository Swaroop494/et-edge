const { GoogleGenerativeAI } = require('@google/generative-ai');

async function extractTicker(model, tipText) {
  if (!tipText || typeof tipText !== 'string') {
    return 'NONE';
  }

  const prompt = `Extract the NSE or BSE stock ticker symbol from this text. Rules: 1) Return ONLY the ticker, nothing else, no punctuation, no .NS suffix. 2) Common name mappings: Zomato=ZOMATO, Infosys=INFY, TCS=TCS, Reliance=RELIANCE, Wipro=WIPRO. 3) If no specific Indian stock is mentioned return exactly: NONE. Text: ${tipText}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').trim() || 'NONE';
}

function createFlashModel() {
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return client.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

module.exports = {
  extractTicker,
  createFlashModel,
};

