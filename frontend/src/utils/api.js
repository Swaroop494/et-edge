// ET Edge — Frontend API utility. Import these functions to call the backend.

import { auth } from "../lib/firebase";

const API_BASE = "http://localhost:5000/api";

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
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/live-news`, { headers });
    if (!response.ok) throw new Error("Failed to fetch live news");
    return await response.json();
  } catch (error) {
    console.error("fetchLiveNews error:", error);
    return [];
  }
}

export async function analyzeEvent(headline, summary) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/analyze-event`, {
      method: "POST",
      headers,
      body: JSON.stringify({ headline, summary }),
    });
    return await response.json();
  } catch (error) {
    console.error("analyzeEvent error:", error);
    return null;
  }
}

export async function validateTip(tipText, newsContext) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/validate-tip`, {
      method: "POST",
      headers,
      body: JSON.stringify({ tipText, newsContext }),
    });
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`validateTip failed (${response.status}): ${text || response.statusText}`);
    }
    if (!contentType.includes("application/json")) {
      const text = await response.text().catch(() => "");
      throw new Error(`validateTip returned non-JSON: ${text.slice(0, 120)}`);
    }
    return await response.json();
  } catch (error) {
    console.error("validateTip error:", error);
    throw error;
  }
}

export async function runWhatIfScenario(scenarioText) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/what-if`, {
    method: "POST",
    headers,
    body: JSON.stringify({ scenarioText }),
  });
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`whatIf failed (${response.status}): ${text || response.statusText}`);
  }
  if (!contentType.includes("application/json")) {
    const text = await response.text().catch(() => "");
    throw new Error(`whatIf returned non-JSON: ${text.slice(0, 120)}`);
  }
  return await response.json();
}

export async function portfolioImpact(userHoldings, eventAnalysis) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/portfolio-impact`, {
      method: "POST",
      headers,
      body: JSON.stringify({ userHoldings, eventAnalysis }),
    });
    return await response.json();
  } catch (error) {
    console.error("portfolioImpact error:", error);
    return null;
  }
}

export async function runAgent(userHoldings, tip) {
  try {
    const response = await fetch(`${API_BASE}/agent/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userHoldings: userHoldings || [], tip: tip || '' }),
    });
    return await response.json();
  } catch (error) {
    console.error('runAgent error:', error);
    return null;
  }
}