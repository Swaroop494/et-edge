import { useState } from "react";
import OpportunityRadar from "@/components/OpportunityRadar";
import { useNavigate } from "react-router-dom";

const EventIntelligence = () => {
  const [selectedEventId, setSelectedEventId] = useState("rbi-rate-hike");
  const navigate = useNavigate();

  return (
    <OpportunityRadar
      selectedEventId={selectedEventId}
      onSelectEvent={(id) => {
        setSelectedEventId(id);
        navigate("/explain");
      }}
      onContinue={() => navigate("/explain")}
    />
  );
};

export default EventIntelligence;
