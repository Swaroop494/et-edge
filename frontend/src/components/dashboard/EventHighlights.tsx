import { motion } from "framer-motion";
import { Zap, Globe } from "lucide-react";
import type { DashData } from "@/page-components/Dashboard";

// ── Mock fallback data ──────────────────────────────────────────────────────
const MOCK_EVENTS = [
  { headline: "RBI signals hawkish rate path",     category: "Macro", urgency: "High",     minutesAgo: 5  },
  { headline: "Capex cycle acceleration confirmed", category: "Macro", urgency: "Elevated", minutesAgo: 22 },
  { headline: "Brent crude breaches $92/bbl",       category: "Macro", urgency: "High",     minutesAgo: 45 },
  { headline: "Fed tone softens on cuts",           category: "Micro", urgency: "Watch",    minutesAgo: 70 },
];
// ────────────────────────────────────────────────────────────────────────────

const severityColor: Record<string, string> = {
  High:     "text-critical bg-critical/10",
  Elevated: "text-warning bg-warning/10",
  Watch:    "text-accent bg-accent/10",
  Normal:   "text-text-secondary bg-secondary/50",
};

function fmtAge(min: number) {
  return min < 60 ? `${min}m ago` : `${Math.floor(min / 60)}h ago`;
}

interface EventHighlightsProps {
  dashData: DashData | null;
}

const EventHighlights = ({ dashData }: EventHighlightsProps) => {
  const isLive = dashData !== null;
  const signals = isLive ? dashData.breakingSignals : MOCK_EVENTS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.7, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-2xl p-5"
    >
      <h4 className="font-display text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
        Active Events
        {!isLive && <span className="text-[9px] text-warning/70 normal-case font-normal">(demo)</span>}
      </h4>

      <div className="space-y-2.5">
        {signals.length === 0 ? (
          <p className="text-xs text-text-secondary italic">Fetching latest signals…</p>
        ) : (
          signals.map((e, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.8 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 group cursor-default"
            >
              <div className="w-6 h-6 rounded-md bg-secondary/60 flex items-center justify-center shrink-0">
                {e.category === "Macro" ? (
                  <Globe className="w-3 h-3 text-text-secondary" />
                ) : (
                  <Zap className="w-3 h-3 text-text-secondary" />
                )}
              </div>
              <p className="text-xs text-foreground leading-snug flex-1 line-clamp-1 group-hover:text-accent transition-colors duration-200">
                {e.headline}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] text-text-secondary tabular-nums">
                  {fmtAge(e.minutesAgo)}
                </span>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${severityColor[e.urgency] ?? severityColor.Normal}`}>
                  {e.urgency}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default EventHighlights;
