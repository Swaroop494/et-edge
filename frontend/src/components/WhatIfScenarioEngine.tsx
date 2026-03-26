"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { ArrowDownRight, ArrowUpRight, Loader2, Minus, SendHorizonal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const scenarioSchema = z.string().trim().min(8, "Ask a slightly fuller what-if question.").max(160, "Keep the scenario concise.");

const directionIcon = {
  Up: ArrowUpRight,
  Down: ArrowDownRight,
  Mixed: Minus,
};

interface AIResult {
  label: string;
  narrative: string;
  risk: number;
  sectors: { name: string; direction: "Up" | "Down" | "Mixed" }[];
}

const defaultResult: AIResult = {
  label: "Awaiting Scenario",
  narrative: "Input a market hypothetical to generate an AI-driven impact analysis.",
  risk: 0,
  sectors: [
    { name: "Banking", direction: "Mixed" },
    { name: "IT Services", direction: "Mixed" },
    { name: "Auto", direction: "Mixed" },
  ],
};

const WhatIfScenarioEngine = () => {
  const [query, setQuery] = useState("What if interest rates increase further?");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult>(defaultResult);
  const [submittedQuery, setSubmittedQuery] = useState("");

  const handleSubmit = async () => {
    const parsed = scenarioSchema.safeParse(query);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please refine the scenario.");
      return;
    }

    setError("");
    setIsLoading(true);
    setSubmittedQuery(parsed.data);

    try {
      const apiKey = process.env.NEXT_PUBLIC_CLAUDE_API_KEY;
      const prompt = `You are an Indian stock market analyst. A retail investor asks: ${parsed.data}. Return ONLY a valid JSON object with fields: label (string), narrative (string), risk (number 0-100), and sectors (array of objects with 'name' and 'direction'). Direction must be 'Up', 'Down', or 'Mixed'. 3 sectors minimum.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const rawText = data?.content?.[0]?.text ?? "";

      // Extract JSON from markdown code blocks if present
      const jsonString = rawText.replace(/```json|```/gi, "").trim();
      const result = JSON.parse(jsonString) as AIResult;

      setAiResult(result);
    } catch (err) {
      console.error("AI Fetch Error:", err);
      setError("Failed to generate AI analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const displayResult = aiResult ?? defaultResult;

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

        <div className="glass-strong rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/40 backdrop-blur-sm animate-pulse">
              <div className="flex items-center gap-3 text-primary font-medium">
                <Loader2 className="animate-spin" size={20} />
                <span>Analysing with AI...</span>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-4 lg:flex-row">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSubmit()}
              placeholder="What if interest rates increase?"
              className="h-12 rounded-2xl border-border/30 bg-secondary/30 text-foreground placeholder:text-text-secondary/60 focus-visible:ring-primary/40"
              disabled={isLoading}
            />
            <Button onClick={handleSubmit} className="h-12 rounded-2xl px-6" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : <SendHorizonal size={16} />}
              Run scenario
            </Button>
          </div>
          {error ? <p className="mt-3 text-sm text-critical">{error}</p> : null}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={submittedQuery || "initial"}
            initial={{ opacity: 0, y: 22, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]"
          >
            <div className="glass rounded-[2rem] p-8">
              <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Scenario read</p>
              <h3 className="mt-4 font-display text-3xl text-foreground">{displayResult.label}</h3>
              <p className="mt-4 text-sm leading-7 text-text-secondary">{displayResult.narrative}</p>

              <div className="mt-8">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Risk level</span>
                  <span className="text-foreground">{displayResult.risk}%</span>
                </div>
                <Progress value={displayResult.risk} className="mt-3 h-3 bg-secondary/70" />
              </div>
            </div>

            <div className="glass rounded-[2rem] p-8">
              <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Affected sectors</p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {displayResult.sectors.map((sector, index) => {
                  const Icon = directionIcon[sector.direction] || Minus;
                  return (
                    <motion.div
                      key={`${sector.name}-${index}`}
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