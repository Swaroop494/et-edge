"use client";
import { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Loader2, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react";
import { apiFetch } from "@/lib/api";

import { API_BASE } from "@/lib/api";

const TABS = [
  { id: "bulk", label: "Bulk Deal Filing", icon: AlertTriangle, description: "Promoter sold 4.2% stake at 6% discount — distress or routine?" },
  { id: "technical", label: "Technical Breakout", icon: TrendingUp, description: "IT stock at 52-week high, RSI 78, FII reducing — buy or trap?" },
  { id: "portfolio", label: "Portfolio News Priority", icon: BarChart3, description: "RBI rate cut vs FMCG regulation — which matters more to your 8 stocks?" },
];

const StepTrace = ({ trace }: { trace: any[] }) => (
  <div className="space-y-2">
    <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Agent reasoning trace</p>
    {trace.map((t, i) => (
      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
        className={`flex items-start gap-3 rounded-[1.25rem] border p-3 ${t.status === 'success' ? 'border-success/20 bg-success/5' : t.status === 'skipped' ? 'border-border/20 bg-secondary/10' : 'border-critical/20 bg-critical/5'}`}>
        {t.status === 'success' ? <CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" /> : <Circle size={16} className="text-border mt-0.5 shrink-0" />}
        <div>
          <p className="text-xs text-text-secondary uppercase tracking-wider">{t.tool}</p>
          <p className="text-sm text-foreground mt-0.5">{t.output}</p>
        </div>
      </motion.div>
    ))}
  </div>
);

const BulkDealResult = ({ data }: { data: any }) => {
  const { distressAnalysis, crossRef, alert, filing } = data;
  return (
    <div className="space-y-4">
      <div className={`rounded-[1.5rem] border p-5 ${alert?.severity === 'High' ? 'border-critical/30 bg-critical/5' : alert?.severity === 'Medium' ? 'border-warning/30 bg-warning/5' : 'border-success/30 bg-success/5'}`}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Risk Alert</p>
          <Badge variant="outline" className="rounded-full text-[10px]">{alert?.severity} severity</Badge>
        </div>
        <p className="font-display text-2xl text-foreground">{alert?.alertTitle}</p>
        <p className="mt-3 text-sm leading-7 text-text-secondary">{alert?.filingCitation}</p>
        <p className="mt-2 text-sm leading-7 text-foreground">{alert?.recommendedAction}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-text-secondary mb-2">Classification</p>
          <p className="font-display text-xl text-foreground">{distressAnalysis?.classification}</p>
          <p className="text-xs text-text-secondary mt-1">Confidence: {distressAnalysis?.confidenceScore}%</p>
        </div>
        <div className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-text-secondary mb-2">Commentary Alignment</p>
          <p className="font-display text-xl text-foreground">{crossRef?.alignment}</p>
          <p className="text-xs text-text-secondary mt-1">Earnings: {crossRef?.earningsTrend}</p>
        </div>
      </div>
      <div className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-text-secondary mb-2">Watch Points</p>
        <div className="space-y-1">{alert?.watchPoints?.map((w: string, i: number) => <p key={i} className="text-sm text-foreground">• {w}</p>)}</div>
      </div>
    </div>
  );
};

const TechnicalResult = ({ data }: { data: any }) => {
  const { breakout, conflicts, recommendation } = data;
  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border border-accent/20 bg-accent/5 p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-text-secondary mb-2">Technical Verdict</p>
        <p className="font-display text-2xl text-foreground">{recommendation?.headline}</p>
        <p className="mt-3 text-sm leading-7 text-text-secondary">{recommendation?.balancedView}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-4 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Pattern</p>
          <p className="mt-2 font-display text-lg text-foreground">{breakout?.technicalVerdict}</p>
        </div>
        <div className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-4 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Historical Win Rate</p>
          <p className="mt-2 font-display text-3xl text-foreground">{breakout?.historicalSuccessRate}%</p>
        </div>
        <div className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-4 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Conflict Level</p>
          <p className="mt-2 font-display text-lg text-foreground">{conflicts?.conflictSeverity}</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[1.5rem] border border-success/20 bg-success/5 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-text-secondary mb-2">Bullish Signals</p>
          {conflicts?.bullishSignals?.map((s: string, i: number) => <p key={i} className="text-sm text-foreground">✓ {s}</p>)}
        </div>
        <div className="rounded-[1.5rem] border border-critical/20 bg-critical/5 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-text-secondary mb-2">Bearish Signals</p>
          {conflicts?.bearishSignals?.map((s: string, i: number) => <p key={i} className="text-sm text-foreground">✗ {s}</p>)}
        </div>
      </div>
      <div className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-text-secondary mb-2">Key Metric To Watch</p>
        <p className="text-sm text-foreground">{recommendation?.keyMetricToWatch}</p>
      </div>
    </div>
  );
};

const PortfolioNewsResult = ({ data }: { data: any }) => {
  const { plImpact, prioritisedAlert, events } = data;
  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border border-primary/20 bg-primary/5 p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-text-secondary mb-2">Priority Alert</p>
        <p className="font-display text-xl text-foreground">{prioritisedAlert?.priorityEvent}</p>
        <p className="mt-3 text-sm leading-7 text-text-secondary">{prioritisedAlert?.priorityReason}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-text-secondary mb-1">{events?.[0]?.title}</p>
          <p className="font-display text-2xl text-foreground">{plImpact?.event1Impact?.estimatedPortfolioMovePercent > 0 ? '+' : ''}{plImpact?.event1Impact?.estimatedPortfolioMovePercent}%</p>
          <p className="text-xs text-text-secondary mt-1">Estimated portfolio move</p>
          <p className="text-sm text-foreground mt-2">{prioritisedAlert?.event1Alert?.action}</p>
        </div>
        <div className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-text-secondary mb-1">{events?.[1]?.title}</p>
          <p className="font-display text-2xl text-foreground">{plImpact?.event2Impact?.estimatedPortfolioMovePercent > 0 ? '+' : ''}{plImpact?.event2Impact?.estimatedPortfolioMovePercent}%</p>
          <p className="text-xs text-text-secondary mt-1">Estimated portfolio move</p>
          <p className="text-sm text-foreground mt-2">{prioritisedAlert?.event2Alert?.action}</p>
        </div>
      </div>
      <div className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-text-secondary mb-2">Executive Summary</p>
        <p className="text-sm leading-7 text-foreground">{prioritisedAlert?.executiveSummary}</p>
      </div>
      <div className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-4 text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Combined Portfolio Risk Score</p>
        <p className="mt-2 font-display text-4xl text-foreground">{prioritisedAlert?.combinedRiskScore}<span className="text-lg text-text-secondary">/100</span></p>
      </div>
    </div>
  );
};

