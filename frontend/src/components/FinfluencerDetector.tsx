"use client";

import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { AlertTriangle, ShieldCheck, Siren } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fetchLiveNews, validateTip } from "@/utils/api.js";

interface FinfluencerDetectorProps {
  eventId: string;
}

const tipSchema = z.string().trim().min(12, "Paste a fuller investing claim to analyze.").max(280, "Keep the pasted tip under 280 characters.");

const verdictStyles = {
  Valid: "border-success/20 bg-success/10 text-foreground",
  Misleading: "border-warning/20 bg-warning/10 text-foreground",
  False: "border-critical/20 bg-critical/10 text-foreground",
};

/* Circular SVG progress ring */
const CircularScore = ({ score, verdict }: { score: number; verdict: keyof typeof verdictStyles }) => {
  const radius = 54;
  const stroke = 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const colorMap = {
    Valid: "hsl(var(--success))",
    Misleading: "hsl(var(--warning))",
    False: "hsl(var(--critical))",
  };
  const glowMap = {
    Valid: "drop-shadow(0 0 8px hsl(var(--success) / 0.5))",
    Misleading: "drop-shadow(0 0 8px hsl(var(--warning) / 0.5))",
    False: "drop-shadow(0 0 8px hsl(var(--critical) / 0.5))",
  };

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg width="132" height="132" viewBox="0 0 132 132" className="transform -rotate-90" style={{ filter: glowMap[verdict] }}>
        <circle cx="66" cy="66" r={radius} fill="none" stroke="hsl(var(--border) / 0.2)" strokeWidth={stroke} />
        <motion.circle
          cx="66"
          cy="66"
          r={radius}
          fill="none"
          stroke={colorMap[verdict]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={score}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          className="font-display text-4xl text-foreground"
        >
          {score}
        </motion.span>
        <span className="text-[10px] uppercase tracking-[0.24em] text-text-secondary mt-1">score</span>
      </div>
    </div>
  );
};

