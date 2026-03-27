# ET Edge 🚀
### Track 6: AI for the Indian Investor — Financial Intelligence System

ET Edge is an agentic AI-driven platform built to empower the Indian retail investor by transforming high-velocity market noise into verified Alpha. In a world of finfluencer hype and news fatigue, ET Edge acts as a "Triple-Safe" fiduciary layer.

---

## 1. Core Mission & Track Alignment
### Signals over Summaries
ET Edge is not a news aggregator; it is a **Signal Extraction Engine**. While traditional tools summarize *what* happened, ET Edge targets *why it matters* to your portfolio and *if* you should trust the hype.

### Three Sequential Agentic Steps
Our autonomous agent follows a rigorous 3-step reasoning chain before surfacing any insight:
1.  **Ingestion**: Real-time multi-source data capture (NewsAPI, NSE Market Stats).
2.  **Analysis**: Multi-model event classification (Macro vs. Micro) using **Gemini 2.5 Flash-Lite** to extract impacted sectors, stocks, and secondary effects.
3.  **Actionable Alert**: Cross-referencing findings with user holdings to generate a portfolio-specific "Risk Score" and actionable strategy.

---

## 2. Feature Audit (The 'A-Z' Checklist)
| Feature | Status | Implementation Details |
| :--- | :--- | :--- |
| **Opportunity Radar** | ✅ **LIVE** | Real-time monitoring of Sensex/NIFTY news with Gemini batch analysis for sentiment & impact scores. |
| **Corporate Filings** | 🚧 **MOCK** | Currently identifying filings via news headlines; direct NSE/BSE filing extraction pending. |
| **Finfluencer Detector** | ✅ **LIVE** | Stress-tests stock tips against real-time 52-week highs, RSI proxies, and volatilities (Gemini 1.5 Pro). |
| **Sentiment Badges** | ✅ **LIVE** | Real-time confidence and validity scores (0-100) visible on every detection. |
| **What-If Engine** | ✅ **LIVE** | Grounded backtesting using ACTUAL historical data from the last 3 months to assess hypothetical scenarios. |
| **Macro Impact Mapper** | ✅ **LIVE** | Maps broad economic events (RBI Policy, FII flows) to specific stock/sector risks. |
| **AI Video Engine** | 🎨 **UI ONLY** | High-fidelity frontend prototype for Tavus/Autonomous video pipeline integration. |

---

## 3. Technical Stack & Resilience
-   **'Triple-Safe' Architecture**:
    -   **Tier 1: Gemini 2.5 Flash-Lite** — High-speed batch processing for news analysis/extraction.
    -   **Tier 2: Gemini 1.5 Pro** — Deep-reasoning for grounded fact-checking and web-search verification.
    -   **Tier 3: Local Fallback** — JSON-cached buffers to ensure app stability if API quotas are exceeded.
-   **20 RPD Limit Resilience**: 
    -   Implemented **Batch Processing** (10 headlines per request) to stay within free-tier limits.
    -   Strategic **Key Rotation** logic (Backend) to balance load between multiple API instances.
-   **Identity & Persistence**:
    -   **Firebase Auth**: Secured user login with non-anonymous session tracking.
    -   **Local Cache**: `news_cache.json` provides 15-minute data persistence to reduce redundant API calls.
    -   **Supabase**: Planned for long-term portfolio history and multi-device sync (currently in 'Sandbox' mode).

---

## 4. Scenario Pack Readiness
| Scenario | Capability | Status |
| :--- | :--- | :--- |
| **Bulk Deal** | Detection of large block trades via market headlines. | 🟠 **Partial** |
| **Technical Breakout** | Real-time cross-check of 52-week highs and price momentum. | 🟢 **Ready** |
| **Portfolio Prioritization** | Automated risk assessment based on user-provided holdings. | 🟢 **Ready** |

---

## 5. Rubric Compliance
-   **Autonomy Depth (30%)**: The `AgentRunner` operates an end-to-end chain: **Identify → Ground → Verify → Advise** without manual intervention.
-   **Technical Creativity (20%)**: Innovative use of **Gemini 2.5 Flash-Lite** for extremely low-latency batch processing and **RSI/Volatility proxy logic** for grounded fact-checking.
-   **Enterprise Readiness (20%)**: Production-grade error handling, request queuing/throttling (2s sleep), and robust fallback mechanisms.

---

## 6. Remaining 'Gaps' (To-Do List)
-   [ ] **Autonomous Tavus Pipeline**: Automate daily video Generation using real script logic (Currently mocked in UI).
-   [ ] **Direct API Integration**: Transition from NewsAPI-driven "Filings" to direct BSE/NSE corporate announcement streams.
-   [ ] **Supabase Sync**: Fully migrate local holdings cache to Supabase for multi-device investor profiles.
-   [ ] **Historical 'Scenario Archive'**: Allow users to save and share their "What-If" simulations.
