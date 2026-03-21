import { motion } from "framer-motion";

const signals = [
  "⚡ Macro Event Detected: RBI Policy Review",
  "📊 FII Activity High — ₹2,340 Cr Net Inflow",
  "🔄 Sector Rotation: Banking ↑  IT ↓",
  "🛡️ Finfluencer Alert: 3 Claims Flagged",
  "📈 NIFTY 50 Breakout Above 24,700",
  "🧠 AI Confidence: 94% on HDFC Prediction",
  "⚠️ Event Impact: Crude Oil ↑ 3.2%",
  "🎯 Portfolio Risk Shift Detected",
];

const duplicated = [...signals, ...signals];

const DataTicker = () => (
  <div className="absolute bottom-[8%] left-0 right-0 z-[6] overflow-hidden pointer-events-none">
    <motion.div
      className="flex gap-8 whitespace-nowrap"
      animate={{ x: ["0%", "-50%"] }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
    >
      {duplicated.map((s, i) => (
        <span
          key={i}
          className="text-[11px] font-medium tracking-wide"
          style={{ color: "hsl(var(--text-secondary) / 0.6)" }}
        >
          {s}
        </span>
      ))}
    </motion.div>
  </div>
);

export default DataTicker;
