// ET Edge — Frontend API utility.
// Updated to use the core hybrid fetch logic from @/lib/api for "zero-failure" behavior.

import { auth } from "../lib/firebase";
import { apiFetch, apiPost } from "../lib/api";

const API_BASE = "http://localhost:5500/api";

async function getAuthHeaders(customHeaders = {}) {
  const headers = { "Content-Type": "application/json", ...customHeaders };
  if (auth?.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken(true);
      headers["Authorization"] = `Bearer ${token}`;
    } catch (e) {
      console.error("Error getting fresh token:", e);
    }
  }
  return headers;
}

export async function fetchLiveNews() {
  const data = await apiFetch("/api/live-news");
  return data || [];
}

export async function analyzeEvent(headline, summary) {
  return await apiPost("/api/analyze-event", { headline, summary });
}

export async function validateTip(tipText, newsContext) {
  return await apiPost("/api/validate-tip", { tipText, newsContext });
}

export async function runWhatIfScenario(scenarioText) {
  return await apiPost("/api/what-if", { scenarioText });
}

export async function portfolioImpact(userHoldings, eventAnalysis) {
  return await apiPost("/api/portfolio-impact", { userHoldings, eventAnalysis });
}

export async function runAgent(userHoldings, tip) {
  return await apiPost("/api/agent/run", { userHoldings: userHoldings || [], tip: tip || "" });
}

export async function runBulkDealAgent(filing) {
  return await apiPost("/api/agent/bulk-deal", { filing });
}

export async function runTechnicalAgent(signal) {
  return await apiPost("/api/agent/technical", { signal });
}

export async function runPortfolioNewsAgent(portfolio, events) {
  return await apiPost("/api/agent/portfolio-news", { portfolio, events });
}

export async function runMarketGPT(query, userHoldings) {
  return await apiPost("/api/market-gpt", { query, userHoldings });
}

export async function generateScenarios() {
  return await apiPost("/api/scenarios/generate", {});
}

export async function auditScenario(logId, actualChange) {
  return await apiPost("/api/scenarios/audit", { logId, actualChange });
}