const FinfluencerDetector = ({ eventId }: FinfluencerDetectorProps) => {
  const [tipInput, setTipInput] = useState("");
  const [validationResult, setValidationResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = () => {
    const runValidation = async () => {
      const parsed = tipSchema.safeParse(tipInput);
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Please review the tip before analyzing.");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const liveNews = await fetchLiveNews();
        const formattedHeadlines = (Array.isArray(liveNews) ? liveNews : [])
          .slice(0, 5)
          .map((item, index) => `${index + 1}. ${item?.title ?? ""}`)
          .join(" ");

        let result;
        try {
          result = await validateTip(parsed.data, formattedHeadlines);
        } catch (backendErr) {
          console.warn("Backend validation failed, trying local Gemini logic...");
        }

        if (result && !result.error) {
          setValidationResult(result);
        } else {
          // Task 2: Local Gemini Path
          const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
          
          const prompt = `You are a financial fraud detector. Analyze this tip: "${parsed.data}". Cross-reference it with the latest live news: ${formattedHeadlines}. Return ONLY a valid JSON object: { "score": 0-100, "verdict": "Valid/Misleading/Noise", "reason": "..." }. Use 2 simple sentences for reason.`;
          
          const aiResult = await model.generateContent(prompt);
          const rawText = aiResult.response.text();
          const cleanJson = rawText.replace(/```json|```/gi, "").trim();
          setValidationResult(JSON.parse(cleanJson));
        }
      } catch (err) {
        console.error("Local fallback failed:", err);
        // Emergency Mock if everything totally breaks
        setValidationResult({
          score: 50,
          verdict: "Noise",
          reason: "Analysis currently limited. Be cautious of unverified claims during high volatility."
        });
      } finally {
        setIsLoading(false);
      }
    };

    runValidation();
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-6 py-24 md:px-10 lg:px-16">
      <div className="absolute inset-0 gradient-detector" />
      <div className="absolute inset-0 vignette-soft pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/50" />
        <motion.div
          className="absolute left-[35%] top-[15%] h-[36rem] w-[36rem] rounded-full bg-electric-violet/14 blur-[180px]"
          animate={{ scale: [0.94, 1.06, 0.96], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[20%] bottom-[25%] h-[24rem] w-[24rem] rounded-full bg-deep-purple/18 blur-[150px]"
          animate={{ x: [0, -15, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-12rem)] max-w-7xl flex-col justify-center gap-8">
        <div className="max-w-4xl">
          <Badge variant="outline" className="border-border/40 bg-secondary/40 px-4 py-1 text-[0.65rem] uppercase tracking-[0.32em] text-text-secondary">
            Finfluencer Detector
          </Badge>
          <h2 className="mt-6 font-display text-4xl leading-[0.94] text-foreground md:text-6xl">Stress-test the claim before the claim manipulates you.</h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-text-secondary md:text-lg">
            Paste a tip, let the system compare it against event-based reasoning, then reveal whether it is valid, misleading, or simply noise.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.div
            initial={{ opacity: 0, x: -24, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="glass-strong rounded-[2rem] p-8"
          >
            <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Paste the tip</p>
            <Textarea
              value={tipInput}
              onChange={(event) => setTipInput(event.target.value)}
              placeholder="Paste a market claim or finfluencer tip here..."
              className="mt-5 min-h-[180px] rounded-[1.5rem] border-border/30 bg-secondary/30 text-foreground placeholder:text-text-secondary/60 focus-visible:ring-primary/40"
            />
            <p className="mt-4 text-sm leading-7 text-text-secondary">Current evidence context: live market headlines</p>
            {error ? <p className="mt-3 text-sm text-critical">{error}</p> : null}
            <Button onClick={handleAnalyze} className="mt-6 h-12 rounded-2xl px-6">
              {isLoading ? "Validating tip..." : "Reveal verdict"}
            </Button>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tipInput || eventId}
              initial={{ opacity: 0, scale: 0.94, filter: "blur(16px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.96, filter: "blur(12px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="glass rounded-[2rem] border border-border/30 p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-6">
                  <CircularScore
                    score={validationResult?.score ?? 0}
                    verdict={
                      validationResult?.verdict === "Valid"
                        ? "Valid"
                        : validationResult?.verdict === "Misleading"
                          ? "Misleading"
                          : "False"
                    }
                  />
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Validation result</p>
                    <span className="text-sm uppercase tracking-[0.24em] text-text-secondary mt-1 block">validity score</span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`rounded-full px-4 py-1 text-xs ${
                    validationResult?.verdict === "Valid"
                      ? "border-success/20 bg-success/10 text-foreground"
                      : validationResult?.verdict === "Misleading"
                        ? "border-warning/20 bg-warning/10 text-foreground"
                        : "border-critical/20 bg-critical/10 text-foreground"
                  }`}
                >
                  {validationResult?.verdict ?? (isLoading ? "Analyzing..." : "Awaiting")}
                </Badge>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 rounded-[1.75rem] border border-border/30 bg-secondary/25 p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {validationResult?.verdict === "Valid" ? (
                      <ShieldCheck size={22} />
                    ) : validationResult?.verdict === "Misleading" ? (
                      <AlertTriangle size={22} />
                    ) : (
                      <Siren size={22} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Verdict</p>
                    <p className="mt-2 font-display text-3xl text-foreground">
                      {isLoading ? "Analyzing..." : (validationResult?.verdict ?? "Awaiting Analysis")}
                    </p>
                  </div>
                </div>
              </motion.div>

              <div className="mt-8 space-y-4">
                {validationResult?.reason ? (
                  <div className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-5 text-sm leading-7 text-foreground">
                    {validationResult.reason}
                  </div>
                ) : (
                   !isLoading && <p className="text-text-secondary italic text-sm text-center">Enter a tip and click reveal to begin detection.</p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default FinfluencerDetector;
