# ET Edge
**Event-Driven AI Intelligence for Indian Capital Markets**

## What is ET Edge?
ET Edge is a full-stack AI platform that converts raw Indian market events — bulk deal filings, technical breakouts, macro-economic policy changes — into **personalised, portfolio-aware intelligence** for retail investors. Instead of passively summarising headlines, every module maps events directly to the user's specific holdings and generates actionable Protect/Invest signals.

The system is built around a **multi-agent architecture** where specialised AI agents (Bulk Deal Agent, Technical Agent, Portfolio News Agent) operate independently, cache their outputs to Firestore, and feed a central orchestrator (**MarketGPT**) that synthesises a single personalised answer for the user.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Next.js Frontend                   │
│  Landing · Dashboard · Events · Impact · Video       │
│  Detector · What-If · Learning Loop · MarketGPT FAB  │
└──────────────────────┬──────────────────────────────┘
                       │ REST API (Bearer Token Auth)
┌──────────────────────▼──────────────────────────────┐
│               Express.js Backend (Node)              │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐           │
│  │  Agent    │ │  Bulk    │ │ Technical  │           │
│  │  Runner   │ │  Deal    │ │  Agent     │           │
│  │ (5-step) │ │  Agent   │ │ (breakout) │           │
│  └──────────┘ └──────────┘ └────────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐           │
│  │Portfolio │ │ MarketGPT│ │ Learning   │           │
│  │News Agent│ │(orchestr)│ │   Loop     │           │
│  └──────────┘ └──────────┘ └────────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐           │
│  │Analyse   │ │Validate  │ │  What-If   │           │
│  │  Event   │ │   Tip    │ │  Scenario  │           │
│  └──────────┘ └──────────┘ └────────────┘           │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   ┌─────────┐  ┌───────────┐  ┌──────────┐
   │ Gemini  │  │ Firebase  │  │ Yahoo    │
   │  API    │  │ Firestore │  │ Finance  │
   │(Flash/  │  │  + Auth   │  │  (stock  │
   │Pro/Lite)│  │           │  │   data)  │
   └─────────┘  └───────────┘  └──────────┘
