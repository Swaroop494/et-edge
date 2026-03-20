

# ET Edge: Remaining Feature Integration Plan

## Current State Assessment

After reviewing the codebase, most of the requested features already exist:

- **Dashboard enrichment** — Done (MarketCards, StockChart, EventHighlights, MarketOverview, LearningLoop, FeatureCards)
- **What-If Scenario Engine** — Done (WhatIfScenarioEngine.tsx with structured outputs)
- **Learning Loop** — Done (LearningLoop.tsx in dashboard)
- **Right-side Navigation** — Done (ScrollProgress.tsx with hover icons/labels)
- **Finfluencer Detector logic** — Done but misnamed as `AIVideoEngine.tsx`

**What remains to be built:**

---

## Step 1: Fix Naming — Rename AIVideoEngine to FinfluencerDetector

The file `src/components/AIVideoEngine.tsx` is actually the Finfluencer Detector (validates stock tips, shows validity score + verdict). It will be:
- Renamed to `FinfluencerDetector.tsx`
- Badge text updated from "Finfluencer BS Detector" to "Finfluencer Detector"
- Circular progress indicator added for the validity score (replacing the plain number)
- Import updated in `Dashboard.tsx`

## Step 2: Create the Real AI Market Video Briefing Module

A new `src/components/AIVideoBriefing.tsx` component will be added as a new section in the dashboard scroll pipeline (inserted between Portfolio Impact and Finfluencer Detector).

**Contents:**
- Glassmorphism video player card with a mock placeholder (gradient thumbnail + centered play button with glowing pulse)
- Title: "Daily AI Market Brief"
- Collapsible script preview panel using the existing Collapsible component
- Key highlights as bullet points
- Data source tags (NSE, BSE, RBI, Reuters)
- Soft ambient glow around the player container
- Sequential fade-in animations on viewport entry

**Navigation update:** Add a 7th dot to ScrollProgress for the new section (Video icon mapped to the briefing module).

## Step 3: Scroll and Transition Polish

- Ensure `scroll-snap-type: y mandatory` and `scroll-snap-align: start` are consistently applied via the existing CSS classes
- Add `will-change: transform` to section containers for GPU acceleration
- Verify consistent `min-h-screen` on all sections

## Step 4: Add Circular Progress to Finfluencer Detector

Replace the large score number with a circular SVG progress ring:
- Animated stroke-dashoffset driven by the score percentage
- Score number centered inside the ring
- Themed with accent/teal glow for high scores, warning for medium, critical for low

---

## Technical Details

**Files to create:**
- `src/components/AIVideoBriefing.tsx` — new video briefing module

**Files to modify:**
- `src/components/AIVideoEngine.tsx` → rename to `src/components/FinfluencerDetector.tsx`, add circular progress, fix badge text
- `src/pages/Dashboard.tsx` — add new video briefing section, update imports, add scene ID
- `src/components/ScrollProgress.tsx` — add 7th module config entry (Video icon for briefing)
- `src/index.css` — add gradient class for the video briefing section background, verify scroll-snap rules

**Scene order after changes:**
1. Overview (Dashboard)
2. Event Intelligence
3. Explainability
4. Portfolio Impact
5. AI Video Briefing (NEW)
6. Finfluencer Detector (RENAMED)
7. What-if Engine

