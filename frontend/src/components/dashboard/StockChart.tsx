import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const stockData = {
  "1D": [
    { t: "9:15", v: 2812 }, { t: "9:45", v: 2824 }, { t: "10:15", v: 2838 },
    { t: "10:45", v: 2831 }, { t: "11:15", v: 2847 }, { t: "11:45", v: 2842 },
    { t: "12:15", v: 2856 }, { t: "12:45", v: 2851 }, { t: "13:15", v: 2860 },
    { t: "13:45", v: 2867 }, { t: "14:15", v: 2854 }, { t: "14:45", v: 2847 },
  ],
  "1W": [
    { t: "Mon", v: 2790 }, { t: "Tue", v: 2815 }, { t: "Wed", v: 2838 },
    { t: "Thu", v: 2821 }, { t: "Fri", v: 2847 },
  ],
  "1M": [
    { t: "W1", v: 2720 }, { t: "W2", v: 2756 }, { t: "W3", v: 2801 },
    { t: "W4", v: 2847 },
  ],
};

const ranges = ["1D", "1W", "1M"] as const;

const StockChart = () => {
  const [range, setRange] = useState<keyof typeof stockData>("1D");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-xs font-semibold text-text-secondary uppercase tracking-wider">
            RELIANCE
          </h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-xl font-bold text-foreground tabular-nums">₹2,847.35</span>
            <span className="text-xs font-medium text-accent tabular-nums">+1.24%</span>
          </div>
        </div>
        <div className="flex gap-1 p-0.5 rounded-lg bg-secondary/50">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all duration-300 ${
                range === r
                  ? "bg-accent/15 text-accent shadow-[0_0_8px_hsl(var(--accent)/0.15)]"
                  : "text-text-secondary hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={range}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-36"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stockData[range]}>
              <defs>
                <linearGradient id="relianceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(258,78%,55%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(258,78%,55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={{ fontSize: 9, fill: "hsl(215,20%,60%)" }} axisLine={false} tickLine={false} />
              <YAxis domain={["dataMin - 20", "dataMax + 20"]} tick={{ fontSize: 9, fill: "hsl(215,20%,60%)" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{
                  background: "hsl(222,60%,8%)",
                  border: "1px solid hsl(222,30%,20%)",
                  borderRadius: "10px",
                  fontSize: "11px",
                  color: "hsl(220,20%,92%)",
                }}
              />
              <Area type="monotone" dataKey="v" stroke="hsl(258,78%,55%)" strokeWidth={2} fill="url(#relianceGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default StockChart;
