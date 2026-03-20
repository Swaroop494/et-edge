import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { intelligenceEvents } from "@/data/intelligence";

interface ChartIntelligenceProps {
  eventId: string;
}

const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const ChartIntelligence = ({ eventId }: ChartIntelligenceProps) => {
  const event = intelligenceEvents.find((item) => item.id === eventId) ?? intelligenceEvents[0];

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
        <motion.div
          initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.85, ease: smoothEase }}
          className="max-w-4xl"
        >
          <Badge variant="outline" className="border-border/40 bg-secondary/40 px-4 py-1 text-[0.65rem] uppercase tracking-[0.32em] text-text-secondary">
            Explainability Engine
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
                <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">What happened</p>
                <p className="font-display text-3xl leading-tight text-foreground">{event.title}</p>
                <p className="text-sm leading-7 text-text-secondary">{event.summary}</p>
              </div>

              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Which sectors and stocks</p>
                <div className="flex flex-wrap gap-2">
                  {event.sectors.map((sector) => (
                    <Badge key={sector} variant="outline" className="rounded-full border-accent/20 bg-accent/10 px-3 py-1 text-xs text-foreground">
                      {sector}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {event.affectedStocks.map((stock) => (
                    <Badge key={stock} variant="outline" className="rounded-full border-border/40 bg-secondary/50 px-3 py-1 text-xs text-text-secondary">
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
            className="glass rounded-[2rem] p-8"
          >
            <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Confidence score</p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="font-display text-5xl text-foreground">{event.confidence}%</p>
                <p className="mt-2 text-sm text-text-secondary">Glow intensity follows confidence, not hype.</p>
              </div>
              <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-xs text-foreground">
                AI Reasoned
              </Badge>
            </div>
            <div className="mt-6">
              <Progress value={event.confidence} className="h-3 bg-secondary/70" />
            </div>
            <div className="mt-6 rounded-2xl border border-border/30 bg-secondary/30 p-5 text-sm leading-7 text-text-secondary">
              {event.portfolioSignal}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.85, delay: 0.24, ease: smoothEase }}
          className="glass rounded-[2rem] p-8 md:p-10"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Reasoning trace</p>
              <h3 className="mt-3 font-display text-3xl text-foreground">How the AI reached its conclusion</h3>
            </div>
            <p className="max-w-xl text-sm leading-7 text-text-secondary">Each point links the event to market behavior in plain English so the system feels explainable, not opaque.</p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {event.reasoningTrace.map((reason, index) => (
              <motion.div
                key={reason}
                initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.12 * index, ease: smoothEase }}
                className="rounded-[1.5rem] border border-border/30 bg-secondary/30 p-5"
              >
                <div className="text-xs uppercase tracking-[0.24em] text-text-secondary">Trace {index + 1}</div>
                <p className="mt-4 text-sm leading-7 text-foreground">{reason}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ChartIntelligence;
