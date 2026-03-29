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
  macroSector: string;
  microSector: string;
  impact: "Positive" | "Negative" | "Volatile" | "mixed" | "positive";
  confidence?: number;
  aiAnalysis?: any;
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
        
        if (data && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item: any) => ({
            id: item.id || `EVT_${Date.now()}_${Math.random()}`,
            title: item.title,
            description: item.description,
            category: item.aiAnalysis?.macroSector || "Market",
            macroSector: item.aiAnalysis?.macroSector || "Market",
            microSector: item.aiAnalysis?.microSector || "General Equity",
            impact: item.aiAnalysis?.sentiment || "Volatile",
            confidence: item.aiAnalysis?.confidence || 78,
            aiAnalysis: item.aiAnalysis
          }));
          setEvents(mapped);
          setIsLoading(false); // SUCCESS: Clear loading only on full data from localhost:5500
          
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

  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0] || { id: 'none', title: "Initializing...", category: "General", macroSector: "General", microSector: "General" };

  return (
    <div className="flex h-screen w-full bg-[#020617] text-white overflow-hidden">
      {/* LEFT CONTENT: GRID ONLY */}
      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pt-10">

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
                     <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className="bg-accent text-black text-[8px] uppercase tracking-widest px-2 py-1 font-black shrink-0">
                          {event.macroSector}
                        </Badge>
                        <Badge variant="outline" className="border-white/10 text-white/40 text-[8px] uppercase tracking-widest px-2 py-1 font-medium shrink-0">
                          {event.microSector}
                        </Badge>
                     </div>
                     <h4 className="text-lg font-medium leading-snug line-clamp-3">{event.title}</h4>
                   </div>
                   <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-[10px] uppercase tracking-widest text-accent font-black">Analyze Trace →</span>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        (event.impact?.toLowerCase() === 'positive') ? 'bg-accent' : (event.impact?.toLowerCase() === 'negative' ? 'bg-red-400' : 'bg-warning')
                      )} />
                   </div>
                 </div>
               ))}
             </div>
           )}
        </section>
      </div>

      {/* RIGHT SIDEBAR: STORY FLOW */}
      <div className="w-[420px] bg-[#020617] border-l border-white/10 flex flex-col h-screen fixed right-0 top-0 shadow-[-20px_0_60px_rgba(0,0,0,0.5)] z-50">
         <div className="p-10 border-b border-white/5 shrink-0">
            <h2 className="text-[10px] uppercase tracking-[0.4em] font-black text-accent mb-2">Neural Story Flow</h2>
            <p className="text-gray-500 text-[10px]">Structural Decomposition V4.2</p>
         </div>

         <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar pb-32">
            {/* 1. Core Signal */}
            <div className="relative pl-8 border-l border-accent/20">
              <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_15px_#18ffff]" />
              <label className="block text-[9px] text-gray-500 uppercase font-black mb-3">Core Event Signal</label>
              <p className="text-lg text-white font-medium leading-snug">{selectedEvent.title}</p>
            </div>

            {/* 2. Clusters */}
            <div className="relative pl-8 border-l border-cyan-500/20">
              <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <label className="block text-[9px] text-gray-500 uppercase font-black mb-3">Affected Clusters</label>
              <p className="text-sm font-bold text-cyan-400">{selectedEvent.macroSector} → {selectedEvent.microSector}</p>
            </div>

            {/* 3. Neural Theory */}
            <div className="relative pl-8 border-l border-purple-500/20">
              <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-purple-500" />
              <label className="block text-[9px] text-gray-500 uppercase font-black mb-3">Neural Impact Theory</label>
              <p className="text-sm text-gray-400 leading-relaxed italic">{selectedEvent.description || "Synthesizing market metadata to determine structural implications for the next 48 hours..."}</p>
            </div>

            {/* 4. Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-center">
                <span className="block text-[8px] text-gray-500 uppercase mb-1">Confidence</span>
                <span className="text-2xl font-display text-accent">{selectedEvent.confidence || 78}%</span>
              </div>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-center">
                <span className="block text-[8px] text-gray-500 uppercase mb-1">Impact</span>
                <span className={`text-sm font-black ${selectedEvent.impact?.toLowerCase() === 'positive' ? 'text-accent' : (selectedEvent.impact?.toLowerCase() === 'negative' ? 'text-red-400' : 'text-warning')}`}>
                  {selectedEvent.impact?.toLowerCase() === 'positive' ? 'BULLISH' : (selectedEvent.impact?.toLowerCase() === 'negative' ? 'BEARISH' : 'VOLATILE')}
                </span>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default OpportunityRadar;
