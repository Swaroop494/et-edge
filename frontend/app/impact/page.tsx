"use client";

import dynamic from "next/dynamic";
import DashboardLayout from "@/components/DashboardLayout";

const PortfolioImpact = dynamic(() => import("@/page-components/PortfolioImpact"), { ssr: false });

export default function ImpactPage() {
  return (
    <DashboardLayout>
      <PortfolioImpact />
    </DashboardLayout>
  );
}
