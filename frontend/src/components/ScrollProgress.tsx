import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { LayoutGrid, Radio, Brain, BarChart3, Video, Shield, GitFork } from "lucide-react";

interface ScrollProgressProps {
  activeIndex: number;
  onNavigate: (index: number) => void;
  labels?: string[];
}

const defaultLabels = ["overview", "event", "explain", "impact", "video", "validate", "scenario"];

const moduleConfig = [
  { icon: LayoutGrid, label: "Dashboard" },
  { icon: Radio, label: "Event Intelligence" },
  { icon: Brain, label: "Explainability" },
  { icon: BarChart3, label: "Portfolio Impact" },
  { icon: Video, label: "AI Video Brief" },
  { icon: Shield, label: "Finfluencer Detector" },
  { icon: GitFork, label: "What-if Engine" },
];

const ScrollProgress = ({ activeIndex, onNavigate, labels = defaultLabels }: ScrollProgressProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 md:flex md:flex-col md:items-center md:gap-4">
      <div className="absolute top-2 bottom-2 w-px bg-border/40" />
      {labels.map((label, index) => {
        const config = moduleConfig[index];
        const Icon = config?.icon;
        const isActive = activeIndex === index;
        const isHovered = hoveredIndex === index;

        return (
          <button
            key={label}
            onClick={() => onNavigate(index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="group relative flex h-5 w-5 items-center justify-center"
            aria-label={`Go to ${config?.label || label} scene`}
          >
            {/* Dot */}
            <motion.span
              animate={isActive ? { scale: 1.15 } : { scale: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`block rounded-full transition-all duration-500 ${
                isActive
                  ? "h-3 w-3 bg-accent shadow-[0_0_18px_hsl(var(--accent)/0.45)]"
                  : "h-2 w-2 bg-muted-foreground/30 group-hover:bg-muted-foreground/50"
              }`}
            />

            {/* Active ring with pulse */}
            {isActive && (
              <motion.span
                layoutId="progress-ring"
                className="absolute inset-0 rounded-full border border-accent/35"
                transition={{ type: "spring", stiffness: 360, damping: 28 }}
              />
            )}
            {isActive && (
              <motion.span
                className="absolute inset-[-3px] rounded-full border border-accent/20"
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            {/* Hover reveal: icon + label */}
            <AnimatePresence>
              {isHovered && Icon && (
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-7 flex items-center gap-2 pointer-events-none"
                >
                  <span className="whitespace-nowrap text-[10px] font-medium text-text-secondary/80">
                    {config.label}
                  </span>
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full backdrop-blur-md border ${
                      isActive
                        ? "bg-accent/15 border-accent/30 shadow-[0_0_12px_hsl(var(--accent)/0.3)]"
                        : "bg-card/40 border-border/30"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isActive ? "text-accent drop-shadow-[0_0_4px_hsl(var(--accent)/0.5)]" : "text-muted-foreground"
                      }`}
                      strokeWidth={1.5}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
};

export default ScrollProgress;