```

---

## Modules

### 1. Opportunity Radar (`/events`)
Real-time market event detection and classification.

- **Intelligent Headlines**: Fetches live Indian market news via NewsAPI/NewsData.
- **Deterministic Sector Mapping**: Batch-analyses articles using **Gemini 2.5 Flash Lite** to map news to Macro/Micro sectors (e.g., Banking, IT Services).
- **Hierarchical Analysis**: Clicking any headline triggers a full decomposition into affected sectors, NSE symbols, and a confidence score.
- **Master Sync**: Results stored in `localStorage` for downstream consumption by Portfolio Impact and Video engines.
- **Zero-Failure Fallback**: Implements 15-minute file-based caching and mock anchors if external APIs are unstable.

### 2. Portfolio Impact Simulator (`/impact`)
Maps macro events to specific user holdings.

- **Dynamic Sync**: Consumes event analysis from the Opportunity Radar via `localStorage`.
- **Exposure Scoring**: **Gemini 2.5 Flash Lite** generates a Risk Score (0–100) and an overall verdict (Safe / Caution / Risky).
- **Actionable Reasoning**: Provides plain-English explanations for per-stock impact.
- **MarketGPT Integration**: Includes a "Deep Dive" trigger that pre-populates the AI assistant with portfolio context.

### 3. Finfluencer BS-Detector (`/detector`)
Validates social media stock tips against live market data.

- **Ticker Extraction**: Backend extracts NSE/BSE symbols from unstructured text via **Gemini 2.0 Flash**.
- **Live Grounding**: Fetches real-time price, 52-week range, RSI, and momentum from Yahoo Finance.
- **News Validation**: Fetches recent headlines via **Gemini 1.5 Pro with Google Search grounding**.
- **Red-Flag Engine**: Automatically detects "guaranteed" language, overbought RSI, and unrealistic price targets.

### 4. What-If Scenario Engine (`/whatif`)
Backtested scenario analysis using verified historical data.

- **Historical Reconstruction**: Backend fetches historical price candles (3-month/1-year) from Yahoo Finance.
- **Actual vs. Hypothetical**: Computes precise actual returns and volatility based on real numbers.
- **Fiduciary Verdict**: **Gemini 2.0 Pro** evaluates the outcome with a Correct / Partially Correct / Wrong classification.

### 5. AI Video Briefing Engine (`/video`)
Autonomous market video generation pipeline.

- **Signal Retrieval**: Queries Firestore for signals marked `is_video_worthy: true`.
- **Autonomous Scripting**: **Gemini 2.0 Flash** converts raw market data into a 60-second broadcast script.
- **Digital Twin Synthesis**: Dispatches script to **Tavus AI API** for video generation.
- **Progress Tracking**: Real-time 4-stage UI (Signal → Script → Synthesis → Ready).

### 6. MarketGPT — Global AI Command Center
Persistent chat assistant available across the entire platform.

- **React Portal Implementation**: FAB remains visible and interactive regardless of page navigation.
- **Agent Intelligence**: Routes queries to specialized agents (Bulk Deal, Technical, Portfolio News).
- **Recursive Memory**: Injects historical lessons from `system_knowledge` to prevent repetitive reasoning errors.

### 7. Intelligence Dashboard (`/dashboard`)
The central command hub for market activity.

- **Market Cards**: High-fidelity trackers for Nifty 50 and Top Movers.
- **Top Movers Grid**: Visual heatmap of institutional activity (Reliance, TCS, HDFC Bank) with randomized drift for demo variety.
- **Agent Reasoning Trace**: Visible step-by-step logic for the 5-step autonomous agent pipeline.

### 8. Recursive Learning Loop (`/learning`)
The platform's self-correction differentiator.

- **Feedback Logging**: Stores prediction vs actual outcomes in Firestore.
- **Recursive Auditor**: **Gemini 1.5 Flash** identifies reasoning blind spots and generates "Refinement Rules".
- **Knowledge Injection**: Rules are stored in `system_knowledge` and injected into every MarketGPT prompt.

### 9. Input-Agnostic Scenario Engine
Generative, triple-axis analysis engine for any market signal.

- **Triple-Axis Lens**: Automatically evaluates events through Bulk Activity, Technical, and Portfolio perspectives.
- **Post-Mortem Audit**: Ensures the system learns from its own assessments through the Learning Loop.

---

## API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/live-news` | GET | Batch-analysed Indian market headlines |
| `/api/dashboard` | GET | Aggregated market cards and movers (Port 5500 sync) |
| `/api/validate-tip` | POST | Finfluencer tip validation with live grounding |
| `/api/what-if` | POST | Backtested scenario analysis |
| `/api/agent/run` | POST | 5-step autonomous agent pipeline |
| `/api/learning/log` | POST | Log prediction vs actual outcome |

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 18, Tailwind CSS |
| **Animation/Charts** | Framer Motion, Recharts |
| **Database/Auth** | Firebase Firestore & Authentication |
| **Backend** | Node.js + Express (Proxy Port 5500) |
| **AI Models** | Gemini 2.0 Flash, Gemini 1.5 Pro, Gemini 2.5 Flash Lite |
| **Video** | Tavus AI API |

---

## Environment Variables

### Backend (`backend/.env`)
```env
OPENROUTER_API_KEY=   # Get from openrouter.ai
NEWSDATA_API_KEY=     # Get from newsdata.io
PORT=5500
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
# ... other standard Firebase keys
VITE_TAVUS_API_KEY=   # Get from tavus.io
VITE_REPLICA_ID=
VITE_PERSONA_ID=
```

---

## Getting Started

```bash
# Clone
git clone <repo-url> && cd et-edge

# Start Backend (Port 5500)
cd backend && npm install && npm run dev

# Start Frontend (Port 3000)
cd frontend && npm install && npm run dev
```

---

## Disclaimer
> AI-generated analysis. Not licensed financial advice. ET Edge is a prototype built for educational and demonstration purposes. Always consult a SEBI-registered advisor before making investment decisions.
