// ET Edge — Frontend API utility. Import these functions to call the backend.

const API_BASE = "http://localhost:5000/api";

export async function fetchLiveNews() {
  try {
    const response = await fetch(`${API_BASE}/live-news`);
    return await response.json();
  } catch (error) {
    console.error("fetchLiveNews error:", error);
    return [];
  }
}

export async function analyzeEvent(headline, summary) {
  try {
    const response = await fetch(`${API_BASE}/analyze-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    const response = await fetch(`${API_BASE}/validate-tip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipText, newsContext }),
    });
    return await response.json();
  } catch (error) {
    console.error("validateTip error:", error);
    return null;
  }
}

export async function portfolioImpact(userHoldings, eventAnalysis) {
  try {
    const response = await fetch(`${API_BASE}/portfolio-impact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userHoldings, eventAnalysis }),
    });
    return await response.json();
  } catch (error) {
    console.error("portfolioImpact error:", error);
    return null;
  }
}
