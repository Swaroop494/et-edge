"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

const Dashboard = dynamic(() => import("@/page-components/Dashboard"), { ssr: false });

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  );
}
