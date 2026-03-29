const { callAI } = require('./aiService');

/**
 * Extracts a valid NSE symbol from unstructured text using OpenRouter/GPT-4o-Mini.
 * @param {string} text - The input text containing a potential stock tip
 * @returns {Promise<string>} - The stock ticker or 'NONE'
 */
async function extractTicker(text) {
  if (!text || typeof text !== 'string') return 'NONE';

  try {
    const system = "You are a financial data extractor for Indian markets. You only output the ticker symbol.";
    const user = `Extract the NSE stock ticker symbol from this text: "${text}". 
    Rules: 
    1) Return ONLY the ticker (e.g., RELIANCE), no extra text or markdown.
    2) Common name mappings: Zomato=ZOMATO, Infosys=INFY, TCS=TCS, Reliance=RELIANCE, HDFC Bank=HDFCBANK.
    3) If no specific Indian stock is mentioned, return: NONE.`;

    const raw = await callAI(system, user);
    const cleaned = typeof raw === 'string' ? raw : (raw.ticker || raw.symbol || JSON.stringify(raw));
    const result = cleaned.toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
    
    return result || 'NONE';
  } catch (err) {
    console.error("❌ Ticker Extraction Error:", err);
    return 'NONE';
  }
}

module.exports = {
  extractTicker,
  // Helper kept for backward compatibility if other modules expect a model object
  createFlashModel: () => null 
};
