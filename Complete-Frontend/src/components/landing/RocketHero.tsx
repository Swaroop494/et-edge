import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import etEdgeLogo from "@/assets/et-edge-logo.png";
import FloatingStockCards from "./FloatingStockCards";
import MiniCharts from "./MiniCharts";
import DataTicker from "./DataTicker";

const RocketHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Deep layered background */}
      <div className="absolute inset-0 gradient-hero" />

      {/* Faint background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--accent) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent) / 0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Ambient orbs */}
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full blur-[200px]"
        style={{ top: "5%", left: "10%", background: "hsl(var(--deep-purple) / 0.25)" }}
        animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[180px]"
        style={{ bottom: "5%", right: "5%", background: "hsl(var(--teal) / 0.20)" }}
        animate={{ x: [0, -35, 0], y: [0, 50, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Soft pulse signals */}
      {[
        { x: "18%", y: "30%", delay: 0 },
        { x: "75%", y: "25%", delay: 2 },
        { x: "65%", y: "70%", delay: 4 },
        { x: "25%", y: "72%", delay: 6 },
      ].map((p, i) => (
        <motion.div
          key={`pulse-${i}`}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: p.x,
            top: p.y,
            background: "hsl(var(--accent) / 0.5)",
            boxShadow: "0 0 12px hsl(var(--accent) / 0.4)",
          }}
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* ── ROCKET ANIMATION ── */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          animate={{ bottom: ["5%", "85%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="w-3 h-10 rounded-full"
            style={{
              background: "linear-gradient(to top, hsl(var(--accent) / 0.9), hsl(var(--neon-cyan) / 0.6), transparent)",
              boxShadow: "0 0 20px hsl(var(--accent) / 0.5), 0 0 60px hsl(var(--accent) / 0.2)",
            }}
          />
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
            style={{ background: "hsl(var(--neon-cyan))", boxShadow: "0 0 12px hsl(var(--neon-cyan) / 0.8)" }}
          />
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-24 blur-sm"
            style={{ background: "linear-gradient(to bottom, hsl(var(--accent) / 0.5), transparent)" }}
          />
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-8 h-32 blur-xl"
            style={{ background: "linear-gradient(to bottom, hsl(var(--accent) / 0.15), transparent)" }}
          />
        </motion.div>

        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl"
          style={{ background: "hsl(var(--accent) / 0.08)" }}
          animate={{ bottom: ["5%", "85%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: [0.16, 1, 0.3, 1] }}
        />

        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `calc(50% + ${(i % 2 === 0 ? -1 : 1) * (3 + i * 3)}px)`,
              background: "hsl(var(--accent) / 0.6)",
            }}
            animate={{ bottom: ["15%", "75%"], opacity: [0, 0.7, 0] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
          />
        ))}
      </div>

      {/* ── RIPPLE CIRCLES ── */}
      <div className="absolute top-[12%] left-1/2 -translate-x-1/2 pointer-events-none">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={`ripple-${i}`}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ border: "1px solid hsl(var(--accent) / 0.2)" }}
            animate={{ width: [24, 280, 400], height: [24, 280, 400], opacity: [0.5, 0.1, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: i * 1.2, ease: "easeOut" }}
          />
        ))}
      </div>

      {/* ── FLOATING STOCK CARDS ── */}
      <FloatingStockCards />

      {/* ── MINI CHARTS ── */}
      <MiniCharts />

      {/* ── HERO TEXT ── */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        {/* Logo — circular clip to remove any background */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: "blur(12px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <img
            src={etEdgeLogo}
            alt="ET Edge"
            className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 mx-auto rounded-full object-cover"
            style={{
              filter: "drop-shadow(0 0 40px hsl(var(--neon-cyan) / 0.4))",
            }}
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(12px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <h1 className="font-display text-7xl sm:text-8xl md:text-9xl font-bold leading-[0.9] tracking-tight">
            <span
              className="inline-block"
              style={{
                background: "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--teal)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 30px hsl(var(--neon-cyan) / 0.3))",
              }}
            >
              ET
            </span>{" "}
            <span
              className="inline-block"
              style={{
                background: "linear-gradient(135deg, hsl(var(--electric-violet)), hsl(var(--deep-purple)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 30px hsl(var(--electric-violet) / 0.3))",
              }}
            >
              Edge
            </span>
          </h1>
        </motion.div>

        {/* Enhanced tagline — staggered word reveal */}
        <div className="mb-12 max-w-2xl mx-auto">
          {["See the", "event", "before it becomes", "everyone else's", "story."].map(
            (word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.6, delay: 0.9 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block mr-[0.35em]"
              >
                <span
                  className={`font-display text-xl sm:text-2xl md:text-3xl font-semibold leading-snug ${
                    word === "event" || word === "story."
                      ? ""
                      : "text-foreground/70"
                  }`}
                  style={
                    word === "event" || word === "story."
                      ? {
                          background: "linear-gradient(90deg, hsl(var(--neon-cyan)), hsl(var(--accent)))",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          filter: "drop-shadow(0 0 8px hsl(var(--accent) / 0.25))",
                        }
                      : undefined
                  }
                >
                  {word}
                </span>
              </motion.span>
            )
          )}
        </div>

        {/* Login CTA */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/login")}
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-display font-semibold text-base transition-shadow duration-500"
          style={{
            background: "hsl(var(--accent))",
            color: "hsl(var(--accent-foreground))",
            boxShadow: "0 0 0px hsl(var(--accent) / 0)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 50px hsl(var(--accent) / 0.4)")}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 0px hsl(var(--accent) / 0)")}
        >
          Login
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </motion.button>
      </div>

      {/* ── DATA TICKER ── */}
      <DataTicker />

      {/* Vignette */}
      <div className="absolute inset-0 vignette-soft pointer-events-none" />
    </section>
  );
};

export default RocketHero;
