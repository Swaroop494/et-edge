"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { analyzeEvent, fetchLiveNews } from "@/utils/api.js";

interface OpportunityRadarProps {
  selectedEventId: string;
  onSelectEvent: (eventId: string) => void;
}

const OpportunityRadar = ({ selectedEventId, onSelectEvent }: OpportunityRadarProps) => {
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [eventAnalysis, setEventAnalysis] = useState<any | null>(null);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  useEffect(() => {
    const loadNews = async () => {
      setIsLoadingNews(true);
      const latestNews = await fetchLiveNews();
      setNewsArticles(Array.isArray(latestNews) ? latestNews : []);
      setIsLoadingNews(false);
    };

    loadNews();
  }, []);

  const handleArticleClick = async (article: any) => {
    setSelectedArticle(article);
    onSelectEvent(article?.id ?? article?.title ?? selectedEventId);
    setIsLoadingAnalysis(true);

    const result = await analyzeEvent(article?.title ?? "", article?.description ?? "");
    setEventAnalysis(result);
    localStorage.setItem("et_edge_event_analysis", JSON.stringify(result));
    setIsLoadingAnalysis(false);
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-4 md:px-10 lg:px-16 py-16 md:py-24 bg-fixed">
      <div className="absolute inset-0 gradient-event bg-fixed" />
      <div className="absolute inset-0 gradient-hero ambient-shift bg-fixed" />
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

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-12rem)] max-w-7xl flex-col justify-center gap-10 lg:gap-14 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 28, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end"
        >
          <div className="max-w-4xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Badge variant="outline" className="w-fit border-border/40 bg-secondary/40 px-4 py-1 text-[0.65rem] uppercase tracking-[0.32em] text-text-secondary">
                Event Intelligence
              </Badge>
              <div className="glass w-fit rounded-full px-4 py-2 text-[10px] md:text-xs text-text-secondary">
                AI Accuracy <span className="ml-2 text-foreground font-bold">72% → 76%</span>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="font-display text-4xl leading-[1.1] text-foreground md:text-6xl lg:text-[5.6rem] tracking-tighter">
                See the <span className="text-gradient-primary">event</span> before it becomes everyone else's story.
              </h1>
              <p className="max-w-prose text-sm leading-relaxed text-text-secondary md:text-lg">
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
                <p className="mt-2 text-lg text-foreground">
                  {isLoadingAnalysis
                    ? "Analysing event..."
                    : eventAnalysis
                      ? (selectedArticle?.title ?? "Selected event")
                      : "Select a news headline to see AI analysis."}
                </p>
              </div>
              <Sparkles className="text-accent" size={18} />
            </div>
            <div className="mt-6 grid gap-3 text-sm text-text-secondary">
              {isLoadingAnalysis ? (
                <div className="rounded-2xl border border-border/30 bg-secondary/30 p-4">Analysing event...</div>
              ) : eventAnalysis ? (
                <>
                  <div className="rounded-2xl border border-border/30 bg-secondary/30 p-4">
                    <span className="text-foreground">What happened: </span>
                    {eventAnalysis.whatHappened}
                  </div>
                  <div className="rounded-2xl border border-border/30 bg-secondary/30 p-4">
                    <span className="text-foreground">Why it matters: </span>
                    {eventAnalysis.whyItMatters}
                  </div>
                  <div className="rounded-2xl border border-border/30 bg-secondary/30 p-4">
                    <span className="text-foreground">Affected sectors: </span>
                    {Array.isArray(eventAnalysis.affectedSectors) ? eventAnalysis.affectedSectors.join(", ") : ""}
                  </div>
                  <div className="rounded-2xl border border-border/30 bg-secondary/30 p-4">
                    <span className="text-foreground">Affected stocks: </span>
                    {Array.isArray(eventAnalysis.affectedStocks) ? eventAnalysis.affectedStocks.join(", ") : ""}
                  </div>
                  <div className="rounded-2xl border border-border/30 bg-secondary/30 p-4">
                    <span className="text-foreground">Confidence score: </span>
                    {eventAnalysis.confidenceScore != null ? `${eventAnalysis.confidenceScore}%` : ""}
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-border/30 bg-secondary/30 p-4">Select a news headline to see AI analysis.</div>
              )}
            </div>
          </motion.div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {isLoadingNews ? (
            <div className="glass rounded-[2rem] border border-border/30 p-6 text-left">Loading latest market news...</div>
          ) : (
            newsArticles.map((event: any, index: number) => {
              const isSelected = (event?.id ?? event?.title) === selectedEventId;

              return (
                <motion.button
                  key={event?.id ?? `${event?.title}-${index}`}
                  type="button"
                  initial={{ opacity: 0, y: 36, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.85, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: 1.03, y: -8, rotateX: 2, rotateY: -2 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => handleArticleClick(event)}
                  className={`card-3d group relative overflow-hidden rounded-[2rem] border p-6 text-left transition-all duration-500 ${
                    isSelected
                      ? "glass-strong border-primary/30 glow-soft-violet"
                      : "glass border-border/30 hover:border-accent/20 hover:glow-soft-cyan"
                  }`}
                >
                  <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-70" />
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <Badge variant="outline" className="rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] border-border/50 bg-secondary/60 text-text-secondary">
                        {event?.source ?? "News"}
                      </Badge>
                      <h2 className="font-display text-2xl leading-tight text-foreground">{event?.title}</h2>
                    </div>
                    <motion.span
                      className="mt-1 h-3 w-3 rounded-full bg-accent shadow-[0_0_18px_hsl(var(--accent)/0.45)]"
                      animate={{ scale: [1, 1.25, 1], opacity: [0.65, 1, 0.65] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>

                  <p className="mt-5 text-sm leading-7 text-text-secondary">{event?.source}</p>

                  <div className="mt-7 flex items-center justify-between text-sm text-text-secondary">
                    <span>Analyze this event</span>
                    <ArrowUpRight className="transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" size={18} />
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default OpportunityRadar;
