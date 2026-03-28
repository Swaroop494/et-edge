const express = require('express');
const {
  fetchNifty50,
  fetchTopMovers,
  fetchStockIntraday,
  fetchStockQuote,
  isMarketOpen,
  fetchStockDailyRange,
} = require('../services/yahooFinance');
const { fetchNSEGainersLosers } = require('../services/nseData');
const { fetchBreakingSignals } = require('../services/newsService');

const router = express.Router();

function istTimeFromUnix(sec) {
  if (sec == null || Number.isNaN(Number(sec))) return '—';
  const d = new Date(Number(sec) * 1000);
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(d)
    .replace(/\u202f/g, ' ')
    .trim();
}

function istDayLabelFromUnix(sec) {
  if (sec == null || Number.isNaN(Number(sec))) return '—';
  const d = new Date(Number(sec) * 1000);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
  }).format(d);
}

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

function buildChartPoints(timestamps, closes, maxPoints = 78) {
  if (!Array.isArray(timestamps) || !Array.isArray(closes)) return [];
  const n = Math.min(timestamps.length, closes.length);
  const out = [];
  for (let i = 0; i < n; i++) {
    const price = closes[i];
    if (price == null || Number.isNaN(Number(price))) continue;
    out.push({
      time: istTimeFromUnix(timestamps[i]),
      price: round2(price),
    });
  }
  if (out.length > maxPoints) return out.slice(-maxPoints);
  return out;
}

function buildDailyChartPoints(timestamps, closes, labelMode = 'day') {
  if (!Array.isArray(timestamps) || !Array.isArray(closes)) return [];
  const n = Math.min(timestamps.length, closes.length);
  const out = [];
  for (let i = 0; i < n; i++) {
    const price = closes[i];
    if (price == null || Number.isNaN(Number(price))) continue;
    const t =
      labelMode === 'day'
        ? istDayLabelFromUnix(timestamps[i])
        : istTimeFromUnix(timestamps[i]);
    out.push({ time: t, price: round2(price) });
  }
  return out;
}

router.get('/', async (req, res) => {
  const [niftyResult, moversResult, nseResult, newsResult, relianceResult, relQuoteResult, wResult, mResult] =
    await Promise.allSettled([
      fetchNifty50(),
      fetchTopMovers(),
      fetchNSEGainersLosers(),
      fetchBreakingSignals(),
      fetchStockIntraday('RELIANCE'),
      fetchStockQuote('RELIANCE'),
      fetchStockDailyRange('RELIANCE', '5d'),
      fetchStockDailyRange('RELIANCE', '1mo'),
    ]);

  const niftyRaw = niftyResult.status === 'fulfilled' ? niftyResult.value : null;
  const moversRaw = moversResult.status === 'fulfilled' ? moversResult.value : null;
  const nseRaw = nseResult.status === 'fulfilled' ? nseResult.value : null;
  const newsRaw = newsResult.status === 'fulfilled' ? newsResult.value : null;
  const relianceIntra = relianceResult.status === 'fulfilled' ? relianceResult.value : null;
  const relianceQuote = relQuoteResult.status === 'fulfilled' ? relQuoteResult.value : null;
  const relW = wResult.status === 'fulfilled' ? wResult.value : { timestamps: [], closes: [] };
  const relM = mResult.status === 'fulfilled' ? mResult.value : { timestamps: [], closes: [] };

  const market = isMarketOpen();

  let topGainer = moversRaw?.topGainer || { ticker: '', changePct: 0 };
  let topLoser = moversRaw?.topLoser || { ticker: '', changePct: 0 };

  if (nseRaw?.gainers?.length) {
    const g = nseRaw.gainers[0];
    topGainer = { ticker: g.ticker, changePct: g.changePct };
  }
  if (nseRaw?.losers?.length) {
    const l = nseRaw.losers[0];
    topLoser = { ticker: l.ticker, changePct: l.changePct };
  }

  const moversList = (moversRaw?.movers || []).slice(0, 5).map((m) => ({
    ticker: m.ticker,
    price: m.price,
    change: m.change,
    changePct: m.changePct,
  }));

  const niftyChart = niftyRaw
    ? buildChartPoints(niftyRaw.timestamps, niftyRaw.closes, 78)
    : [];

  const relChart1d = relianceIntra
    ? buildChartPoints(relianceIntra.timestamps, relianceIntra.closes, 78)
    : [];

  const relChart1w = buildDailyChartPoints(relW.timestamps, relW.closes, 'day');
  const relChart1m = buildDailyChartPoints(relM.timestamps, relM.closes, 'day');

  let relPrice = 0;
  let relChange = 0;
  let relChangePct = 0;
  if (relianceQuote) {
    relPrice = relianceQuote.price;
    relChange = relianceQuote.change;
    relChangePct = relianceQuote.changePct;
  } else if (moversRaw?.movers?.length) {
    const r = moversRaw.movers.find((x) => x.ticker === 'RELIANCE');
    if (r) {
      relPrice = r.price;
      relChange = r.change;
      relChangePct = r.changePct;
    }
  }
  if (!relPrice && relianceIntra?.closes?.length) {
    const last = [...relianceIntra.closes].reverse().find((c) => c != null);
    if (last != null) relPrice = Number(last);
  }

  const breakingSignals = Array.isArray(newsRaw)
    ? newsRaw.map((s) => ({
        headline: s.headline,
        category: s.category,
        urgency: s.urgency,
        minutesAgo: Number(s.minutesAgo) || 0,
      }))
    : [];

  const niftyFallback = Boolean(niftyRaw?._fallback);
  const source = niftyFallback ? 'fallback' : 'live';

  res.json({
    nifty50: {
      price: niftyRaw?.price ?? 0,
      change: niftyRaw?.change ?? 0,
      changePct: niftyRaw?.changePct ?? 0,
      chartData: niftyChart,
      marketOpen: market.open,
      lastUpdated: niftyRaw?.lastUpdated || new Date().toISOString(),
    },
    topGainer: {
      ticker: topGainer.ticker || '',
      changePct: topGainer.changePct ?? 0,
    },
    topLoser: {
      ticker: topLoser.ticker || '',
      changePct: topLoser.changePct ?? 0,
    },
    topMovers: moversList,
    breakingSignals,
    reliance: {
      price: relPrice,
      change: relChange,
      changePct: relChangePct,
      chartData: relChart1d,
      chartWeekly: relChart1w,
      chartMonthly: relChart1m,
    },
    dataQuality: {
      source,
      marketOpen: market.open,
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = router;
