import { motion } from "framer-motion";
import { Zap, Brain, TrendingUp, Shield, Eye } from "lucide-react";

const features = [
  { icon: Zap, label: "Event Intelligence", desc: "Detect market-moving events before they trend" },
  { icon: Brain, label: "AI Explainability", desc: "Understand why events matter, in plain English" },
  { icon: TrendingUp, label: "Portfolio Impact", desc: "See how events affect your holdings in real-time" },
  { icon: Shield, label: "Finfluencer Detector", desc: "Verify finfluencer claims against real data" },
  { icon: Eye, label: "What-if Engine", desc: "Explore hypothetical scenarios and their outcomes" },
];

const FeatureStrip = () => (
  <section className="relative z-10 py-32 px-6">
    <div className="max-w-6xl mx-auto">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="text-center text-text-secondary text-sm font-medium tracking-widest uppercase mb-16"
      >
        Five intelligence layers
      </motion.p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.3 } }}
            className="group glass rounded-2xl p-6 cursor-default transition-shadow duration-500 hover:shadow-[0_0_30px_hsl(var(--accent)/0.12)]"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-accent/20">
              <f.icon className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-display text-sm font-semibold text-foreground mb-2">{f.label}</h3>
            <p className="text-text-secondary text-xs leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeatureStrip;
