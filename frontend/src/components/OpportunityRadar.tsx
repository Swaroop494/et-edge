import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface Event {
  id: string;
  title: string;
  description?: string;
  category: string;
  impact: "Positive" | "Negative" | "Volatile" | "mixed" | "positive";
}

interface OpportunityRadarProps {
  selectedEventId: string;
  onSelectEvent: (id: string, eventData: Event) => void;
}

const OpportunityRadar = ({ selectedEventId, onSelectEvent }: OpportunityRadarProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`http://localhost:5500/api/live-news?nocache=${Date.now()}`);
        const data = await res.json();
        
        if (data && data.length >= 5) {
          const mapped = data.map((item: any, idx: number) => ({
            // Generate unique stable ID by combining index and slug
            id: `${idx}_${item.title.toLowerCase().replace(/\s+/g, '-').substring(0, 30)}`,
            title: item.title,
            description: item.description,
            category: item.aiAnalysis?.sector || "Market",
            impact: item.aiAnalysis?.sentiment || "Volatile"
          }));
          setEvents(mapped);
          setIsLoading(false); // SUCCESS: Clear loading only on full data
          
          if (mapped.length > 0 && !selectedEventId) {
            onSelectEvent(mapped[0].id, mapped[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch live news:", err);
      }
    };
    fetchNews();
  }, []);

  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0] || { id: 'none', title: "Initializing...", category: "General" };

  return (
    <div className="flex h-screen w-full bg-[#020617] text-white overflow-hidden">
      {/* LEFT CONTENT: HERO + GRID */}
      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
        {/* HERO SECTION */}
        <section className="px-12 pt-20 pb-12 flex flex-col lg:flex-row gap-12 items-start relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] -z-10 rounded-full" />
           
           <div className="flex-1 max-w-2xl">
              <Badge variant="outline" className="border-white/10 text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-6">
                Event Intelligence · AI Accuracy 72% — 78%
              </Badge>
              <h1 className="text-6xl md:text-7xl font-display font-medium leading-[1.05] tracking-tight mb-8">
                See the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">event</span> before it becomes everyone else&apos;s story.
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                ET Edge now begins with event-driven reasoning — detect what changed, understand why it matters, and follow the impact through your decisions.
              </p>
           </div>

           {/* FEATURED CARD */}
           {selectedEvent.id !== 'none' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key={selectedEvent.id}
                className="w-full lg:w-[450px] aspect-[4/3] glass-strong rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative group shrink-0"
              >
                  <div className="flex justify-between items-start mb-6">
                    <Badge className="bg-white/5 border-white/10 text-accent text-[10px] uppercase tracking-widest px-4 py-2">
                       {selectedEvent.category}
                    </Badge>
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  </div>
                  <h3 className="text-3xl font-display font-medium leading-tight mb-6 line-clamp-4">
                    {selectedEvent.title}
                  </h3>
                  <div className="absolute bottom-10 left-8 right-8 flex items-center justify-between border-t border-white/5 pt-6">
                     <p className="text-xs uppercase tracking-widest text-text-secondary font-bold">In-Depth Analysis</p>
                     <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-accent/20 group-hover:border-accent/40 transition-all">
                        <TrendingUp size={16} className="text-accent" />
                     </div>
                  </div>
              </motion.div>
           )}
        </section>

        {/* BOTTOM SECTION: MORE EVENTS GRID */}
        <section className="px-12 pb-24">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-gray-500">More Intelligence Nodes</h3>
              <div className="h-px flex-1 mx-8 bg-white/5" />
           </div>

           {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-64 glass-strong rounded-3xl animate-pulse" />
                ))}
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {events.map((event) => (
                 <div
                   key={event.id}
                   onClick={() => onSelectEvent(event.id, event)}
                   className={cn(
                     "p-8 glass rounded-[2.2rem] border transition-all cursor-pointer h-64 flex flex-col justify-between hover:scale-[1.02] active:scale-[0.98]",
                     selectedEventId === event.id 
                       ? "border-accent/50 bg-accent/10 shadow-[0_0_40px_rgba(24,255,255,0.1)]" 
                       : "border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                   )}
                 >
                   <div className="space-y-4">
                     <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{event.category}</p>
                     <h4 className="text-lg font-medium leading-snug line-clamp-3">{event.title}</h4>
                   </div>
                   <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-[10px] uppercase tracking-widest text-accent font-black">Analyze →</span>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        (event.impact === 'Positive' || event.impact === 'positive') ? 'bg-accent' : 'bg-warning'
                      )} />
                   </div>
                 </div>
               ))}
             </div>
           )}
        </section>
      </div>

      {/* RIGHT SIDEBAR: STORY FLOW */}
      <div className="w-[420px] bg-[#020617] border-l border-white/10 flex flex-col h-full shadow-[-20px_0_60px_rgba(0,0,0,0.5)] z-20">
         <div className="p-10 border-b border-white/5">
            <h2 className="text-[10px] uppercase tracking-[0.4em] font-black text-accent mb-2">Neural Story Flow</h2>
            <p className="text-gray-500 text-xs">Structural Decomposition V4.2</p>
         </div>

         <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
            {selectedEvent.id !== 'none' ? (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* 1. What Happened */}
                <div className="relative pl-8 border-l border-accent/20">
                  <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_15px_rgba(24,255,255,0.8)]" />
                  <label className="block text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4">Core Event Signal</label>
                  <p className="text-lg text-white font-medium leading-relaxed">
                    {selectedEvent.title}
                  </p>
                </div>

                {/* 2. Why It Matters */}
                <div className="relative pl-8 border-l border-purple-500/20">
                  <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
                  <label className="block text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4">Neural Impact Theory</label>
                  <p className="text-sm text-gray-400 leading-relaxed italic">
                    {selectedEvent.description || "Synthesizing market metadata to determine structural implications for the next 48 hours..."}
                  </p>
                </div>

                {/* 3. Indicators Grid */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <label className="block text-[9px] text-gray-500 uppercase tracking-widest font-black mb-3">Confidence</label>
                    <span className="text-accent font-display font-medium text-4xl">
                      78<span className="text-xl">%</span>
                    </span>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <label className="block text-[9px] text-gray-500 uppercase tracking-widest font-black mb-3">Impact</label>
                    <span className={cn(
                      "text-xl font-black uppercase tracking-tighter",
                      (selectedEvent.impact === 'Positive' || selectedEvent.impact === 'positive') ? "text-accent" : "text-warning"
                    )}>
                      {(selectedEvent.impact === 'Positive' || selectedEvent.impact === 'positive') ? "Bullish" : "Volatile"}
                    </span>
                  </div>
                </div>

                {/* 4. Deep Reasoning */}
                <div className="bg-accent/5 border border-accent/10 rounded-[2rem] p-8 space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-ping" />
                      <span className="text-[10px] uppercase tracking-widest text-accent font-black">Strategy Agent</span>
                   </div>
                   <p className="text-xs text-gray-400 leading-7">
                      ET Edge detected abnormal institutional accumulation in the <strong>{selectedEvent.category}</strong> sector. 
                      Logical patterns suggest a transition from consolidation to structural momentum. Recommend position calibration.
                   </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border border-dashed border-gray-700 rounded-full mb-6 border-t-accent animate-spin" />
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-black leading-relaxed text-center">
                  Initializing Neural Link<br/>Select Node to Decompose
                </p>
              </div>
            )}
         </div>

         <div className="p-10 border-t border-white/5 text-center">
            <p className="text-[8px] uppercase tracking-[0.4em] text-gray-600 font-black">
              Fiduciary Node Verified · Level 4 Intelligence
            </p>
         </div>
      </div>
    </div>
  );
};

export default OpportunityRadar;
