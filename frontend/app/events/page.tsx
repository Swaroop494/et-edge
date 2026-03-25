"use client";

import dynamic from "next/dynamic";
import DashboardLayout from "@/components/DashboardLayout";

const EventIntelligence = dynamic(() => import("@/page-components/EventIntelligence"), { ssr: false });

export default function EventsPage() {
  return (
    <DashboardLayout>
      <EventIntelligence />
    </DashboardLayout>
  );
}
