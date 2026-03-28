"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Zap, CheckCircle2, TrendingUp, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const LearningProgress = () => {
  const [stats, setStats] = useState({
    accuracy: 76,
    totalLogs: 0,
    latestLesson: "Calibrating real-time accuracy...",
    isImproving: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/learning/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching learning stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    // Refresh every 30 seconds for live feedback
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-2xl p-5 space-y-4"
    >
      {/* Intelligence Pulse UI */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center relative">
            <BrainCircuit className="w-4 h-4 text-accent" />
            {stats.isImproving && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Intelligence Pulse</h4>
            <p className="text-[10px] text-text-secondary">Self-correction loop active</p>
          </div>
        </div>
        <div className="text-right">
          <span className="font-display text-xl font-bold text-accent tabular-nums">
            {stats.accuracy}%
          </span>
          <div className="flex items-center gap-1 justify-end text-[9px] text-accent">
            <TrendingUp size={10} /> {stats.totalLogs} logs
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-text-secondary/60 font-bold">
          <span>System Accuracy</span>
          <span>Target: 95%</span>
        </div>
        <Progress value={stats.accuracy} className="h-2 bg-secondary/30">
           <div 
             className="h-full bg-accent transition-all duration-1000 ease-out" 
             style={{ width: `${stats.accuracy}%` }} 
           />
        </Progress>
      </div>

      {/* System Lessons Ticker */}
      <div className="p-3 rounded-xl border border-border/10 bg-secondary/10 overflow-hidden relative group">
        <div className="flex items-center gap-2 mb-2">
          <Info size={12} className="text-accent" />
          <span className="text-[9px] uppercase tracking-widest font-bold text-text-secondary">Latest System Lesson</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={stats.latestLesson}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-[11px] leading-relaxed text-foreground font-medium italic"
          >
            "{stats.latestLesson}"
          </motion.p>
        </AnimatePresence>
        <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>

      <div className="flex items-center gap-2 pt-1 opacity-40">
        <Zap size={10} className="text-text-secondary" />
        <p className="text-[8px] uppercase tracking-widest font-medium text-text-secondary">
          Reinforcement Mode: {stats.accuracy < 80 ? "Enhanced Grounding" : "Standard"}
        </p>
      </div>
    </motion.div>
  );
};

export default LearningProgress;
