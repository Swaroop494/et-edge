const { callAI } = require('../services/aiService');

async function fetchNewsContext(model, ticker, companyName) {
  const query = `Search for recent news about ${ticker} (${companyName}) Indian stock in the last 30 days. Focus on: earnings, SEBI actions, promoter activity, FII buying/selling, analyst upgrades/downgrades. Return a 3-bullet summary only.`;

  const result = await callAI("You are a financial news researcher.", query);

  return typeof result === 'string' ? result : JSON.stringify(result);
}

function createProModel() {
  return null;
}

module.exports = {
  fetchNewsContext,
  createProModel,
};
