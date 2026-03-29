import { useEffect, useState } from "react";
import ChartIntelligence from "@/components/ChartIntelligence";

const Explainability = () => {
  const [currentEventId, setCurrentEventId] = useState<string>("latest");

  useEffect(() => {
    // Attempt to sync the ID for the prop, although ChartIntelligence
    // reads the data directly from localStorage anyway.
    const stored = localStorage.getItem("et_edge_event_analysis");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.id) setCurrentEventId(parsed.id);
      } catch (e) {}
    }
  }, []);

  return <ChartIntelligence eventId={currentEventId} />;
};

export default Explainability;
