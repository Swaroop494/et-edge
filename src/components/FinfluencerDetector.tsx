import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { AlertTriangle, ShieldCheck, Siren } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { intelligenceEvents } from "@/data/intelligence";

interface FinfluencerDetectorProps {
  eventId: string;
}

const tipSchema = z.string().trim().min(12, "Paste a fuller investing claim to analyze.").max(280, "Keep the pasted tip under 280 characters.");

const verdictStyles = {
  Valid: "border-success/20 bg-success/10 text-foreground",
  Misleading: "border-warning/20 bg-warning/10 text-foreground",
  False: "border-critical/20 bg-critical/10 text-foreground",
};

const verdictIcons = {
  Valid: ShieldCheck,
  Misleading: AlertTriangle,
  False: Siren,
};

const analyzeTip = (tip: string, eventTitle: string) => {
  const normalized = tip.toLowerCase();
  const hypeSignals = ["guaranteed", "sure shot", "double", "no risk", "insider", "hidden upper circuit"];
  const hypeCount = hypeSignals.reduce((count, phrase) => count + (normalized.includes(phrase) ? 1 : 0), 0);
  const eventAware = eventTitle.toLowerCase().split(" ").some((word) => word.length > 4 && normalized.includes(word));

  const score = Math.max(18, Math.min(91, 76 + (eventAware ? 8 : 0) - hypeCount * 22));
  const verdict = score >= 72 ? "Valid" : score >= 42 ? "Misleading" : "False";

  return {
    score,
    verdict: verdict as keyof typeof verdictStyles,
    reasons: [
      eventAware
        ? `The claim references the active market event: ${eventTitle}.`
        : `The claim is not clearly anchored to the current event context: ${eventTitle}.`,
      hypeCount > 0
        ? "Promotional language lowers confidence because it replaces evidence with certainty."
        : "The wording is relatively measured, which improves credibility.",
      verdict === "Valid"
        ? "The logic aligns with observable event transmission and sector impact."
        : verdict === "Misleading"
          ? "Parts of the claim may be directionally true, but the confidence is overstated."
          : "The claim conflicts with explainable event-based reasoning and should not be trusted as-is.",
    ],
  };
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
  const event = intelligenceEvents.find((item) => item.id === eventId) ?? intelligenceEvents[0];
  const [tipInput, setTipInput] = useState("Sure shot multibagger: RBI rate hike means every bank stock will rally tomorrow.");
  const [error, setError] = useState("");
  const [submittedTip, setSubmittedTip] = useState(tipInput);

  const result = useMemo(() => analyzeTip(submittedTip, event.title), [submittedTip, event.title]);
  const VerdictIcon = verdictIcons[result.verdict];

  const handleAnalyze = () => {
    const parsed = tipSchema.safeParse(tipInput);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please review the tip before analyzing.");
      return;
    }
    setError("");
    setSubmittedTip(parsed.data);
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
            <p className="mt-4 text-sm leading-7 text-text-secondary">Current evidence context: <span className="text-foreground">{event.title}</span></p>
            {error ? <p className="mt-3 text-sm text-critical">{error}</p> : null}
            <Button onClick={handleAnalyze} className="mt-6 h-12 rounded-2xl px-6">
              Reveal verdict
            </Button>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${event.id}-${submittedTip}`}
              initial={{ opacity: 0, scale: 0.94, filter: "blur(16px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.96, filter: "blur(12px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="glass rounded-[2rem] border border-border/30 p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-6">
                  <CircularScore score={result.score} verdict={result.verdict} />
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Validation result</p>
                    <span className="text-sm uppercase tracking-[0.24em] text-text-secondary mt-1 block">validity score</span>
                  </div>
                </div>
                <Badge variant="outline" className={`rounded-full px-4 py-1 text-xs ${verdictStyles[result.verdict]}`}>
                  {result.verdict}
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
                    <VerdictIcon size={22} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Verdict</p>
                    <p className="mt-2 font-display text-3xl text-foreground">{result.verdict}</p>
                  </div>
                </div>
              </motion.div>

              <div className="mt-8 space-y-4">
                {result.reasons.map((reason, index) => (
                  <motion.div
                    key={reason}
                    initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.55, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-[1.5rem] border border-border/30 bg-secondary/20 p-5 text-sm leading-7 text-foreground"
                  >
                    {reason}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default FinfluencerDetector;
