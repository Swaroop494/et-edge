import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, ChevronDown, ChevronUp, Clock, Database, TrendingUp, AlertCircle, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import VideoReport from "./VideoReport";

const highlights = [
  { icon: TrendingUp, text: "NIFTY opened gap-up at 22,847 — momentum sustained above 200 DMA" },
  { icon: AlertCircle, text: "RBI policy stance unchanged — rate-sensitive sectors see profit booking" },
  { icon: BarChart3, text: "FII flows turned positive after 5 sessions — ₹1,247 Cr net buy" },
  { icon: TrendingUp, text: "IT sector outperforms on weak rupee tailwind — TCS, Infosys lead" },
];

const dataSources = ["NSE", "BSE", "RBI", "Reuters", "Bloomberg", "SEBI"];

const scriptPreview = `Good morning. Here's your AI-generated market brief for March 20, 2026.

Indian equity markets opened on a positive note today, with the NIFTY 50 index climbing above the 22,800 level. The rally was broad-based, led by Information Technology and Financial Services.

The Reserve Bank of India maintained its neutral policy stance in yesterday's monetary policy review, keeping the repo rate unchanged at 6.5%. Rate-sensitive sectors like banking and real estate saw mixed reactions, with initial selling pressure followed by recovery.

Foreign Institutional Investors turned net buyers after five consecutive sessions of selling, pumping in ₹1,247 crore into Indian equities. This shift in sentiment has provided additional support to the ongoing rally.

Key levels to watch: NIFTY support at 22,650 and resistance at 23,100. The AI model assigns a 67% probability of the index testing resistance within the next two sessions.

Stay informed. Stay ahead.`;

const AIVideoBriefing = () => {
  const [scriptOpen, setScriptOpen] = useState(false);
  const [marketData, setMarketData] = useState<any>(null);

  useEffect(() => {
    // Load data from localStorage (populated by AgentRunner or Detector)
    const eventAnalysis = localStorage.getItem("et_edge_event_analysis");
    const portfolioResult = localStorage.getItem("et_edge_portfolio_result");
    
    if (eventAnalysis || portfolioResult) {
      setMarketData({
        event: eventAnalysis ? JSON.parse(eventAnalysis) : null,
        portfolio: portfolioResult ? JSON.parse(portfolioResult) : null,
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden px-6 py-24 md:px-10 lg:px-16">
      <div className="absolute inset-0 gradient-video" />
      <div className="absolute inset-0 vignette-soft pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/50" />
        <motion.div
          className="absolute left-[20%] top-[20%] h-[32rem] w-[32rem] rounded-full bg-teal/12 blur-[160px]"
          animate={{ scale: [0.96, 1.04, 0.96], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[15%] bottom-[20%] h-[28rem] w-[28rem] rounded-full bg-deep-purple/15 blur-[140px]"
          animate={{ x: [0, 20, 0], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-12rem)] max-w-7xl flex-col justify-center gap-8">
        <div className="max-w-4xl">
          <Badge variant="outline" className="border-border/40 bg-secondary/40 px-4 py-1 text-[0.65rem] uppercase tracking-[0.32em] text-text-secondary">
            AI Video Engine
          </Badge>
          <h2 className="mt-6 font-display text-4xl leading-[0.94] text-foreground md:text-6xl">
            Your daily market brief, narrated by AI.
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-text-secondary md:text-lg">
            A 60-second AI-generated video summary of the most important market moves, signals, and risks — delivered every morning.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Dynamic Video Pipeline Component */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <VideoReport data={marketData} />
          </motion.div>

          {/* Highlights + details panel */}
          <motion.div
            initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4"
          >
            {/* Key highlights */}
            <div className="glass rounded-[1.75rem] border border-border/30 p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-text-secondary mb-5">Key Highlights</p>
              <div className="space-y-3">
                {highlights.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-start gap-3 rounded-xl p-3 bg-secondary/15 border border-border/15"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <item.icon className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <p className="text-sm leading-6 text-foreground/85">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Data sources */}
            <div className="glass rounded-[1.75rem] border border-border/30 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-3.5 h-3.5 text-text-secondary" />
                <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Data Sources</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {dataSources.map((source) => (
                  <Badge key={source} variant="outline" className="border-border/30 bg-secondary/30 text-text-secondary text-[10px] tracking-wider">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Collapsible script */}
            <Collapsible open={scriptOpen} onOpenChange={setScriptOpen}>
              <div className="glass rounded-[1.75rem] border border-border/30 overflow-hidden">
                <CollapsibleTrigger className="w-full flex items-center justify-between p-5 hover:bg-secondary/10 transition-colors duration-300">
                  <p className="text-xs uppercase tracking-[0.28em] text-text-secondary">Script Preview</p>
                  {scriptOpen ? (
                    <ChevronUp className="w-4 h-4 text-text-secondary" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-secondary" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-5 pb-5">
                    <p className="text-xs leading-6 text-text-secondary/80 whitespace-pre-line max-h-48 overflow-y-auto scrollbar-thin">
                      {scriptPreview}
                    </p>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AIVideoBriefing;
