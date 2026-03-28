const axios = require('axios');
const cache = require('./marketCache');

const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0',
  Accept: 'application/json',
};

function toChangePct(raw) {
  if (raw == null || Number.isNaN(Number(raw))) return 0;
  return Number(raw);
}

async function fetchNifty50Fallback() {
  const key = process.env.ALPHA_VANTAGE_KEY;
  if (!key) {
    throw new Error('Alpha Vantage fallback: missing ALPHA_VANTAGE_KEY');
  }
  console.warn('Yahoo Finance unavailable, using Alpha Vantage fallback');
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=NSEI.BSE&apikey=${encodeURIComponent(key)}`;
  const { data } = await axios.get(url, { timeout: 15000 });
  const g = data?.['Global Quote'] || {};
  const price = parseFloat(g['05. price'] || g['05. Price'] || '0') || 0;
  const change = parseFloat(g['09. change'] || g['09. Change'] || '0') || 0;
  const changePctRaw = parseFloat(g['10. change percent']?.replace('%', '') || '0') || 0;
  const previousClose = parseFloat(g['08. previous close'] || g['08. Previous close'] || '0') || 0;
  return {
    price,
    change,
    changePct: changePctRaw,
    previousClose,
    timestamps: [],
    closes: [],
    lastUpdated: new Date().toISOString(),
    _fallback: true,
  };
}

function parseChartResult(data) {
  const result = data?.chart?.result?.[0];
  if (!result) return null;
  const meta = result.meta || {};
  const timestamps = Array.isArray(result.timestamp) ? result.timestamp : [];
  const quote0 = result.indicators?.quote?.[0];
  const closesRaw = quote0?.close;
  const closes = Array.isArray(closesRaw)
    ? closesRaw.map((c) => (c == null ? null : Number(c)))
    : [];
  const price =
    meta.regularMarketPrice != null
      ? Number(meta.regularMarketPrice)
      : closes.filter((c) => c != null).pop() || 0;
  const change = meta.regularMarketChange != null ? Number(meta.regularMarketChange) : 0;
  const changePct = toChangePct(meta.regularMarketChangePercent);
  const previousClose = meta.previousClose != null ? Number(meta.previousClose) : price - change;
  return {
    price,
    change,
    changePct,
    previousClose,
    timestamps,
    closes,
    lastUpdated: new Date().toISOString(),
    _fallback: false,
  };
}

async function fetchNifty50() {
  const cacheKey = 'nifty50';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const url =
      'https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?interval=5m&range=1d';
    const { data } = await axios.get(url, { headers: YAHOO_HEADERS, timeout: 20000 });
    const parsed = parseChartResult(data);
    if (!parsed) throw new Error('Invalid Yahoo Nifty response');
    const paired = parsed.timestamps
      .map((ts, i) => ({ ts, c: parsed.closes[i] }))
      .filter((x) => x.c != null && !Number.isNaN(Number(x.c)));
    const out = {
      price: parsed.price,
      change: parsed.change,
      changePct: parsed.changePct,
      previousClose: parsed.previousClose,
      timestamps: paired.map((p) => p.ts),
      closes: paired.map((p) => Number(p.c)),
      lastUpdated: parsed.lastUpdated,
      _fallback: false,
    };
    cache.set(cacheKey, out, 30);
    return out;
  } catch (e) {
    try {
      const fb = await fetchNifty50Fallback();
      const out = {
        price: fb.price,
        change: fb.change,
        changePct: fb.changePct,
        previousClose: fb.previousClose,
        timestamps: [],
        closes: [],
        lastUpdated: fb.lastUpdated,
        _fallback: true,
      };
      cache.set(cacheKey, out, 30);
      return out;
    } catch (err2) {
      const stub = {
        price: 0,
        change: 0,
        changePct: 0,
        previousClose: 0,
        timestamps: [],
        closes: [],
        lastUpdated: new Date().toISOString(),
        _fallback: true,
      };
      cache.set(cacheKey, stub, 15);
      return stub;
    }
  }
}

async function fetchStockQuote(ticker) {
  const cacheKey = `quote_${ticker}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const symbol = `${ticker}.NS`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}?interval=1d&range=1d`;
  const { data } = await axios.get(url, { headers: YAHOO_HEADERS, timeout: 20000 });
  const result = data?.chart?.result?.[0];
  const meta = result?.meta || {};
  const q = result?.indicators?.quote?.[0];
  const price =
    meta.regularMarketPrice != null
      ? Number(meta.regularMarketPrice)
      : (q?.close || []).filter((c) => c != null).pop() || 0;
  const change = meta.regularMarketChange != null ? Number(meta.regularMarketChange) : 0;
  const changePct = toChangePct(meta.regularMarketChangePercent);
  const volArr = q?.volume || [];
  const volume = volArr.length ? Number(volArr[volArr.length - 1]) || 0 : 0;

  const out = {
    ticker,
    price,
    change,
    changePct,
    volume,
  };
  cache.set(cacheKey, out, 60);
  return out;
}

async function fetchStockIntraday(ticker) {
  const cacheKey = `intraday_${ticker}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const symbol = `${ticker}.NS`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}?interval=5m&range=1d`;
  const { data } = await axios.get(url, { headers: YAHOO_HEADERS, timeout: 20000 });
  const result = data?.chart?.result?.[0];
  if (!result) {
    const empty = { ticker, timestamps: [], closes: [] };
    cache.set(cacheKey, empty, 30);
    return empty;
  }
  const timestamps = Array.isArray(result.timestamp) ? result.timestamp : [];
  const closesRaw = result.indicators?.quote?.[0]?.close;
  const closes = Array.isArray(closesRaw)
    ? closesRaw.map((c) => (c == null ? null : Number(c)))
    : [];
  const filtered = closes.map((c, i) => (c == null ? null : { ts: timestamps[i], c })).filter((x) => x != null);
  const out = {
    ticker,
    timestamps: filtered.map((x) => x.ts),
    closes: filtered.map((x) => x.c),
  };
  cache.set(cacheKey, out, 60);
  return out;
}

const TOP_MOVER_TICKERS = [
  'RELIANCE',
  'TCS',
  'HDFCBANK',
  'INFY',
  'ITC',
  'WIPRO',
  'ADANIENT',
  'BAJFINANCE',
  'SBIN',
  'HINDUNILVR',
];

async function fetchTopMovers() {
  const cacheKey = 'topMovers';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const quotes = await Promise.all(TOP_MOVER_TICKERS.map((t) => fetchStockQuote(t)));
  const movers = quotes.map((q) => ({
    ticker: q.ticker,
    price: q.price,
    change: q.change,
    changePct: q.changePct,
  }));
  const sortedByAbs = [...movers].sort(
    (a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)
  );
  const positives = movers.filter((m) => m.changePct > 0);
  const negatives = movers.filter((m) => m.changePct < 0);
  let topGainer = positives.length
    ? positives.reduce((a, b) => (a.changePct >= b.changePct ? a : b))
    : sortedByAbs[0] || movers[0];
  let topLoser = negatives.length
    ? negatives.reduce((a, b) => (a.changePct <= b.changePct ? a : b))
    : sortedByAbs[sortedByAbs.length - 1] || movers[0];

  if (
    topGainer?.ticker &&
    topGainer.ticker === topLoser?.ticker &&
    sortedByAbs.length > 1
  ) {
    topLoser =
      sortedByAbs.find((m) => m.ticker !== topGainer.ticker) || sortedByAbs[1];
  }

  const out = {
    topGainer: {
      ticker: topGainer?.ticker || '',
      price: topGainer?.price ?? 0,
      changePct: topGainer?.changePct ?? 0,
    },
    topLoser: {
      ticker: topLoser?.ticker || '',
      price: topLoser?.price ?? 0,
      changePct: topLoser?.changePct ?? 0,
    },
    movers: sortedByAbs,
  };
  cache.set(cacheKey, out, 300);
  return out;
}

function isMarketOpen() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const wd = parts.find((p) => p.type === 'weekday')?.value || '';
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
  const dayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
  const d = dayMap[wd.slice(0, 3)] ?? 0;
  if (d === 0 || d === 6) {
    return { open: false, message: 'Market closed (weekend)' };
  }
  const t = hour * 60 + minute;
  const openM = 9 * 60 + 15;
  const closeM = 15 * 60 + 30;
  if (t >= openM && t <= closeM) {
    return { open: true, message: 'Market open' };
  }
  return { open: false, message: 'Market closed' };
}

/** Daily candles for weekly / monthly Reliance chart */
async function fetchStockDailyRange(ticker, range) {
  const symbol = `${ticker}.NS`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}?interval=1d&range=${range}`;
  const { data } = await axios.get(url, { headers: YAHOO_HEADERS, timeout: 20000 });
  const result = data?.chart?.result?.[0];
  if (!result) return { timestamps: [], closes: [] };
  const timestamps = Array.isArray(result.timestamp) ? result.timestamp : [];
  const closesRaw = result.indicators?.quote?.[0]?.close;
  const closes = Array.isArray(closesRaw)
    ? closesRaw.map((c) => (c == null ? null : Number(c)))
    : [];
  const pairs = timestamps
    .map((ts, i) => ({ ts, c: closes[i] }))
    .filter((x) => x.c != null && !Number.isNaN(x.c));
  return {
    timestamps: pairs.map((p) => p.ts),
    closes: pairs.map((p) => p.c),
  };
}

module.exports = {
  fetchNifty50,
  fetchNifty50Fallback,
  fetchStockQuote,
  fetchStockIntraday,
  fetchTopMovers,
  isMarketOpen,
  fetchStockDailyRange,
};
