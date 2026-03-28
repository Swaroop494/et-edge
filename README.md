<p align="center">
  <strong>ET Edge</strong><br/>
  <em>Event-Driven AI Intelligence for Indian Capital Markets</em>
</p>

---

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

- Fetches live Indian market headlines via NewsAPI
- Batch-analyses up to 10 articles using **Gemini 2.5 Flash Lite** — each article gets a sentiment score, impact rating, and one-line reasoning
- Clicking any headline triggers a full event analysis: affected sectors, affected NSE symbols, confidence score, and an actionable alert
- Results stored in `localStorage` for downstream modules (Portfolio Impact, Video Engine)
- **15-minute file-based cache** to prevent redundant API calls; **mock fallback** from `radar_events.json` if NewsAPI is down

### 2. Portfolio Impact Simulator (`/impact`)
Maps macro events to specific user holdings.

- User enters comma-separated NSE tickers (e.g., `HDFCBANK, TCS, RELIANCE`)
- Consumes the event analysis from Opportunity Radar via `localStorage`
- **Gemini 2.5 Flash Lite** generates: overall verdict (Safe / Caution / Risky), risk score (0–100), per-stock impact with plain-English explanations
- Includes a "Deep Dive" button that opens **MarketGPT** pre-populated with portfolio context
- Input validated with **Zod** schema (tickers only, max 120 chars)

### 3. Finfluencer BS-Detector (`/detector`)
Validates social media stock tips against live market data.

- User pastes a claim (e.g., "HDFC will hit ₹2000 next week, guaranteed!")
- Backend extracts NSE/BSE ticker via **Gemini 2.0 Flash**, then fetches **real stock data** from Yahoo Finance (current price, 52-week range, RSI proxy, 3-month return, volatility, 10-day momentum)
- Fetches recent news via **Gemini 1.5 Pro with Google Search grounding**
- Applies automated red-flag rules: price target exceeds 52W high by >20%, "guaranteed" language, bearish momentum + bullish claim, overbought RSI
- Returns validity score (0–100), verdict (Valid / Misleading / Hype / Invalid / Noise), red flags, and positive signals
- Non-existent tickers immediately score 0 with "Stock does not exist on NSE/BSE"

### 4. What-If Scenario Engine (`/whatif`)
Backtested scenario analysis using verified historical data.

- User types a plain-English hypothesis (e.g., "What if I had bought TCS 3 months ago?")
- Backend extracts ticker, fetches 3-month historical closes from Yahoo Finance, computes actual return, best/worst price in period, annualised volatility
- **Gemini 2.0 Pro** evaluates the scenario using only real numbers — no invented prices
- Returns: actual outcome, scenario assessment, risk highlights, verdict (Correct / Partially correct / Wrong / Unverifiable)

### 5. AI Video Briefing Engine (`/video`)
Autonomous market video generation pipeline.

- **Step 1 — Signal Retrieval**: Queries Firestore `market_signals` for documents flagged `is_video_worthy: true` (impact score > 0.7)
- **Step 2 — Script Generation**: **Gemini 2.0 Flash** converts raw signal data into a 60-second broadcast script
- **Step 3 — Video Synthesis**: Dispatches script to **Tavus AI API** for digital twin video generation
- Falls back to a local demo video (`/assets/videos/et-edge-demo.mp4`) if APIs are unavailable
- Real-time progress UI with 4-stage indicator (Signal → Script → Synthesis → Ready)

### 6. MarketGPT — Global AI Command Center
Persistent FAB-based chat assistant available on every page.

- Rendered via **React Portal** at `document.body` level — never clipped by parent layouts
- **Intent Router**: Gemini analyses the query, identifies relevant symbols, and routes to specialised backend agents (bulk_deal, technical_analysis, portfolio_news)
- **Firestore Agent Consultation**: Checks `market_signals` collection for cached agent outputs before making new API calls
- **Recursive Knowledge Injection**: Fetches the 3 most recent entries from `system_knowledge` collection and injects them into every prompt as "lessons to avoid repeating"
- Every response includes impact level (Low/Medium/High), source citations, portfolio context, and a SEBI disclaimer
- Mobile: occupies `100dvh` with safe-area inset padding; Desktop: centered modal with glass morphism

### 7. Intelligence Dashboard (`/dashboard`)
Central hub displaying:

- **Market Cards**: Summary indices
- **Market Overview**: Interactive price chart
- **Stock Chart**: Symbol-specific technical view (Recharts)
- **Event Highlights**: Recent high-impact events
- **Learning Progress**: Accuracy trend from the Learning Loop
- **Feature Cards**: Quick navigation to all modules
- **Agent Runner**: 5-step autonomous pipeline (Live News → Event Analysis → Tip Validation → Portfolio Impact → Summary) with visible reasoning trace
- **Signal Agent**: Three tabbed specialist agents (Bulk Deal, Technical Breakout, Portfolio News Priority) each with full reasoning trace, Firestore caching, and structured result display

