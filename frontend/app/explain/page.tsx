"use client";

import dynamic from "next/dynamic";
import DashboardLayout from "@/components/DashboardLayout";

const Explainability = dynamic(() => import("@/page-components/Explainability"), { ssr: false });

export default function ExplainPage() {
  return (
    <DashboardLayout>
      <Explainability />
    </DashboardLayout>
  );
}
