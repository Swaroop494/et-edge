"use client";

import dynamic from "next/dynamic";
import DashboardLayout from "@/components/DashboardLayout";

const FinfluencerPage = dynamic(() => import("@/page-components/FinfluencerPage"), { ssr: false });

export default function DetectorPage() {
  return (
    <DashboardLayout>
      <FinfluencerPage />
    </DashboardLayout>
  );
}
