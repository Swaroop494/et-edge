"use client";

import { useState } from "react";
import OpportunityRadar from "@/components/OpportunityRadar";

const EventIntelligence = () => {
  const [selectedEventId, setSelectedEventId] = useState("rbi-rate-hike");

  return (
    <OpportunityRadar
      selectedEventId={selectedEventId}
      onSelectEvent={(id) => {
        setSelectedEventId(id);
      }}
    />
  );
};

export default EventIntelligence;
