"use client";

import { useState } from "react";
import OpportunityRadar from "@/components/OpportunityRadar";
import { useRouter } from "next/navigation";

const EventIntelligence = () => {
  const [selectedEventId, setSelectedEventId] = useState("rbi-rate-hike");
  const router = useRouter();

  return (
    <OpportunityRadar
      selectedEventId={selectedEventId}
      onSelectEvent={(id) => {
        setSelectedEventId(id);
        router.push("/explain");
      }}
      onContinue={() => router.push("/explain")}
    />
  );
};

export default EventIntelligence;
