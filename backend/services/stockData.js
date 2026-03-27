const axios = require('axios');

const YAHOO_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
const USER_AGENT_HEADER = { 'User-Agent': 'Mozilla/5.0' };

function computeVolatility(closes) {
  if (!Array.isArray(closes) || closes.length < 2) return null;
  const returns = [];
  for (let i = 1; i < closes.length; i += 1) {
    if (closes[i - 1] && closes[i - 1] > 0) {
      returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
    }
  }
  if (returns.length === 0) return null;
  const mean =
    returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) /
    returns.length;
  const dailyStdDev = Math.sqrt(variance);
  // Annualised volatility assuming ~252 trading days
  return dailyStdDev * Math.sqrt(252);
}

function computeSMA(closes, window) {
  if (!Array.isArray(closes) || closes.length < window) return null;
  const slice = closes.slice(-window);
  const sum = slice.reduce((s, v) => s + v, 0);
  return sum / slice.length;
}

function computeTrend(closes) {
  const sma20 = computeSMA(closes, 20);
  const sma60 = computeSMA(closes, 60);
  if (sma20 == null || sma60 == null) {
    return 'sideways';
  }
  if (sma20 > sma60 * 1.01) return 'uptrend';
  if (sma20 < sma60 * 0.99) return 'downtrend';
  return 'sideways';
}

function computeRSIProxy(closes, period = 14) {
  if (!Array.isArray(closes) || closes.length <= period) return null;
  const gains = [];
  const losses = [];
  for (let i = closes.length - period; i < closes.length; i += 1) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) {
      gains.push(diff);
    } else if (diff < 0) {
      losses.push(Math.abs(diff));
    }
  }
  if (gains.length === 0 && losses.length === 0) return null;
  const avgGain =
    gains.reduce((s, v) => s + v, 0) / (gains.length || 1);
  const avgLoss =
    losses.reduce((s, v) => s + v, 0) / (losses.length || 1);
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);
  return rsi;
}

function computeMomentum(closes, days = 10) {
  if (!Array.isArray(closes) || closes.length <= days) return null;
  const start = closes[closes.length - 1 - days];
  const end = closes[closes.length - 1];
  if (!start || start === 0) return null;
  return ((end - start) / start) * 100;
}

function computeAvgVolume(volumes) {
  if (!Array.isArray(volumes) || volumes.length === 0) return null;
  const valid = volumes.filter((v) => typeof v === 'number' && !Number.isNaN(v));
  if (valid.length === 0) return null;
  const sum = valid.reduce((s, v) => s + v, 0);
  return sum / valid.length;
}

async function fetchFromYahoo(ticker, suffix) {
  const symbol = `${ticker}.${suffix}`;
  const url = `${YAHOO_BASE_URL}/${encodeURIComponent(
    symbol
  )}?interval=1d&range=3mo`;

  try {
    const response = await axios.get(url, {
      headers: USER_AGENT_HEADER,
    });
    return { symbol, data: response.data };
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return { symbol, data: null, notFound: true };
    }
    throw err;
  }
}

async function getStockData(ticker) {
  // Try NSE first
  let yahooResult = await fetchFromYahoo(ticker, 'NS');
  if (yahooResult.notFound) {
    // Fallback to BSE
    yahooResult = await fetchFromYahoo(ticker, 'BO');
  }

  const { data } = yahooResult;
  if (!data || !data.chart || !Array.isArray(data.chart.result) || data.chart.result.length === 0) {
    return { valid: false, error: 'Stock does not exist on NSE/BSE' };
  }

  const result = data.chart.result[0];
  const meta = result.meta || {};
  const indicators = result.indicators || {};
  const candles = Array.isArray(indicators.quote) && indicators.quote[0] ? indicators.quote[0] : {};
  const closes = Array.isArray(candles.close) ? candles.close.filter((v) => typeof v === 'number') : [];
  const volumes = Array.isArray(candles.volume) ? candles.volume.filter((v) => typeof v === 'number') : [];
  const timestamps = Array.isArray(result.timestamp) ? result.timestamp : [];

  const currentPrice = meta.regularMarketPrice;
  if (currentPrice == null) {
    return { valid: false, error: 'Stock does not exist on NSE/BSE' };
  }

  const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? null;
  const fiftyTwoWeekHigh = meta.fiftyTwoWeekHigh ?? null;
  const fiftyTwoWeekLow = meta.fiftyTwoWeekLow ?? null;
  const marketCap = meta.marketCap ?? null;
  const currency = meta.currency ?? 'INR';

  let return3m = null;
  if (closes.length >= 2) {
    const start = closes[0];
    const end = closes[closes.length - 1];
    if (start && start !== 0) {
      return3m = ((end - start) / start) * 100;
    }
  }

  const volatility = computeVolatility(closes);
  const trend = computeTrend(closes);
  const rsiProxy = computeRSIProxy(closes);
  let distanceFrom52wHigh = null;
  if (fiftyTwoWeekHigh && currentPrice) {
    distanceFrom52wHigh =
      ((currentPrice - fiftyTwoWeekHigh) / fiftyTwoWeekHigh) * 100;
  }
  const momentum10d = computeMomentum(closes, 10);
  const avgVolume3m = computeAvgVolume(volumes);

  return {
    valid: true,
    ticker,
    currentPrice,
    previousClose,
    fiftyTwoWeekHigh,
    fiftyTwoWeekLow,
    marketCap,
    currency,
    signals: {
      return3m,
      volatility,
      trend,
      rsiProxy,
      distanceFrom52wHigh,
      momentum10d,
      avgVolume3m,
    },
    // Internal historical data for backend computations only.
    meta: {
      closes,
      volumes,
      timestamps,
      exchangeSymbol: yahooResult.symbol,
      companyName: meta.longName || meta.shortName || ticker,
    },
  };
}

module.exports = {
  getStockData,
  computeVolatility,
};

