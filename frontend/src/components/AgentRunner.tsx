"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Loader2, SkipForward, Zap } from "lucide-react";
import { runAgent } from "@/utils/api.js";

const STEPS = [
  { id: 1, tool: "fetch_live_news", label: "Fetching live market news" },
  { id: 2, tool: "analyze_event", label: "Analyzing top market event" },
  { id: 3, tool: "validate_market_tip", label: "Validating market tip" },
  { id: 4, tool: "assess_portfolio_impact", label: "Assessing portfolio impact" },
  { id: 5, tool: "final_summary", label: "Generating agent summary" },
];

const AgentRunner = () => {
  const [holdings, setHoldings] = useState("HDFCBANK, SBIN, TCS");
  const [tip, setTip] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setIsRunning(true);
    setResult(null);
    setError(null);
    setActiveStep(1);
    const holdingsArray = holdings.split(",").map((h) => h.trim()).filter(Boolean);
    const stepTimer = (step: number) => new Promise((resolve) => setTimeout(() => { setActiveStep(step); resolve(null); }, step * 1800));
    const [agentResult] = await Promise.all([
      runAgent(holdingsArray, tip),
      stepTimer(2), stepTimer(3), stepTimer(4), stepTimer(5),
    ]);
    if (!agentResult || !agentResult.success) {
      setError(agentResult?.error ?? "Agent failed. Please try again.");
      setIsRunning(false);
      setActiveStep(0);
      return;
    }
    if (agentResult.outputs?.eventAnalysis) localStorage.setItem("et_edge_event_analysis", JSON.stringify(agentResult.outputs.eventAnalysis));
    if (agentResult.outputs?.portfolioImpact) localStorage.setItem("et_edge_portfolio_result", JSON.stringify(agentResult.outputs.portfolioImpact));
    setResult(agentResult);
    setIsRunning(false);
    setActiveStep(0);
  };

  const getStepStatus = (stepId: number) => {
    if (!isRunning && !result) return "idle";
    if (result) { const trace = result.reasoningTrace?.find((t: any) => t.step === stepId); return trace?.status ?? "idle"; }
    if (activeStep === stepId) return "running";
    if (activeStep > stepId) return "success";
    return "idle";
  };

  return (
    <div className="glass-strong rounded-[2rem] p-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant="outline" className="border-border/40 bg-secondary/40 px-4 py-1 text-[0.65rem] uppercase tracking-[0.32em] text-text-secondary">AI Agent</Badge>
          <h3 className="mt-3 font-display text-3xl text-foreground">Autonomous Market Agent</h3>
          <p className="mt-2 text-sm leading-7 text-text-secondary">One click. The agent fetches news, analyzes events, validates tips, and assesses your portfolio — autonomously.</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10"><Zap className="text-accent" size={20} /></div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Your holdings</p>
          <Input value={holdings} onChange={(e) => setHoldings(e.target.value)} placeholder="HDFCBANK, SBIN, TCS" disabled={isRunning} className="h-11 rounded-2xl border-border/30 bg-secondary/30 text-foreground placeholder:text-text-secondary/60" />
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Tip to validate (optional)</p>
          <Input value={tip} onChange={(e) => setTip(e.target.value)} placeholder="e.g. HDFCBANK will hit 2000 next week" disabled={isRunning} className="h-11 rounded-2xl border-border/30 bg-secondary/30 text-foreground placeholder:text-text-secondary/60" />
        </div>
      </div>
      <Button onClick={handleRun} disabled={isRunning} className="h-12 rounded-2xl px-8 w-full md:w-auto">
        {isRunning ? <><Loader2 size={16} className="animate-spin mr-2" />Agent running...</> : <><Zap size={16} className="mr-2" />Run Agent</>}
      </Button>
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Reasoning trace</p>
        {STEPS.map((step, index) => {
          const status = getStepStatus(step.id);
          return (
            <motion.div key={step.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: index * 0.06 }}
              className={`flex items-center gap-4 rounded-[1.25rem] border p-4 transition-all duration-500 ${status === "running" ? "border-accent/30 bg-accent/5" : status === "success" ? "border-success/20 bg-success/5" : "border-border/20 bg-secondary/10"}`}>
              <div className="shrink-0">
                {status === "running" && <Loader2 size={18} className="animate-spin text-accent" />}
                {status === "success" && <CheckCircle2 size={18} className="text-success" />}
                {status === "skipped" && <SkipForward size={18} className="text-text-secondary" />}
                {status === "idle" && <Circle size={18} className="text-border" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{step.label}</p>
                {result && (() => { const trace = result.reasoningTrace?.find((t: any) => t.step === step.id); return trace?.output ? <p className="text-xs text-text-secondary mt-1 truncate">{trace.output}</p> : null; })()}
              </div>
              <Badge variant="outline" className={`text-[10px] rounded-full px-2 py-0.5 shrink-0 ${status === "running" ? "border-accent/30 text-accent" : status === "success" ? "border-success/20 text-foreground" : "border-border/20 text-text-secondary"}`}>
                {status === "idle" ? "pending" : status}
              </Badge>
            </motion.div>
          );
        })}
      </div>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 16, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="space-y-4">
            <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Agent summary</p>
            <div className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-5">
              <p className="text-sm leading-7 text-foreground">{result.outputs?.agentSummary}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Steps completed</p>
                <p className="mt-2 font-display text-3xl text-foreground">{result.stepsCompleted}</p>
              </div>
              <div className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Portfolio verdict</p>
                <p className="mt-2 font-display text-2xl text-foreground">{result.outputs?.portfolioImpact?.overallVerdict ?? "—"}</p>
              </div>
              <div className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Confidence</p>
                <p className="mt-2 font-display text-3xl text-foreground">{result.outputs?.eventAnalysis?.confidenceScore ?? "—"}%</p>
              </div>
            </div>
            {result.outputs?.portfolioImpact && <div className="space-y-2"><p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Risk score</p><Progress value={result.outputs.portfolioImpact.riskScore} className="h-3 bg-secondary/70" /></div>}
            <p className="text-xs text-text-secondary text-center pt-2">✓ Results saved — Events, Explainability and Portfolio Impact pages are now pre-populated.</p>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="text-sm text-critical rounded-2xl border border-critical/20 bg-critical/5 p-4">{error}</p>}
    </div>
  );
};

export default AgentRunner;