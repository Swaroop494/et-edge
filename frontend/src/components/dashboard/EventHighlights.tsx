import { motion } from "framer-motion";
import { Zap, Globe } from "lucide-react";

const events = [
  { title: "RBI signals hawkish rate path", type: "Macro" as const, severity: "High" },
  { title: "Capex cycle acceleration confirmed", type: "Macro" as const, severity: "Elevated" },
  { title: "Brent crude breaches $92/bbl", type: "Macro" as const, severity: "High" },
  { title: "Fed tone softens on cuts", type: "Micro" as const, severity: "Watch" },
];

const severityColor: Record<string, string> = {
  High: "text-critical bg-critical/10",
  Elevated: "text-warning bg-warning/10",
  Watch: "text-accent bg-accent/10",
};

const EventHighlights = () => (
  <motion.div
    initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    transition={{ duration: 0.7, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
    className="glass rounded-2xl p-5"
  >
    <h4 className="font-display text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
      Active Events
    </h4>
    <div className="space-y-2.5">
      {events.map((e, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.8 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 group cursor-default"
        >
          <div className="w-6 h-6 rounded-md bg-secondary/60 flex items-center justify-center shrink-0">
            {e.type === "Macro" ? (
              <Globe className="w-3 h-3 text-text-secondary" />
            ) : (
              <Zap className="w-3 h-3 text-text-secondary" />
            )}
          </div>
          <p className="text-xs text-foreground leading-snug flex-1 line-clamp-1 group-hover:text-accent transition-colors duration-200">
            {e.title}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-secondary/50 text-text-secondary">
              {e.type}
            </span>
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${severityColor[e.severity]}`}>
              {e.severity}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default EventHighlights;
