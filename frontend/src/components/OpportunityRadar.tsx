"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  category: string;
  impact: "positive" | "negative" | "mixed";
}

interface OpportunityRadarProps {
  selectedEventId: string;
  onSelectEvent: (id: string) => void;
}

const OpportunityRadar = ({ selectedEventId, onSelectEvent }: OpportunityRadarProps) => {
  // Mock data for the sidebar - in production, this comes from your /api/news
  const events: Event[] = [
    { id: "rbi-rate-hike", title: "RBI maintains repo rate at 6.5%", category: "Monetary Policy", impact: "mixed" },
    { id: "reliance-green", title: "Reliance pivoting to Green Hydrogen", category: "Energy", impact: "positive" },
    { id: "hdfc-breakout", title: "HDFC Bank technical breakout at 1700", category: "Banking", impact: "positive" },
  ];

  return (
    <div className="flex h-full w-full gap-6 p-6 bg-black/50">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => onSelectEvent(event.id)}
            className={cn(
              "p-5 rounded-xl border transition-all cursor-pointer",
              selectedEventId === event.id 
                ? "border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                : "border-white/10 bg-white/5 hover:border-white/30"
            )}
          >
            <div className="flex justify-between items-start mb-3">
              {/* FIX: Removed <Link> wrapping to stop 404 errors */}
              <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">
                {event.category}
              </span>
              <div className={cn(
                "w-2 h-2 rounded-full",
                event.impact === 'positive' ? 'bg-green-500' : 'bg-yellow-500'
              )} />
            </div>
            <h3 className="text-sm font-medium text-white leading-tight">{event.title}</h3>
            <p className="text-[10px] text-gray-500 mt-2">Click to analyze neural trace →</p>
          </div>
        ))}
      </div>

      {/* REASONING SIDEBAR (Story Flow) */}
      <div className="w-80 bg-white/5 border border-white/10 rounded-2xl p-6 hidden lg:block">
        <h2 className="text-lg font-semibold text-white mb-4">Neural Reasoning</h2>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-2 w-20 bg-blue-500/30 rounded mb-2" />
            <div className="h-10 bg-white/5 rounded" />
          </div>
          <p className="text-xs text-gray-400 italic">
            Select an event to decompose the market logic...
          </p>
        </div>
      </div>
    </div>
  );
};

export default OpportunityRadar;
