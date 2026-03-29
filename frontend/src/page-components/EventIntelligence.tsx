"use client";

import { useState } from "react";
import OpportunityRadar from "@/components/OpportunityRadar";

const EventIntelligence = () => {
  const [selectedEventId, setSelectedEventId] = useState("rbi-rate-hike");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const handleSelectEvent = async (id: string, eventData?: any) => {
    setSelectedEventId(id);
    
    // In production, we'd fetch the detailed analysis if not provided
    if (eventData) {
      try {
        const response = await fetch("http://localhost:5500/api/analyze-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            headline: eventData.title,
            summary: eventData.description || eventData.title 
          })
        });

        if (!response.ok) throw new Error(`Backend unreachable: ${response.status}`);

        const data = await response.json();
        setSelectedEvent(data); // This fills the "Story Flow"
        
        // Persist for other pages (Explain, Impact, Video)
        localStorage.setItem("et_edge_event_analysis", JSON.stringify(data));
        localStorage.setItem("selectedEvent", JSON.stringify(data)); // Master Sync: Restore 'Everything Works' state
      } catch (err) {
        console.error("Failed to analyze event:", err);
      }
    }
  };

  return (
    <OpportunityRadar
      selectedEventId={selectedEventId}
      onSelectEvent={handleSelectEvent}
    />
  );
};

export default EventIntelligence;