const SignalAgent = () => {
  const [activeTab, setActiveTab] = useState("bulk");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [verificationDepth, setVerificationDepth] = useState(1);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await apiFetch<any>("/api/learning/stats");
      if (data) {
        setVerificationDepth(data.verificationDepth || 1);
      }
    };
    fetchStats();
  }, []);

  const endpointMap: Record<string, string> = {
    bulk: `${API_BASE}/api/agent/bulk-deal`,
    technical: `${API_BASE}/api/agent/technical`,
    portfolio: `${API_BASE}/api/agent/portfolio-news`,
  };

  const handleRun = async () => {
    setIsRunning(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch(endpointMap[activeTab], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationDepth }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "Agent failed");
      } else {
        setResult(data);
      }
    } catch (e: any) {
      setError(e.message);
    }
    setIsRunning(false);
  };

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setResult(null);
    setError(null);
  };

  return (
    <div className="glass-strong rounded-[2rem] p-8 space-y-8 relative overflow-hidden">
      {/* Dynamic Background Pulse based on Verification Depth */}
      {verificationDepth > 1 && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[80px] animate-pulse pointer-events-none" />
      )}

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <Badge variant="outline" className="border-border/40 bg-secondary/40 px-4 py-1 text-[0.65rem] uppercase tracking-[0.32em] text-text-secondary">
            Advanced Signal Agent
          </Badge>
          <h3 className="mt-3 font-display text-3xl text-foreground">Agentic Alpha Generation</h3>
          <p className="mt-2 text-sm leading-7 text-text-secondary">
            Advanced AI agents designed to automate high-conviction analysis, from institutional bulk deals to personalized news prioritization.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${verificationDepth > 1 ? "bg-warning animate-pulse" : "bg-success"}`} />
            <span className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
              System Intelligence State
            </span>
          </div>
          <Badge variant="outline" className={`rounded-full px-3 py-1 text-[9px] uppercase tracking-widest ${verificationDepth > 1 ? "border-warning/30 bg-warning/5 text-warning" : "border-success/30 bg-success/5 text-success"}`}>
            {verificationDepth > 1 ? `Reinforcement Mode (${verificationDepth}x Depth)` : "Standard Grounding"}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm transition-all duration-300 ${
              activeTab === tab.id
                ? "border-accent/30 bg-accent/10 text-foreground"
                : "border-border/30 bg-secondary/20 text-text-secondary hover:border-border/50"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-4">
        <p className="text-sm text-text-secondary">{TABS.find((t) => t.id === activeTab)?.description}</p>
      </div>

      <Button onClick={handleRun} disabled={isRunning} className="h-12 rounded-2xl px-8 w-full md:w-auto">
        {isRunning ? (
          <>
            <Loader2 size={16} className="animate-spin mr-2" />
            Agent running...
          </>
        ) : (
          <>Run Agent</>
        )}
      </Button>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={activeTab + "result"}
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <StepTrace trace={result.reasoningTrace} />
            {activeTab === "bulk" && <BulkDealResult data={result.outputs} />}
            {activeTab === "technical" && <TechnicalResult data={result.outputs} />}
            {activeTab === "portfolio" && <PortfolioNewsResult data={result.outputs} />}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-sm text-critical rounded-2xl border border-critical/20 bg-critical/5 p-4">{error}</p>
      )}
    </div>
  );
};

export default SignalAgent;
SignalAgent;