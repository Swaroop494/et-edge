import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { ArrowDownRight, ArrowUpRight, Minus, SendHorizonal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { scenarioLibrary } from "@/data/intelligence";

const scenarioSchema = z.string().trim().min(8, "Ask a slightly fuller what-if question.").max(160, "Keep the scenario concise.");

const directionIcon = {
  Up: ArrowUpRight,
  Down: ArrowDownRight,
  Mixed: Minus,
};

const resolveScenario = (query: string) => {
  const normalized = query.toLowerCase();

  return (
    scenarioLibrary.find((scenario) => normalized.includes(scenario.key)) ??
    scenarioLibrary.find((scenario) => normalized.includes(scenario.label.toLowerCase().split(" ")[0])) ??
    scenarioLibrary[0]
  );
};

const WhatIfScenarioEngine = () => {
  const [query, setQuery] = useState("What if interest rates increase further?");
  const [error, setError] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState(query);

  const scenario = useMemo(() => resolveScenario(submittedQuery), [submittedQuery]);

  const handleSubmit = () => {
    const parsed = scenarioSchema.safeParse(query);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please refine the scenario.");
      return;
    }

    setError("");
    setSubmittedQuery(parsed.data);
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-6 py-24 md:px-10 lg:px-16">
      <div className="absolute inset-0 gradient-scenario" />
      <div className="absolute inset-0 vignette-soft pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/30 to-background" />
        <motion.div
          className="absolute left-[20%] top-[25%] h-[26rem] w-[26rem] rounded-full bg-teal/10 blur-[150px]"
          animate={{ x: [0, 18, 0], y: [0, -15, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[8%] right-[10%] h-[24rem] w-[24rem] rounded-full bg-accent/8 blur-[150px]"
          animate={{ x: [0, -20, 0], y: [0, -24, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[40%] top-[50%] h-[18rem] w-[18rem] rounded-full bg-electric-violet/6 blur-[120px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-12rem)] max-w-7xl flex-col justify-center gap-8">
        <div className="max-w-4xl">
          <Badge variant="outline" className="border-border/40 bg-secondary/40 px-4 py-1 text-[0.65rem] uppercase tracking-[0.32em] text-text-secondary">
            What-if Scenario Engine
          </Badge>
          <h2 className="mt-6 font-display text-4xl leading-[0.94] text-foreground md:text-6xl">Explore the next move before the market forces it on you.</h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-text-secondary md:text-lg">
            Ask a scenario in plain English and get an immediate read on affected sectors, expected direction, and relative risk.
          </p>
        </div>

        <div className="glass-strong rounded-[2rem] p-6 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSubmit()}
              placeholder="What if interest rates increase?"
              className="h-12 rounded-2xl border-border/30 bg-secondary/30 text-foreground placeholder:text-text-secondary/60 focus-visible:ring-primary/40"
            />
            <Button onClick={handleSubmit} className="h-12 rounded-2xl px-6">
              <SendHorizonal size={16} />
              Run scenario
            </Button>
          </div>
          {error ? <p className="mt-3 text-sm text-critical">{error}</p> : null}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={submittedQuery}
            initial={{ opacity: 0, y: 22, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]"
          >
            <div className="glass rounded-[2rem] p-8">
              <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Scenario read</p>
              <h3 className="mt-4 font-display text-3xl text-foreground">{scenario.label}</h3>
              <p className="mt-4 text-sm leading-7 text-text-secondary">{scenario.narrative}</p>

              <div className="mt-8">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Risk level</span>
                  <span className="text-foreground">{scenario.risk}%</span>
                </div>
                <Progress value={scenario.risk} className="mt-3 h-3 bg-secondary/70" />
              </div>
            </div>

            <div className="glass rounded-[2rem] p-8">
              <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Affected sectors</p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {scenario.sectors.map((sector, index) => {
                  const Icon = directionIcon[sector.direction];
                  return (
                    <motion.div
                      key={sector.name}
                      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <Badge variant="outline" className="rounded-full border-accent/20 bg-accent/10 px-3 py-1 text-xs text-foreground">
                          {sector.name}
                        </Badge>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon size={16} />
                        </div>
                      </div>
                      <p className="mt-6 font-display text-2xl text-foreground">{sector.direction}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default WhatIfScenarioEngine;
