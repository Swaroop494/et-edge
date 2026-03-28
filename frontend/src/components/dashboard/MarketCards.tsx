import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import type { DashData } from "@/page-components/Dashboard";

// Mock fallback data
const MOCK = {
  nifty: { value: "24,685", change: "+0.87%", up: true },
  gainer: { value: "ADANIENT", change: "+4.32%", up: true },
  loser: { value: "WIPRO", change: "-2.18%", up: false },
};

interface MarketCardsProps {
  dashData: DashData | null;
}

const MarketCards = ({ dashData }: MarketCardsProps) => {
  const isLive = dashData !== null;

  const niftyChange = isLive ? dashData.nifty50.changePct : null;
  const niftyUp = (niftyChange ?? 1) >= 0;
  const gainerUp = (dashData?.topGainer?.changePct ?? 1) >= 0;
  const loserUp = (dashData?.topLoser?.changePct ?? -1) >= 0;

  const cards = [
    {
      label: "NIFTY 50",
      value: isLive
        ? Number(dashData.nifty50.price).toLocaleString("en-IN", { maximumFractionDigits: 2 })
        : MOCK.nifty.value,
      change: isLive
        ? `${niftyUp ? "+" : ""}${dashData.nifty50.changePct.toFixed(2)}%`
        : MOCK.nifty.change,
      up: niftyUp,
      icon: BarChart3,
    },
    {
      label: "Top Gainer",
      value: isLive ? (dashData.topGainer.ticker || "—") : MOCK.gainer.value,
      change: isLive
        ? `+${dashData.topGainer.changePct.toFixed(2)}%`
        : MOCK.gainer.change,
      up: gainerUp,
      icon: TrendingUp,
    },
    {
      label: "Top Loser",
      value: isLive ? (dashData.topLoser.ticker || "—") : MOCK.loser.value,
      change: isLive
        ? `${dashData.topLoser.changePct.toFixed(2)}%`
        : MOCK.loser.change,
      up: loserUp,
      icon: TrendingDown,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: 0.55 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="glass rounded-2xl p-4 group"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
              <card.icon className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">{card.label}</span>
          </div>
          <p className="font-display text-lg font-bold text-foreground tabular-nums">{card.value}</p>
          <span className={`text-xs font-medium tabular-nums ${card.up ? "text-accent" : "text-critical"}`}>
            {card.change}
          </span>
          {!isLive && (
            <p className="text-[9px] text-warning/70 mt-1">demo data</p>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default MarketCards;
