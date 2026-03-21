import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { intelligenceEvents } from "@/data/intelligence";

interface OpportunityRadarProps {
  selectedEventId: string;
  onSelectEvent: (eventId: string) => void;
  onContinue: () => void;
}

const importanceClasses = {
  High: "border-primary/30 bg-primary/10 text-foreground",
  Elevated: "border-accent/30 bg-accent/10 text-foreground",
  Watch: "border-border/50 bg-secondary/60 text-text-secondary",
};

const OpportunityRadar = ({ selectedEventId, onSelectEvent, onContinue }: OpportunityRadarProps) => {
  return (
    <section className="relative min-h-screen overflow-hidden px-6 py-24 md:px-10 lg:px-16">
      <div className="absolute inset-0 gradient-event" />
      <div className="absolute inset-0 gradient-hero ambient-shift" />
      <div className="absolute inset-0 vignette-soft pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute left-[5%] top-[8%] h-[32rem] w-[32rem] rounded-full bg-neon-cyan/15 blur-[160px]"
          animate={{ x: [0, 35, 0], y: [0, -28, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[4%] right-[8%] h-[28rem] w-[28rem] rounded-full bg-accent/12 blur-[140px]"
          animate={{ x: [0, -26, 0], y: [0, 24, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[30%] top-[40%] h-[20rem] w-[20rem] rounded-full bg-electric-violet/8 blur-[120px]"
          animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-12rem)] max-w-7xl flex-col justify-center gap-14">
        <motion.div
          initial={{ opacity: 0, y: 28, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end"
        >
          <div className="max-w-4xl space-y-7">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="border-border/40 bg-secondary/40 px-4 py-1 text-[0.65rem] uppercase tracking-[0.32em] text-text-secondary">
                Event Intelligence
              </Badge>
              <div className="glass rounded-full px-4 py-2 text-xs text-text-secondary">
                AI Accuracy <span className="ml-2 text-foreground">72% → 76%</span>
              </div>
            </div>

            <div className="space-y-5">
              <h1 className="font-display text-5xl leading-[0.9] text-foreground md:text-7xl lg:text-[5.6rem]">
                See the <span className="text-gradient-primary">event</span> before it becomes everyone else's story.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-text-secondary md:text-lg">
                ET Edge now begins with event-driven reasoning — detect what changed, understand why it matters, and follow the impact through your decisions.
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.1, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="glass-strong rounded-[2rem] p-6 md:p-7"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Story flow</p>
                <p className="mt-2 text-lg text-foreground">Event → Explanation → Impact → Validation → Exploration</p>
              </div>
              <Sparkles className="text-accent" size={18} />
            </div>
            <div className="mt-6 grid gap-3 text-sm text-text-secondary md:grid-cols-2">
              <div className="rounded-2xl border border-border/30 bg-secondary/30 p-4">Reasoning-first signals, not disconnected widgets.</div>
              <div className="rounded-2xl border border-border/30 bg-secondary/30 p-4">Every event can pull you deeper into explainability and personal impact.</div>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {intelligenceEvents.map((event, index) => {
            const isSelected = event.id === selectedEventId;

            return (
              <motion.button
                key={event.id}
                type="button"
                initial={{ opacity: 0, y: 36, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.85, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.03, y: -8, rotateX: 2, rotateY: -2 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => {
                  onSelectEvent(event.id);
                  onContinue();
                }}
                className={`card-3d group relative overflow-hidden rounded-[2rem] border p-6 text-left transition-all duration-500 ${
                  isSelected
                    ? "glass-strong border-primary/30 glow-soft-violet"
                    : "glass border-border/30 hover:border-accent/20 hover:glow-soft-cyan"
                }`}
              >
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-70" />
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <Badge variant="outline" className={`rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] ${importanceClasses[event.importance]}`}>
                      {event.type}
                    </Badge>
                    <h2 className="font-display text-2xl leading-tight text-foreground">{event.title}</h2>
                  </div>
                  <motion.span
                    className="mt-1 h-3 w-3 rounded-full bg-accent shadow-[0_0_18px_hsl(var(--accent)/0.45)]"
                    animate={{ scale: [1, 1.25, 1], opacity: [0.65, 1, 0.65] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>

                <p className="mt-5 text-sm leading-7 text-text-secondary">{event.summary}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {event.sectors.map((sector) => (
                    <Badge key={sector} variant="outline" className="rounded-full border-accent/20 bg-accent/10 px-3 py-1 text-xs text-foreground">
                      {sector}
                    </Badge>
                  ))}
                </div>

                <div className="mt-7 flex items-center justify-between text-sm text-text-secondary">
                  <span>Open explainability view</span>
                  <ArrowUpRight className="transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" size={18} />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OpportunityRadar;
