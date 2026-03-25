"use client";

import dynamic from "next/dynamic";
import DashboardLayout from "@/components/DashboardLayout";

const LearningLoopPage = dynamic(() => import("@/page-components/LearningLoopPage"), { ssr: false });

export default function LearningPage() {
  return (
    <DashboardLayout>
      <LearningLoopPage />
    </DashboardLayout>
  );
}
