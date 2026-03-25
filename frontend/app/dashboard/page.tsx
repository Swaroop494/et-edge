"use client";

import dynamic from "next/dynamic";
import DashboardLayout from "@/components/DashboardLayout";

const Dashboard = dynamic(() => import("@/page-components/Dashboard"), { ssr: false });

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  );
}
