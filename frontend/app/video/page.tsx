"use client";

import dynamic from "next/dynamic";
import DashboardLayout from "@/components/DashboardLayout";

const VideoBriefingPage = dynamic(() => import("@/page-components/VideoBriefingPage"), { ssr: false });

export default function VideoPage() {
  return (
    <DashboardLayout>
      <VideoBriefingPage />
    </DashboardLayout>
  );
}
