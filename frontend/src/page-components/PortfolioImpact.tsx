"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Sparkles, MessageSquare, X, ArrowRight, Activity, ShieldCheck, Zap } from "lucide-react";
import { portfolioImpact } from "@/utils/api.js";
import { useAI } from "@/context/AIContext";

const portfolioSchema = z
  .string()
  .trim()
  .min(2, "Add at least one stock ticker.")
  .max(120, "Keep the portfolio input concise.")
  .regex(/^[A-Za-z,\s]+$/, "Use only stock tickers separated by commas.");

const riskStyles = {
  Low: "border-success/20 bg-success/10 text-success",
  Medium: "border-warning/20 bg-warning/10 text-warning",
  High: "border-critical/20 bg-critical/10 text-critical",
};

const PortfolioImpact = () => {
  const [holdingsInput, setHoldingsInput] = useState("");
  const [impactResult, setImpactResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEventAnalysis, setCurrentEventAnalysis] = useState<any | null>(null);
  const { setIsChatOpen, setInitialMessage } = useAI();

  useEffect(() => {
    const storedAnalysis = localStorage.getItem("et_edge_event_analysis");
    if (storedAnalysis) {
      try {
        setCurrentEventAnalysis(JSON.parse(storedAnalysis));
      } catch (parseError) {
        console.error("Failed to parse stored event analysis:", parseError);
      }
    }
  }, []);

  const handleSimulate = async () => {
    const parsed = portfolioSchema.safeParse(holdingsInput);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please review the portfolio input.");
      return;
    }

    const userHoldings = parsed.data
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!currentEventAnalysis) {
      setError("Please select a news event first on the Events page.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await portfolioImpact(userHoldings, currentEventAnalysis);
      setImpactResult(result);
      if (!result) {
        setError("Unable to analyse portfolio impact. Please try again.");
      }
    } catch (e) {
      setError("Simulation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openDeepDive = () => {
    if (!impactResult) return;
    const summary = `Based on the simulator, the risk score is ${impactResult.riskScore}% with a verdict of ${impactResult.overallVerdict}. Let's do a deep dive into how ${currentEventAnalysis?.whatHappened} specifically affects my holdings: ${holdingsInput}.`;
    setInitialMessage(summary);
    setIsChatOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 gradient-impact opacity-40" />
      <div className="absolute inset-0 vignette-soft pointer-events-none" />
      
      <div className="relative z-10 mx-auto px-6 py-12 md:px-10 lg:px-16 max-w-7xl">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mb-12"
        >
          <Badge variant="outline" className="border-border/40 bg-secondary/40 px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.32em] text-text-secondary">
            Portfolio Impact Simulator
          </Badge>
          <h2 className="mt-8 font-display text-4xl leading-[1.1] text-foreground md:text-6xl tracking-tight">
            Make the event personal<br/>before you make a decision.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg opacity-80">
            Enter a few holdings and ET Edge translates market-wide news into exposure levels, affected tickers, and an autonomous risk verdict.
          </p>
        </motion.div>

        {/* Main Simulator Grid */}
        <div className="grid gap-6 lg:gap-10 lg:grid-cols-[1fr_1.5fr]">
          {/* Left: Input Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-strong rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-10 flex flex-col justify-between border border-border/10 shadow-2xl"
          >
            <div className="space-y-6 lg:space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent/20">
                  <Activity size={20} className="text-accent" />
                </div>
                <p className="text-[10px] lg:text-xs uppercase tracking-[0.24em] font-bold text-text-secondary">Portfolio input</p>
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-text-secondary/60 font-bold">Watchlist Tickers</label>
                <Input
                  value={holdingsInput}
                  onChange={(e) => setHoldingsInput(e.target.value)}
                  placeholder="e.g. HDFCBANK, TCS, RELIANCE"
                  className="h-14 lg:h-16 rounded-2xl border-border/20 bg-background/40 backdrop-blur-md text-base lg:text-lg px-6 placeholder:text-text-secondary/40 focus:ring-accent/30 transition-all font-medium"
                />
              </div>

              <div className="p-5 lg:p-7 rounded-[1.5rem] border border-border/10 bg-secondary/20 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-widest text-text-secondary mb-3 font-bold opacity-60">Live Signal Focus</p>
                <p className="text-xs lg:text-sm leading-relaxed text-foreground font-semibold italic">
                  "{currentEventAnalysis?.whatHappened ?? "No signal selected on Opportunity Radar."}"
                </p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-4 rounded-xl bg-critical/10 border border-critical/20 text-critical text-[10px] lg:text-xs font-bold leading-tight uppercase">
                  <Activity size={14} /> {error}
                </motion.div>
              )}
            </div>

            <Button 
              onClick={handleSimulate} 
              disabled={isLoading || !holdingsInput}
              className="mt-8 lg:mt-12 h-14 lg:h-16 rounded-2xl bg-accent hover:bg-accent/90 text-white shadow-xl shadow-accent/20 text-sm lg:text-md font-bold transition-all transform active:scale-[0.96]"
            >
              {isLoading ? <><Zap className="animate-pulse mr-2" size={20} /> Calculating...</> : "Simulate Impact"}
            </Button>
          </motion.div>

          {/* Right: Results Card */}
          <AnimatePresence mode="wait">
            <motion.div
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-strong rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-10 border border-border/10 shadow-2xl flex flex-col min-h-[500px]"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 lg:mb-10">
                <div>
                  <p className="text-[10px] lg:text-xs uppercase tracking-[0.24em] font-bold text-text-secondary">Exposure Score</p>
                  <motion.h3 
                    key={impactResult?.riskScore}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-2 font-display text-5xl lg:text-7xl text-foreground font-black"
                  >
                    {impactResult?.riskScore ?? 0}%
                  </motion.h3>
                </div>
                <div className="w-full sm:w-auto">
                  <Badge
                    variant="outline"
                    className={`rounded-full px-5 py-2 text-[10px] lg:text-xs font-heavy uppercase tracking-widest w-full sm:w-auto text-center justify-center ${
                      impactResult?.overallVerdict === "Low"
                        ? riskStyles.Low
                        : impactResult?.overallVerdict === "Medium"
                          ? riskStyles.Medium
                          : riskStyles.High
                    }`}
                  >
                    {impactResult?.overallVerdict ?? "—"} RISK LEVEL
                  </Badge>
                </div>
              </div>

              <div className="relative h-2.5 w-full bg-secondary/30 rounded-full overflow-hidden mb-10 lg:mb-14 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${impactResult?.riskScore ?? 0}%` }}
                  transition={{ duration: 1, ease: "circOut" }}
                  className={`h-full shadow-[0_0_12px_rgba(24,255,255,0.4)] ${impactResult?.overallVerdict === "High" ? "bg-critical" : impactResult?.overallVerdict === "Medium" ? "bg-warning" : "bg-accent"}`}
                />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10 overflow-x-auto no-scrollbar pb-2">
                <div className="rounded-2xl border border-border/10 bg-secondary/5 p-5 min-w-[120px]">
                  <p className="text-[9px] uppercase tracking-widest text-text-secondary font-bold opacity-60">Affected Assets</p>
                  <p className="mt-2 font-display text-4xl text-foreground font-bold">{impactResult?.stockImpacts?.length ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-border/10 bg-secondary/5 p-5 min-w-[120px]">
                  <p className="text-[9px] uppercase tracking-widest text-text-secondary font-bold opacity-60">Status Verdict</p>
                  <p className="mt-2 font-display text-xl text-foreground font-bold truncate">{impactResult?.overallVerdict || "—"}</p>
                </div>
                <div className="rounded-2xl border border-border/10 bg-secondary/5 p-5 min-w-[120px] col-span-2 lg:col-span-1">
                  <p className="text-[9px] uppercase tracking-widest text-text-secondary font-bold opacity-60">Action Signal</p>
                  <p className="mt-2 font-display text-2xl text-foreground font-bold uppercase tracking-tighter">
                    {impactResult?.overallVerdict === "Low" ? "Maintain State" : impactResult?.overallVerdict === "Medium" ? "Review Risk" : "Neural Defense"}
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <p className="text-[9px] uppercase tracking-widest text-text-secondary font-bold opacity-60">Autonomous AI Interpretation</p>
                <div className="rounded-[1.5rem] border border-border/10 bg-white/5 p-5 lg:p-7 backdrop-blur-md">
                  <p className="text-xs lg:text-sm leading-relaxed text-foreground/90 font-medium italic">
                    {impactResult?.verdictExplanation ?? "Add holdings to simulate how this specific market signal propagates through your portfolio."}
                  </p>
                  {impactResult && (
                    <Button 
                      onClick={openDeepDive}
                      variant="ghost" 
                      className="mt-6 w-full h-12 lg:h-14 rounded-xl border border-accent/20 bg-accent/5 text-accent hover:bg-accent/10 font-bold group uppercase tracking-widest text-[10px]"
                    >
                      Deep Dive with MarketGPT <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div className="mt-12 flex items-center gap-2 px-2 opacity-40">
          <ShieldCheck size={14} className="text-text-secondary" />
          <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-text-secondary">
            Grounding Logic: Portfolio Exposure Mapping v2.1 · Enterprise Grade
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioImpact;
