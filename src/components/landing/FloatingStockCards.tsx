import { motion } from "framer-motion";

const stocks = [
  { name: "RELIANCE", price: "₹2,847", change: "+1.24%", up: true, x: "8%", y: "22%" },
  { name: "INFY", price: "₹1,632", change: "+0.87%", up: true, x: "82%", y: "18%" },
  { name: "TCS", price: "₹3,945", change: "-0.42%", up: false, x: "5%", y: "62%" },
  { name: "HDFCBANK", price: "₹1,712", change: "+1.65%", up: true, x: "85%", y: "58%" },
  { name: "ADANIENT", price: "₹2,518", change: "+3.12%", up: true, x: "12%", y: "42%" },
  { name: "WIPRO", price: "₹487", change: "-1.38%", up: false, x: "78%", y: "40%" },
];

const FloatingStockCards = () => (
  <div className="absolute inset-0 pointer-events-none z-[5]">
    {stocks.map((s, i) => (
      <motion.div
        key={s.name}
        className="absolute glass rounded-xl px-3 py-2 min-w-[110px]"
        style={{ left: s.x, top: s.y }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: [0, 0.7, 0.7, 0.7, 0],
          y: [0, -8, 0, 8, 0],
        }}
        transition={{
          opacity: { duration: 8, repeat: Infinity, delay: i * 1.2, ease: "easeInOut" },
          y: { duration: 6 + i * 0.5, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <p className="text-[10px] font-semibold text-foreground/80 tracking-wider">{s.name}</p>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-xs font-bold text-foreground/70 tabular-nums">{s.price}</span>
          <span className={`text-[9px] font-medium tabular-nums ${s.up ? "text-accent" : "text-critical"}`}>
            {s.change}
          </span>
        </div>
      </motion.div>
    ))}
  </div>
);

export default FloatingStockCards;