### 8. Recursive Learning Loop (`/learning`)
Self-correction mechanism — the platform's technical differentiator.

- **Feedback Logging** (`POST /api/learning/log`): Accepts prediction vs actual outcome, computes deviation score, stores in Firestore `learning_logs`
- **Recursive Auditor** (`learningService.js`): Asynchronously triggered post-mortem using **Gemini 1.5 Flash** — identifies blind spots, generates a one-sentence refinement rule, assesses severity
- **Knowledge Injection**: Refinement rules are saved to `system_knowledge` collection and dynamically injected into MarketGPT's system prompt on every query
- **Accuracy Dashboard** (`GET /api/learning/stats`): Computes real-time accuracy from logged outcomes, triggers `verificationDepth: 3` (triple-checking mode) when accuracy drops below 80%
- **Frontend UI**: Weekly accuracy trend chart (Recharts), prediction log with add/edit, overall accuracy display

### 9. Input-Agnostic Scenario Engine
A generative, triple-axis analysis engine that works on any signal.

- **The 'Any-Signal' Parser**: Accepts specific manual triggers (e.g., judges' prompts) or automatically picks the highest-impact signal from the system cache.
- **Triple-Axis Analysis**: Automatically evaluates any signal through three core fiduciary lenses:
    - **Bulk/Block Perspective**: Deconstructs institutional and promoter activity.
    - **Technical Perspective**: Identifies immediate support and resistance levels.
    - **Portfolio Perspective**: Assesses risk impact for a diversified retail investor.
- **Self-Correction Audit**: Every surprise scenario generates a Prediction Log. When the market outcome is tracked later, the 'Self-Correction Loop' audits the performance, proving the system learns even from unexpected events.

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/live-news` | GET | Batch-analysed Indian market headlines |
| `/api/analyze-event` | POST | Event classification (sectors, stocks, confidence) |
| `/api/validate-tip` | POST | Finfluencer tip validation with live stock grounding |
| `/api/what-if` | POST | Backtested scenario analysis |
| `/api/portfolio-impact` | POST | Per-stock impact assessment |
| `/api/agent/run` | POST | 5-step autonomous agent pipeline |
| `/api/agent/bulk-deal` | POST | Promoter bulk deal distress analysis |
| `/api/agent/technical` | POST | Technical breakout detection |
| `/api/agent/portfolio-news` | POST | Multi-event portfolio prioritisation |
| `/api/market-gpt` | POST | Orchestrator chat with agent consultation |
| `/api/learning/log` | POST | Log prediction vs actual outcome |
| `/api/learning/stats` | GET | Real-time accuracy and lesson retrieval |

All specialised agents (Bulk Deal, Technical, Portfolio News) implement:
- **4-hour Firestore TTL cache** — checks `market_signals` before making any Gemini call
- **Quota-safe error handling** — on HTTP 429, serves the most recent cached result instead of failing
- **`is_video_worthy` flagging** — signals with impact score > 0.7 are automatically marked for the Video Engine

---

## Backend Services

| Service | File | Purpose |
| :--- | :--- | :--- |
| **Stock Data** | `services/stockData.js` | Yahoo Finance integration: fetches 3-month daily candles, computes SMA-20/60, RSI proxy, 10-day momentum, annualised volatility, trend classification |
| **Ticker Extractor** | `services/extractTicker.js` | Gemini-powered NSE/BSE symbol extraction from natural language |
| **News Grounding** | `services/newsGrounding.js` | Gemini 1.5 Pro with Google Search tool for real-time news verification |
| **Learning Service** | `services/learningService.js` | Recursive Auditor: post-mortem analysis, blind spot detection, refinement rule generation |
| **Firebase** | `services/firebase.js` | Firebase Admin SDK initialisation (Firestore) |

---

## Firestore Collections

| Collection | Purpose |
| :--- | :--- |
| `market_signals` | Cached agent outputs (bulk deal, technical, portfolio news). Queried by symbol, type, and timestamp for 4-hour TTL. Contains `is_video_worthy` flag for Video pipeline. |
| `learning_logs` | Prediction vs actual outcome records. Contains deviation scores, refinement results, and status tracking. |
| `system_knowledge` | Extracted "lessons learned" from the Recursive Auditor. Injected into MarketGPT's system prompt to prevent repeated reasoning errors. |

---

## Tech Stack

| Layer | Technology | Version |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | 16.x |
| **UI Library** | React | 18.2 |
| **Styling** | Tailwind CSS + custom glassmorphic design system | 4.x |
| **Components** | Radix UI (via shadcn/ui) | — |
| **Animation** | Framer Motion | 12.x |
| **Charts** | Recharts | 2.x |
| **Validation** | Zod | — |
| **Auth** | Firebase Authentication (client SDK) | 12.x |
| **Backend** | Node.js + Express | 4.x |
| **AI — Fast inference** | Gemini 2.0 Flash | — |
| **AI — Deep reasoning** | Gemini 2.0 Pro, 1.5 Pro (with Google Search grounding) | — |
| **AI — Batch analysis** | Gemini 2.5 Flash Lite | — |
| **AI — Post-mortem** | Gemini 1.5 Flash | — |
| **Database** | Firebase Firestore (Admin SDK) | — |
| **Market Data** | Yahoo Finance API (NSE/BSE) | — |
| **News** | NewsAPI | — |
| **Video Synthesis** | Tavus AI API | — |

---

## Environment Variables

### Backend (`backend/.env`)
```
GEMINI_API_KEY=           # Google Gemini API key
NEWS_API_KEY=             # NewsAPI.org key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=  # Firebase project ID (used by Admin SDK)
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_GEMINI_API_KEY=        # For client-side Video script generation
NEXT_PUBLIC_TAVUS_API_KEY=         # Tavus AI video synthesis
NEXT_PUBLIC_TAVUS_REPLICA_ID=      # Tavus digital twin replica
```

---

## Getting Started

```bash
# Clone
git clone <repo-url> && cd et-edge

# Backend
cd backend
npm install
cp .env.example .env  # Fill in API keys
npm run dev            # Starts on port 5000

# Frontend (separate terminal)
cd frontend
npm install
cp .env.local.example .env.local  # Fill in Firebase + API keys
npm run dev            # Starts on port 3000
```

---

## Project Structure

```
et-edge/
├── backend/
│   ├── index.js                  # Express server, route registration, error handler
│   ├── routes/
│   │   ├── agent.js              # 5-step autonomous agent pipeline
│   │   ├── analyzeEvent.js       # Event classification
│   │   ├── bulkDealAgent.js      # Promoter bulk deal analysis + Firestore cache
│   │   ├── technicalAgent.js     # Technical breakout detection + Firestore cache
│   │   ├── portfolioNewsAgent.js # Multi-event portfolio prioritisation + cache
│   │   ├── marketGpt.js          # Orchestrator with agent consultation + lessons
│   │   ├── liveNews.js           # Batch news analysis with file caching
│   │   ├── validateTip.js        # Tip validation with live stock + news grounding
│   │   ├── whatIf.js             # Backtested scenario engine
│   │   ├── portfolioImpact.js    # Per-stock impact assessment
│   │   └── learningLoop.js       # Feedback logging + accuracy stats
│   ├── services/
│   │   ├── firebase.js           # Firebase Admin SDK
│   │   ├── stockData.js          # Yahoo Finance: prices, SMA, RSI, volatility
│   │   ├── extractTicker.js      # AI ticker extraction
│   │   ├── newsGrounding.js      # Gemini + Google Search for news context
│   │   └── learningService.js    # Recursive Auditor post-mortem
│   └── middleware/
│       └── cors.js               # CORS configuration
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── MarketChat.tsx     # MarketGPT FAB (React Portal)
│       │   ├── AgentRunner.tsx    # 5-step agent with reasoning trace UI
│       │   ├── SignalAgent.tsx    # Tabbed specialist agents (Bulk/Tech/Portfolio)
│       │   ├── OpportunityRadar.tsx  # Event detection + analysis
│       │   ├── FinfluencerDetector.tsx # Tip validation UI
│       │   ├── WhatIfScenarioEngine.tsx # Scenario input + results
│       │   ├── VideoReport.tsx    # Video pipeline with progress stages
│       │   ├── AIVideoBriefing.tsx # Video page layout with highlights
│       │   ├── DashboardLayout.tsx # Authenticated layout wrapper
│       │   ├── DashboardNav.tsx   # Sidebar (desktop) + bottom bar (mobile)
│       │   ├── ChartIntelligence.tsx # Technical chart component
│       │   └── dashboard/        # MarketCards, StockChart, EventHighlights, etc.
│       ├── page-components/
│       │   ├── Dashboard.tsx      # Main dashboard page
│       │   ├── PortfolioImpact.tsx # Portfolio simulator page
│       │   ├── LearningLoopPage.tsx # Accuracy tracking + prediction log
│       │   ├── Landing.tsx        # Public landing page
│       │   └── Login.tsx          # Firebase auth login
│       ├── context/
│       │   ├── AuthContext.tsx    # Firebase auth state provider
│       │   └── AIContext.tsx      # Chat open/close + initial message state
│       ├── utils/
│       │   └── api.js            # All backend API calls with auth token injection
│       └── lib/
│           └── firebase.ts       # Firebase client SDK init
└── data/
    └── radar_events.json         # Fallback mock events
```

---

## Disclaimer

> AI-generated analysis. Not licensed financial advice. ET Edge is a prototype built for educational and demonstration purposes. Always consult a SEBI-registered advisor before making investment decisions.
