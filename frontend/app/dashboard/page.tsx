"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

const Dashboard = dynamic(() => import("@/page-components/Dashboard"), { ssr: false });

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useAuth();
  if (isLoaded && !isSignedIn) {
    redirect("/login");
  }

  if (!isLoaded) return null;

  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  );
}
