export type EventType = "Macro" | "Micro";

export interface IntelligenceEvent {
  id: string;
  title: string;
  type: EventType;
  summary: string;
  sectors: string[];
  importance: "High" | "Elevated" | "Watch";
  headline: string;
  whyItMatters: string;
  affectedStocks: string[];
  confidence: number;
  reasoningTrace: string[];
  portfolioSignal: string;
}

export const intelligenceEvents: IntelligenceEvent[] = [
  {
    id: "rbi-rate-hike",
    title: "RBI signals a sharper-for-longer rate path",
    type: "Macro",
    summary: "Liquidity-sensitive sectors are repricing after a hawkish policy signal and tighter inflation language.",
    sectors: ["Banking", "Real Estate", "NBFCs"],
    importance: "High",
    headline: "A hawkish RBI signal shifts the market from chasing momentum to pricing funding pressure.",
    whyItMatters:
      "When policy commentary points to higher rates for longer, capital gets more selective. Lenders with strong deposit franchises may hold up, while rate-sensitive sectors can see near-term pressure because borrowing costs and valuation discounts rise together.",
    affectedStocks: ["HDFCBANK", "SBIN", "BAJFINANCE", "DLF"],
    confidence: 84,
    reasoningTrace: [
      "Policy language turned more restrictive than the last meeting, especially around inflation persistence.",
      "Rate-sensitive sectors underperformed during similar communication shifts in prior cycles.",
      "Banking leaders with stronger liability franchises historically absorb policy shocks better than leveraged growth plays."
    ],
    portfolioSignal: "If you hold lenders plus leveraged growth names together, the event increases concentration risk rather than creating a simple sector call."
  },
  {
    id: "capex-cycle",
    title: "Government doubles down on infrastructure capex",
    type: "Macro",
    summary: "Engineering, industrial, and logistics names are seeing a fresh demand narrative as public spending signals extend.",
    sectors: ["Infrastructure", "Capital Goods", "Logistics"],
    importance: "Elevated",
    headline: "Capex visibility improves the earnings runway for companies tied to build-out and execution quality.",
    whyItMatters:
      "Capex-led policy impulses usually travel through order books first and margins later. Companies with execution depth, balance sheet discipline, and tender visibility tend to benefit earliest, while crowded proxy trades can lag once expectations get overheated.",
    affectedStocks: ["LT", "SIEMENS", "ABB", "ADANIPORTS"],
    confidence: 78,
    reasoningTrace: [
      "Budget commentary and project pipeline updates both point to sustained public spending rather than a one-quarter spike.",
      "Order inflow leaders have started guiding for healthier backlog conversion into the next fiscal year.",
      "Logistics and equipment suppliers typically see second-order benefit as execution activity broadens."
    ],
    portfolioSignal: "Portfolios already heavy in industrial cyclicals may gain upside, but position overlap can become hidden event concentration."
  },
  {
    id: "brent-spike",
    title: "Brent crude spikes above the comfort zone",
    type: "Macro",
    summary: "Energy import pressure is forcing a reassessment across airlines, paints, chemicals, and consumer sectors.",
    sectors: ["Energy", "Aviation", "Chemicals"],
    importance: "High",
    headline: "A crude spike changes margin assumptions faster than management commentary usually can.",
    whyItMatters:
      "India's energy sensitivity means higher crude ripples beyond oil companies. Import-heavy businesses can see immediate cost pressure, while select upstream or integrated energy players may enjoy a near-term earnings tailwind depending on regulation and pass-through.",
    affectedStocks: ["RELIANCE", "ONGC", "INDIGO", "PIDILITIND"],
    confidence: 81,
    reasoningTrace: [
      "Crude has moved quickly enough to alter consensus margin assumptions for import-heavy sectors.",
      "Historical sector performance shows airlines and chemicals usually react before consumer names fully price the cost pressure.",
      "Integrated energy names can partially offset market weakness, creating a split-impact portfolio event."
    ],
    portfolioSignal: "Mixed portfolios can look resilient on the surface, but crude-linked winners and losers may cancel each other only temporarily."
  },
  {
    id: "fed-soft-landing",
    title: "Fed tone softens and risk appetite broadens",
    type: "Micro",
    summary: "Global risk-on sentiment is lifting exporters, quality growth, and duration-sensitive names.",
    sectors: ["IT", "Pharma", "Internet"],
    importance: "Watch",
    headline: "A softer Fed impulse can re-open the market's appetite for quality duration and global revenue stories.",
    whyItMatters:
      "When global policy pressure eases, investors often rotate back toward businesses with longer earnings duration. Exporters and quality growth names tend to benefit first, especially if domestic macro remains stable enough to support valuation expansion.",
    affectedStocks: ["TCS", "INFY", "SUNPHARMA", "ZOMATO"],
    confidence: 74,
    reasoningTrace: [
      "The tone shift reduces discount-rate pressure on long-duration equities.",
      "Export-oriented leaders historically outperform when global growth fears cool without a domestic macro shock.",
      "Broader risk appetite can help high-quality compounders re-rate before cyclical follow-through arrives."
    ],
    portfolioSignal: "This event tends to reward quality and patience more than tactical momentum chasing."
  }
];

export interface ScenarioInsight {
  key: string;
  label: string;
  sectors: Array<{ name: string; direction: "Up" | "Down" | "Mixed" }>;
  risk: number;
  narrative: string;
}

export const scenarioLibrary: ScenarioInsight[] = [
  {
    key: "rates",
    label: "Interest rates rise",
    sectors: [
      { name: "Banking", direction: "Mixed" },
      { name: "Real Estate", direction: "Down" },
      { name: "NBFCs", direction: "Down" }
    ],
    risk: 72,
    narrative: "Higher rates usually reward liability strength while compressing the appetite for leverage-heavy growth sectors."
  },
  {
    key: "oil",
    label: "Crude oil spikes",
    sectors: [
      { name: "Energy", direction: "Up" },
      { name: "Aviation", direction: "Down" },
      { name: "Chemicals", direction: "Down" }
    ],
    risk: 79,
    narrative: "Energy-linked winners can rally, but import-heavy sectors often face a quicker and harsher margin reset."
  },
  {
    key: "rupee",
    label: "Rupee weakens",
    sectors: [
      { name: "IT", direction: "Up" },
      { name: "Pharma", direction: "Up" },
      { name: "Consumer", direction: "Mixed" }
    ],
    risk: 58,
    narrative: "Exporters typically benefit first, while imported-input businesses face a slower but meaningful cost adjustment."
  },
  {
    key: "capex",
    label: "Government capex expands",
    sectors: [
      { name: "Infrastructure", direction: "Up" },
      { name: "Capital Goods", direction: "Up" },
      { name: "Logistics", direction: "Mixed" }
    ],
    risk: 44,
    narrative: "Execution leaders and order-book compounders tend to gain as policy support turns into visible demand."
  }
];
