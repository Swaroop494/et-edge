const axios = require('axios');
const cache = require('./marketCache');

const NSE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  Referer: 'https://www.nseindia.com',
};

let cookieString = '';

function mergeSetCookie(setCookie) {
  if (!setCookie || !setCookie.length) return;
  const parts = Array.isArray(setCookie) ? setCookie : [setCookie];
  const jar = new Map();
  if (cookieString) {
    cookieString.split(';').forEach((c) => {
      const piece = c.trim();
      const eq = piece.indexOf('=');
      if (eq > 0) jar.set(piece.slice(0, eq), piece);
    });
  }
  parts.forEach((line) => {
    const first = line.split(';')[0];
    const eq = first.indexOf('=');
    if (eq > 0) {
      const name = first.slice(0, eq).trim();
      jar.set(name, first);
    }
  });
  cookieString = Array.from(jar.values()).join('; ');
}

async function refreshSession() {
  const res = await axios.get('https://www.nseindia.com', {
    headers: NSE_HEADERS,
    timeout: 20000,
    maxRedirects: 5,
    validateStatus: () => true,
  });
  const sc = res.headers['set-cookie'];
  if (sc) mergeSetCookie(sc);
  return res.status;
}

async function nseGet(url) {
  const headers = { ...NSE_HEADERS, ...(cookieString ? { Cookie: cookieString } : {}) };
  const res = await axios.get(url, { headers, timeout: 20000, validateStatus: () => true });
  if (res.status === 401 || res.status === 403) {
    await refreshSession();
    const headers2 = { ...NSE_HEADERS, ...(cookieString ? { Cookie: cookieString } : {}) };
    return axios.get(url, { headers: headers2, timeout: 20000 });
  }
  return res;
}

function parseVariationRow(row) {
  if (!row || typeof row !== 'object') return null;
  const sym =
    row.symbol ||
    row.meta?.symbol ||
    row.symbolName ||
    row.ticker ||
    row['symbol'];
  const pct =
    row.pChange != null
      ? Number(row.pChange)
      : row.perChange != null
        ? Number(row.perChange)
        : row.percentChange != null
          ? Number(row.percentChange)
          : null;
  const price =
    row.lastPrice != null
      ? Number(row.lastPrice)
      : row.ltp != null
        ? Number(row.ltp)
        : row.close != null
          ? Number(row.close)
          : 0;
  if (!sym) return null;
  return { ticker: String(sym).replace(/&amp;/g, '&'), price, changePct: pct != null ? pct : 0 };
}

function extractDataArray(payload) {
  if (!payload) return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  const d = payload.data;
  if (d && typeof d === 'object' && Array.isArray(d.data)) return d.data;
  if (d && typeof d === 'object' && Array.isArray(d.securities)) return d.securities;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.data?.data)) return payload.data.data.data;
  return [];
}

async function fetchNSEGainersLosers() {
  const cacheKey = 'nseMovers';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    if (!cookieString) {
      await refreshSession();
    }

    const gainUrl = 'https://www.nseindia.com/api/live-analysis-variations?index=gainers';
    const loseUrl = 'https://www.nseindia.com/api/live-analysis-variations?index=losers';

    const [gRes, lRes] = await Promise.all([nseGet(gainUrl), nseGet(loseUrl)]);

    const gData = typeof gRes.data === 'object' ? gRes.data : JSON.parse(String(gRes.data || '{}'));
    const lData = typeof lRes.data === 'object' ? lRes.data : JSON.parse(String(lRes.data || '{}'));

    const gainRows = extractDataArray(gData).slice(0, 20);
    const loseRows = extractDataArray(lData).slice(0, 20);

    const gainers = gainRows
      .map(parseVariationRow)
      .filter(Boolean)
      .slice(0, 5);
    const losers = loseRows
      .map(parseVariationRow)
      .filter(Boolean)
      .slice(0, 5);

    const out = { gainers, losers };
    cache.set(cacheKey, out, 300);
    return out;
  } catch (e) {
    return null;
  }
}

module.exports = {
  fetchNSEGainersLosers,
  refreshSession,
};
