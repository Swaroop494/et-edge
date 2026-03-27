"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import MarketOverview from "@/components/dashboard/MarketOverview";
import MarketCards from "@/components/dashboard/MarketCards";
import StockChart from "@/components/dashboard/StockChart";
import EventHighlights from "@/components/dashboard/EventHighlights";
import LearningLoop from "@/components/dashboard/LearningLoop";
import FeatureCards from "@/components/dashboard/FeatureCards";
import dynamic from "next/dynamic";
const AgentRunner = dynamic(() => import("@/components/AgentRunner"), { ssr: false });
const SignalAgent = dynamic(() => import("@/components/SignalAgent"), { ssr: false });

const Dashboard = () => {
  const router = useRouter();

  const handleNavigate = (index: number) => {
    const routes = ["/dashboard", "/events", "/explain", "/impact", "/video", "/detector", "/whatif", "/learning"];
    router.push(routes[index] || "/dashboard");
  };

  return (
    <div className="gradient-hero min-h-screen">
      <div className="px-6 py-12 relative z-10">
        <div className="max-w-6xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-5"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2" style={{ textWrap: "balance" } as React.CSSProperties}>
              Intelligence Dashboard
            </h1>
            <p className="text-text-secondary text-sm max-w-lg">
              Seven AI layers working together to give you an edge. Click any module to dive in.
            </p>
          </motion.div>

          <div className="mb-4">
            <MarketCards />
          </div>

          <MarketOverview />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
            <div className="lg:col-span-5">
              <StockChart />
            </div>
            <div className="lg:col-span-4">
              <EventHighlights />
            </div>
            <div className="lg:col-span-3">
              <LearningLoop />
            </div>
          </div>

          <FeatureCards onNavigate={handleNavigate} />
        </div>
      </div>

      <footer className="relative z-10 border-t border-border/20 py-12 text-center">
        <p className="text-text-secondary text-xs">© 2026 ET Edge. Event-driven AI intelligence for Indian markets.</p>
      </footer>
      <div className="px-6 pb-8 md:px-10 lg:px-16 max-w-7xl mx-auto mt-8">
        <AgentRunner />
      </div>
      <div className="px-6 pb-16 md:px-10 lg:px-16 max-w-7xl mx-auto mt-6">
        <SignalAgent />
      </div>

    </div>
  );
};

export default Dashboard;
