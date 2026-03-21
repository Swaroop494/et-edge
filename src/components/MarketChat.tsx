import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { intelligenceEvents } from "@/data/intelligence";

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
  const event = intelligenceEvents.find((item) => item.id === eventId) ?? intelligenceEvents[0];
  const [portfolioInput, setPortfolioInput] = useState("HDFCBANK, SBIN, DLF");
  const [error, setError] = useState("");
  const [submittedHoldings, setSubmittedHoldings] = useState<string[]>(["HDFCBANK", "SBIN", "DLF"]);

  const result = useMemo(() => {
    const impacted = submittedHoldings.filter((holding) => event.affectedStocks.includes(holding));
    const exposure = submittedHoldings.length ? Math.round((impacted.length / submittedHoldings.length) * 100) : 0;

    const riskLabel = exposure >= 60 || (event.confidence >= 80 && impacted.length >= 2)
      ? "High"
      : exposure >= 25 || impacted.length > 0
        ? "Medium"
        : "Low";

    return {
      impacted,
      exposure,
      riskLabel,
      safeCount: Math.max(submittedHoldings.length - impacted.length, 0),
    } as const;
  }, [event, submittedHoldings]);

  const handleSimulate = () => {
    const parsed = portfolioSchema.safeParse(portfolioInput);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please review the portfolio input.");
      return;
    }

    const holdings = Array.from(
      new Set(
        parsed.data
          .split(",")
          .map((item) => item.trim().toUpperCase())
          .filter(Boolean),
      ),
    );

    if (!holdings.length) {
      setError("Add at least one stock ticker.");
      return;
    }

    setError("");
    setSubmittedHoldings(holdings);
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
                value={portfolioInput}
                onChange={(event) => setPortfolioInput(event.target.value)}
                placeholder="HDFCBANK, SBIN, DLF"
                className="h-12 rounded-2xl border-border/30 bg-secondary/30 text-foreground placeholder:text-text-secondary/60 focus-visible:ring-primary/40"
              />
              <p className="text-sm leading-7 text-text-secondary">Current event in focus: <span className="text-foreground">{event.title}</span></p>
              {error ? <p className="text-sm text-critical">{error}</p> : null}
              <Button onClick={handleSimulate} className="h-12 rounded-2xl px-6">
                Simulate impact
              </Button>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${event.id}-${submittedHoldings.join("-")}`}
              initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="glass rounded-[2rem] p-8"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Exposure</p>
                  <h3 className="mt-3 font-display text-4xl text-foreground">{result.exposure}%</h3>
                </div>
                <Badge variant="outline" className={`rounded-full px-4 py-1 text-xs ${riskStyles[result.riskLabel]}`}>
                  {result.riskLabel} risk
                </Badge>
              </div>

              <div className="mt-6">
                <Progress value={result.exposure} className="h-3 bg-secondary/70" />
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.5rem] border border-border/30 bg-secondary/30 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Affected stocks</p>
                  <p className="mt-3 font-display text-3xl text-foreground">{result.impacted.length}</p>
                </div>
                <div className="rounded-[1.5rem] border border-border/30 bg-secondary/30 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Relatively safe</p>
                  <p className="mt-3 font-display text-3xl text-foreground">{result.safeCount}</p>
                </div>
                <div className="rounded-[1.5rem] border border-border/30 bg-secondary/30 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Decision signal</p>
                  <p className="mt-3 font-display text-3xl text-foreground">{result.riskLabel === "Low" ? "Steady" : result.riskLabel === "Medium" ? "Review" : "Protect"}</p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                <div className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Names in the event path</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {result.impacted.length ? result.impacted.map((stock) => (
                      <Badge key={stock} variant="outline" className="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-xs text-foreground">
                        {stock}
                      </Badge>
                    )) : <p className="text-sm leading-7 text-text-secondary">No direct ticker overlap detected from the current input.</p>}
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">AI interpretation</p>
                  <p className="mt-4 text-sm leading-7 text-foreground">{event.portfolioSignal}</p>
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
