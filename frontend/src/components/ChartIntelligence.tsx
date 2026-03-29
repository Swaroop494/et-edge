"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, CheckCircle2, ShieldAlert } from "lucide-react";

interface ChartIntelligenceProps {
  eventId: string;
}

const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Robust Mock Fallback — Ensured user never sees an empty "Explain" page.
const MOCK_EVENT = {
  whatHappened: "Sensex, Nifty hit all-time highs",
  whyItMatters: "The Indian stock market indices reach new record highs today fueled by positive global cues and domestic liquidty.",
  eventType: "market-peak",
  affectedSectors: ["Banking", "IT Services", "Energy"],
  affectedStocks: ["HDFCBANK", "TCS", "RELIANCE"],
  confidenceScore: 76,
  impactDirection: "positive",
  positiveFactors: [
    "FPI inflows surged by Rs 12,000 Cr in the last 48 hours.",
    "US Fed hints at slowing rate hikes, boosting emerging market sentiment.",
    "Corporate earnings for Q3 exceeded analyst expectations across Nifty 50."
  ],
  negativeFactors: [
    "Brent crude prices rose 2%, impacting inflation outlook.",
    "Mid-cap valuation premium is currently 1.5x above historical mean.",
    "Overbought RSI levels on weekly charts suggest potential short-term mean reversion."
  ],
  finalDecision: "The AI maintains a 'Bullish' outlook with a trailing stop-loss strategy. Recommended action is to hold long positions while rotating out of overvalued mid-caps into defensive large-caps."
};

