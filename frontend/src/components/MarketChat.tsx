"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { portfolioImpact } from "@/utils/api.js";

interface MarketChatProps {
  eventId: string;
}

const portfolioSchema = z
  .string()
  .trim()
  .min(2, "Add at least one stock ticker.")
  .max(120, "Keep the portfolio input concise.")
  .regex(/^[A-Za-z,\s]+$/, "Use only stock tickers separated by commas.");

const riskStyles = {
  Low: "border-success/20 bg-success/10 text-foreground",
  Medium: "border-warning/20 bg-warning/10 text-foreground",
  High: "border-critical/20 bg-critical/10 text-foreground",
};

const MarketChat = ({ eventId }: MarketChatProps) => {
  const [holdingsInput, setHoldingsInput] = useState("");
  const [impactResult, setImpactResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEventAnalysis, setCurrentEventAnalysis] = useState<any | null>(null);

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

  const handleSimulate = () => {
    const runImpact = async () => {
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
        alert("Please select a news event first on the Events page");
        return;
      }

      setIsLoading(true);
      setError(null);

      const result = await portfolioImpact(userHoldings, currentEventAnalysis);
      setImpactResult(result);
      if (!result) {
        setError("Unable to analyse portfolio impact. Please try again.");
      }
      setIsLoading(false);
    };

    runImpact();
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-6 py-24 md:px-10 lg:px-16">
      <div className="absolute inset-0 gradient-impact" />
      <div className="absolute inset-0 vignette-soft pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute left-[8%] top-[18%] h-[28rem] w-[28rem] rounded-full bg-teal/10 blur-[160px]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[12%] bottom-[20%] h-[24rem] w-[24rem] rounded-full bg-deep-purple/12 blur-[150px]"
          animate={{ x: [0, 20, 0], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-12rem)] max-w-7xl flex-col justify-center gap-8">
        <div className="max-w-4xl">
          <Badge variant="outline" className="border-border/40 bg-secondary/40 px-4 py-1 text-[0.65rem] uppercase tracking-[0.32em] text-text-secondary">
            Portfolio Impact Simulator
          </Badge>
          <h2 className="mt-6 font-display text-4xl leading-[0.94] text-foreground md:text-6xl">Make the event personal before you make a decision.</h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-text-secondary md:text-lg">
            Enter a few holdings and the system translates the current event into exposure, affected names, and a simple decision signal.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <motion.div
            initial={{ opacity: 0, x: -24, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="glass-strong rounded-[2rem] p-8"
          >
            <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Portfolio input</p>
            <div className="mt-5 space-y-4">
              <Input
                value={holdingsInput}
                onChange={(event) => setHoldingsInput(event.target.value)}
                placeholder="HDFCBANK, SBIN, DLF"
                className="h-12 rounded-2xl border-border/30 bg-secondary/30 text-foreground placeholder:text-text-secondary/60 focus-visible:ring-primary/40"
              />
              <p className="text-sm leading-7 text-text-secondary">Current event in focus: <span className="text-foreground">{currentEventAnalysis?.whatHappened ?? "No event selected yet"}</span></p>
              {error ? <p className="text-sm text-critical">{error}</p> : null}
              <Button onClick={handleSimulate} className="h-12 rounded-2xl px-6">
                {isLoading ? "Analysing..." : "Simulate impact"}
              </Button>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${eventId}-${holdingsInput}`}
              initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="glass rounded-[2rem] p-8"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Exposure</p>
                  <h3 className="mt-3 font-display text-4xl text-foreground">{impactResult?.riskScore ?? 0}%</h3>
                </div>
                <Badge
                  variant="outline"
                  className={`rounded-full px-4 py-1 text-xs ${
                    impactResult?.overallVerdict === "Low"
                      ? riskStyles.Low
                      : impactResult?.overallVerdict === "Medium"
                        ? riskStyles.Medium
                        : riskStyles.High
                  }`}
                >
                  {impactResult?.overallVerdict ?? "High"} risk
                </Badge>
              </div>

              <div className="mt-6">
                <Progress value={impactResult?.riskScore ?? 0} className="h-3 bg-secondary/70" />
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.5rem] border border-border/30 bg-secondary/30 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Affected stocks</p>
                  <p className="mt-3 font-display text-3xl text-foreground">{impactResult?.stockImpacts?.length ?? 0}</p>
                </div>
                <div className="rounded-[1.5rem] border border-border/30 bg-secondary/30 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Relatively safe</p>
                  <p className="mt-3 font-display text-3xl text-foreground">{impactResult?.overallVerdict ?? "-"}</p>
                </div>
                <div className="rounded-[1.5rem] border border-border/30 bg-secondary/30 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Decision signal</p>
                  <p className="mt-3 font-display text-3xl text-foreground">
                    {impactResult?.overallVerdict === "Low" ? "Steady" : impactResult?.overallVerdict === "Medium" ? "Review" : "Protect"}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                <div className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Names in the event path</p>
                  <div className="mt-4 grid gap-2">
                    {impactResult?.stockImpacts?.length ? impactResult.stockImpacts.map((stock: any) => (
                      <div key={stock.symbol} className="rounded-xl border border-border/30 bg-secondary/20 p-3 text-sm text-foreground">
                        {stock.symbol} - {stock.impactLevel} - {stock.direction} - {stock.plainEnglishReason}
                      </div>
                    )) : <p className="text-sm leading-7 text-text-secondary">No portfolio analysis yet.</p>}
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">AI interpretation</p>
                  <p className="mt-4 text-sm leading-7 text-foreground">{impactResult?.verdictExplanation ?? "Add holdings and simulate impact to see AI interpretation."}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default MarketChat;
