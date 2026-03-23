import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

const cards = [
  {
    label: "NIFTY 50",
    value: "24,685",
    change: "+0.87%",
    up: true,
    icon: BarChart3,
  },
  {
    label: "Top Gainer",
    value: "ADANIENT",
    change: "+4.32%",
    up: true,
    icon: TrendingUp,
  },
  {
    label: "Top Loser",
    value: "WIPRO",
    change: "-2.18%",
    up: false,
    icon: TrendingDown,
  },
];

const MarketCards = () => (
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
      </motion.div>
    ))}
  </div>
);

export default MarketCards;
