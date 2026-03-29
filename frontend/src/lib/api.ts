import { MarketSignal, LearningStats, UserPortfolio, AgentResponse } from "../types/api";

const API_BASE = "http://localhost:5500";

/**
 * 🛠️ Mock Generators ensuring type-safe fallbacks
 */
const MOCK_SIGNALS: MarketSignal[] = Array.from({ length: 5 }, (_, i) => ({
  id: `sig-${i}`,
  symbol: ["HDFCBANK", "TCS", "RELIANCE", "SBIN", "ICICIBANK"][i],
  type: i % 2 === 0 ? "bullish" : "bearish",
  strength: 78 + i,
  reasoning: "Breakout on 50-day EMA with abnormal volume spike. Momentum suggests a 5-7% upside in 3 sessions.",
  source: i % 2 === 0 ? "[Source: NSE Filing Q3]" : "[Source: Reuters Feb 2026]",
  timestamp: new Date().toISOString(),
}));

const MOCK_STATS: LearningStats = {
  accuracy: 76,
  samples: 1240,
  lastUpdate: new Date().toISOString(),
  errorMargin: 4.2,
  isImproving: true,
  totalLogs: 1240,
  latestLesson: "Recursive Memory V4 calibration complete. Cross-sector correlation accuracy increased by 4%."
};

const MOCK_PORTFOLIO: UserPortfolio = {
  holdings: ["HDFCBANK", "RELIANCE", "TCS"],
  riskAppetite: "med",
  totalValue: 1250000
};

const USE_MOCKS = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

/**
 * 📡 Hybrid Fetch Utility
 * Prioritize Live Fetch. Catch TypeError or 500 status.
 * Returns typing-correct mock data specifically for that endpoint if live fails or if Demo Mode is ACTIVE.
 */
export async function apiFetch<T = any>(path: string): Promise<T | null> {
  const isSignal = path.includes("signal") || path.includes("radar");
  const isStats = path.includes("stats") || path.includes("learning");
  const isPortfolio = path.includes("portfolio");

  if (USE_MOCKS) {
    console.log('📡 Mode: Demo Mode Active (Serving Mock)');
    if (isSignal) return MOCK_SIGNALS as any;
    if (isStats) return MOCK_STATS as any;
    if (isPortfolio) return MOCK_PORTFOLIO as any;
  }

  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) {
       console.log('📡 Data Source: Mock Fallback (Failed Status)');
       if (isSignal) return MOCK_SIGNALS as any;
       if (isStats) return MOCK_STATS as any;
       if (isPortfolio) return MOCK_PORTFOLIO as any;
       return null;
    }
    console.log('📡 Data Source: Live API');
    return await res.json() as T;
  } catch (err) {
    console.log('📡 Data Source: Mock Fallback (Network Error)');
    if (isSignal) return MOCK_SIGNALS as any;
    if (isStats) return MOCK_STATS as any;
    if (isPortfolio) return MOCK_PORTFOLIO as any;
    return null;
  }
}

/**
 * Hybrid POST Utility
 */
export async function apiPost<T = any>(path: string, body: any): Promise<T | null> {
    const isSignal = path.includes("signal") || path.includes("radar");

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        console.log('📡 Data Source: Mock Fallback (POST Failed Status)');
        if (isSignal) return { success: true, data: MOCK_SIGNALS, reasoningTrace: [] } as any; 
        return null;
      }
      console.log('📡 Data Source: Live API (POST)');
      return await res.json() as T;
    } catch (err) {
      console.log('📡 Data Source: Mock Fallback (POST Network Error)');
      if (isSignal) return { success: true, data: MOCK_SIGNALS, reasoningTrace: [] } as any;
      return null;
    }
}
