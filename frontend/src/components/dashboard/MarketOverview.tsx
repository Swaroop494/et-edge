import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import type { DashData } from "@/page-components/Dashboard";

// ── Mock fallback data ──────────────────────────────────────────────────────
const MOCK_CHART = [
  { time: "9:15", price: 24180 }, { time: "9:45", price: 24220 },
  { time: "10:15", price: 24350 }, { time: "10:45", price: 24290 },
  { time: "11:15", price: 24410 }, { time: "11:45", price: 24380 },
  { time: "12:15", price: 24520 }, { time: "12:45", price: 24480 },
  { time: "13:15", price: 24560 }, { time: "13:45", price: 24620 },
  { time: "14:15", price: 24590 }, { time: "14:45", price: 24670 },
  { time: "15:15", price: 24710 }, { time: "15:30", price: 24685 },
];

const MOCK_MOVERS = [
  { ticker: "RELIANCE", price: 2847.35, changePct: 1.24, change: 34.80 },
  { ticker: "TCS",      price: 3912.10, changePct: -0.38, change: -14.93 },
  { ticker: "HDFC BANK",price: 1672.80, changePct: 0.91, change: 15.12 },
  { ticker: "INFOSYS",  price: 1543.25, changePct: 2.17, change: 32.79 },
  { ticker: "ITC",      price: 467.50,  changePct: -0.62, change: -2.91 },
];

const MOCK_NEWS = [
  { headline: "RBI signals potential rate hike in upcoming policy review",              category: "Macro",    urgency: "High",     minutesAgo: 2 },
  { headline: "Reliance Industries announces $3.2B green energy investment",            category: "Sector",   urgency: "Elevated", minutesAgo: 14 },
  { headline: "IT sector faces headwinds as US spending contracts Q3",                 category: "Earnings", urgency: "Watch",    minutesAgo: 38 },
  { headline: "FII outflows cross ₹8,200 Cr in current week",                         category: "Flow",     urgency: "Normal",   minutesAgo: 60 },
];
// ────────────────────────────────────────────────────────────────────────────

function fmtAge(min: number) {
  return min < 60 ? `${min}m ago` : `${Math.floor(min / 60)}h ago`;
}

const urgencyClass: Record<string, string> = {
  High:     "bg-critical/10 text-critical",
  Elevated: "bg-warning/10 text-warning",
  Watch:    "bg-accent/10 text-accent",
  Normal:   "bg-secondary/50 text-text-secondary",
};

interface MarketOverviewProps {
  dashData: DashData | null;
}

const MarketOverview = ({ dashData }: MarketOverviewProps) => {
  const isLive = dashData !== null;

  const price     = isLive ? dashData.nifty50.price     : 24685.40;
  const changePct = isLive ? dashData.nifty50.changePct : 0.87;
  const isUp      = changePct >= 0;
  const chartData = isLive ? dashData.nifty50.chartData : MOCK_CHART;
  const movers    = isLive ? dashData.topMovers         : MOCK_MOVERS;
  const signals   = isLive ? dashData.breakingSignals   : MOCK_NEWS;
  const marketOpen = isLive ? dashData.dataQuality.marketOpen : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6"
    >
      {/* Main chart */}
      <div className="lg:col-span-7 glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">NIFTY 50</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-2xl font-bold text-foreground">
                {Number(price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
              <span className={`flex items-center gap-1 text-xs font-medium ${isUp ? "text-accent" : "text-critical"}`}>
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isUp ? "+" : ""}{changePct.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {marketOpen && (
              <span className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent">
                <Activity className="w-3 h-3" /> Live
              </span>
            )}
            {!isLive && (
              <span className="text-[9px] text-warning/70">demo data</span>
            )}
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="niftyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(168,100%,48%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(168,100%,48%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215,20%,60%)" }} axisLine={false} tickLine={false} />
              <YAxis domain={["dataMin - 50", "dataMax + 50"]} tick={{ fontSize: 10, fill: "hsl(215,20%,60%)" }} axisLine={false} tickLine={false} width={45} />
              <Tooltip
                contentStyle={{
                  background: "hsl(222,60%,8%)",
                  border: "1px solid hsl(222,30%,20%)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "hsl(220,20%,92%)",
                }}
              />
              <Area type="monotone" dataKey="price" stroke="hsl(168,100%,48%)" strokeWidth={2} fill="url(#niftyGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right column: movers + signals */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Top Movers */}
        <div className="glass rounded-2xl p-4 flex-1">
          <h4 className="font-display text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Top Movers
          </h4>
          <div className="space-y-2.5">
            {movers.map((s) => {
              const up = s.changePct >= 0;
              return (
                <div key={s.ticker} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{s.ticker}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary tabular-nums">
                      ₹{Number(s.price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </span>
                    <span className={`flex items-center gap-0.5 text-xs font-medium tabular-nums ${up ? "text-accent" : "text-critical"}`}>
                      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {up ? "+" : ""}{s.changePct.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breaking Signals */}
        <div className="glass rounded-2xl p-4 flex-1">
          <h4 className="font-display text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Breaking Signals
            {!isLive && <span className="ml-2 text-[9px] text-warning/70 normal-case font-normal">(demo)</span>}
          </h4>
          <div className="space-y-3">
            {signals.length === 0 ? (
              <p className="text-xs text-text-secondary italic">Fetching latest signals…</p>
            ) : (
              signals.map((n, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-[10px] text-text-secondary whitespace-nowrap mt-0.5 tabular-nums w-12 shrink-0">
                    {fmtAge(n.minutesAgo)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-foreground leading-snug line-clamp-2">{n.headline}</p>
                    <span className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${urgencyClass[n.urgency] ?? "bg-secondary/50 text-text-secondary"}`}>
                      {n.category}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketOverview;