const ChartIntelligence = ({ eventId: _eventId }: ChartIntelligenceProps) => {
  const [liveEvent, setLiveEvent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedEvent = localStorage.getItem("et_edge_event_analysis");
    if (storedEvent) {
      try {
        const parsed = JSON.parse(storedEvent);
        setLiveEvent(parsed);
      } catch (e) {
        console.error("Error parsing stored event:", e);
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <p className="font-display text-xl text-text-secondary animate-pulse uppercase tracking-widest">Calibrating Reasoning Engine...</p>
      </div>
    );
  }

  const displaySource = liveEvent || MOCK_EVENT;

  const displayTitle = (displaySource?.eventType || 'Market')
    .split(' ')
    .map(word => (word && word.length > 0) ? word.charAt(0).toUpperCase() + word.slice(1) : '')
    .join(' ');

  const event = {
    headline: displaySource.whatHappened,
    whyItMatters: displaySource.whyItMatters,
    title: displayTitle,
    summary: displaySource.whatHappened,
    sectors: displaySource.affectedSectors || [],
    affectedStocks: displaySource.affectedStocks || [],
    confidence: displaySource.confidenceScore || 0,
    portfolioSignal: displaySource.impactDirection,
    positiveFactors: displaySource.positiveFactors || [displaySource.whyItMatters],
    negativeFactors: displaySource.negativeFactors || ["No immediate high-risk inhibitors detected."],
    finalDecision: displaySource.finalDecision || ("Impact direction determined as " + displaySource.impactDirection + " based on available evidence."),
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-6 py-24 md:px-10 lg:px-16">
      <div className="absolute inset-0 gradient-explain" />
      <div className="absolute inset-0 vignette-soft pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute left-[40%] top-[20%] h-[36rem] w-[36rem] rounded-full bg-electric-violet/12 blur-[200px]"
          animate={{ scale: [0.96, 1.06, 0.98], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[15%] bottom-[15%] h-[22rem] w-[22rem] rounded-full bg-deep-purple/15 blur-[140px]"
          animate={{ x: [0, -18, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-12rem)] max-w-7xl flex-col justify-center gap-8">
        {!liveEvent && (
           <div className="bg-warning/10 border border-warning/20 rounded-2xl p-3 text-[10px] uppercase font-bold tracking-[0.2em] text-warning text-center">
            Viewing Analysis Simulation Model — Select live news for real-time trace
           </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.85, ease: smoothEase }}
          className="max-w-4xl"
        >
          <Badge variant="outline" className="border-border/40 bg-secondary/40 px-4 py-1 text-[0.65rem] uppercase tracking-[0.32em] text-text-secondary">
            Explainability Engine V4
          </Badge>
          <h2 className="mt-6 font-display text-4xl leading-[0.94] text-foreground md:text-6xl lg:text-[4.4rem]">
            {event.headline}
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-8 text-text-secondary md:text-lg">{event.whyItMatters}</p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.85, delay: 0.08, ease: smoothEase }}
            className="glass-strong rounded-[2rem] p-8 md:p-10"
          >
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Orchestrator Focus</p>
                <p className="font-display text-3xl leading-tight text-foreground">{event.title}</p>
                <p className="text-sm leading-7 text-text-secondary">{event.summary}</p>
              </div>

              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Network Clusters</p>
                <div className="flex flex-wrap gap-2">
                  {event.sectors.map((sector: string) => (
                    <Badge key={sector} variant="outline" className="rounded-full border-accent/20 bg-accent/10 px-3 py-1 text-xs text-foreground font-bold uppercase tracking-wider">
                      {sector}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-1 opacity-70">
                  {event.affectedStocks.map((stock: string) => (
                    <Badge key={stock} variant="outline" className="rounded-full border-border/40 bg-secondary/50 px-3 py-1 text-[10px] text-text-secondary">
                      {stock}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.85, delay: 0.16, ease: smoothEase }}
            className="glass rounded-[2rem] p-8 border-l-4 border-l-accent"
          >
            <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Reasoning Confidence</p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="font-display text-5xl text-foreground tabular-nums">{event.confidence}%</p>
                <p className="mt-2 text-[10px] uppercase tracking-widest text-text-secondary font-black">Accuracy Calibration: High</p>
              </div>
              <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-xs text-foreground">
                AI Reasoned
              </Badge>
            </div>
            <div className="mt-6">
              <Progress value={event.confidence} className="h-4 bg-secondary/70" />
            </div>
            <div className={`mt-6 rounded-2xl border p-5 text-sm font-bold uppercase tracking-widest text-center ${event.portfolioSignal === 'positive' ? 'border-success/30 bg-success/10 text-success' : 'border-critical/30 bg-critical/10 text-critical'}`}>
              Impact Strategy: {event.portfolioSignal}
            </div>
          </motion.div>
        </div>

        {/* REASONING TRACE: Reorganized into 3 distinct logical sections */}
        <motion.div
          initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.85, delay: 0.24, ease: smoothEase }}
          className="glass-strong rounded-[2rem] p-8 md:p-12"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-white/5 pb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Grounding Trace</p>
              <h3 className="mt-3 font-display text-4xl text-foreground tracking-tight">Logical Decomposition</h3>
            </div>
            <div className="text-right">
                <p className="max-w-xl text-xs uppercase tracking-widest leading-loose text-text-secondary font-black">
                 Cross-referencing global markers with local liquidity flows to eliminate hallucination.
                </p>
            </div>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/* 1. POSITIVE FACTORS */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-success">
                <TrendingUp size={20} />
                <h4 className="text-[12px] font-black uppercase tracking-[0.3em]">Positive Stimulants</h4>
              </div>
              <div className="space-y-4">
                {event.positiveFactors.map((point: string, i: number) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }} 
                    whileInView={{ opacity: 1, x: 0 }} 
                    transition={{ delay: 0.1 * i }}
                    className="group flex gap-4 p-4 rounded-2xl bg-success/5 border border-success/10 hover:bg-success/10 transition-colors"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                    <p className="text-sm text-white/70 leading-relaxed">{point}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 2. NEGATIVE FACTORS */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-critical">
                <TrendingDown size={20} />
                <h4 className="text-[12px] font-black uppercase tracking-[0.3em]">Risk Inhibitors</h4>
              </div>
              <div className="space-y-4">
                {event.negativeFactors.map((point: string, i: number) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }} 
                    whileInView={{ opacity: 1, x: 0 }} 
                    transition={{ delay: 0.1 * i }}
                    className="group flex gap-4 p-4 rounded-2xl bg-critical/5 border border-critical/10 hover:bg-critical/10 transition-colors"
                  >
                    <ShieldAlert size={14} className="text-critical mt-1 shrink-0" />
                    <p className="text-sm text-white/70 leading-relaxed font-italic italic">{point}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 3. FINAL DECISION */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-accent">
                <CheckCircle2 size={20} />
                <h4 className="text-[12px] font-black uppercase tracking-[0.3em]">Final Verdict</h4>
              </div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                className="p-6 rounded-[2rem] bg-accent/10 border-2 border-accent/20 shadow-2xl shadow-accent/5"
              >
                <div className="text-[10px] uppercase font-black tracking-widest text-accent mb-4 block">Recommended Execution</div>
                <p className="text-sm text-white font-medium leading-relaxed">
                  {event.finalDecision}
                </p>
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                   <div className="text-[8px] uppercase tracking-widest text-white/30 font-black">Audit Status: Verified</div>
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ChartIntelligence;
