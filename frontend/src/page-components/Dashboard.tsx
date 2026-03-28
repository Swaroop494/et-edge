"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import MarketOverview from "@/components/dashboard/MarketOverview";
import MarketCards from "@/components/dashboard/MarketCards";
import StockChart from "@/components/dashboard/StockChart";
import EventHighlights from "@/components/dashboard/EventHighlights";
import LearningProgress from "@/components/dashboard/LearningProgress";
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
    <div className="gradient-hero min-h-screen bg-fixed max-w-[100vw] overflow-x-hidden">
      <div className="px-4 md:px-6 py-8 md:py-12 relative z-10 w-full">
        <div className="max-w-6xl mx-auto w-full pb-32">
          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            className="mb-8"
          >
            <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 truncate" style={{ textWrap: "balance" } as React.CSSProperties}>
              Intelligence Dashboard
            </h1>
            <p className="text-text-secondary text-sm md:text-base max-w-prose leading-relaxed">
              Seven AI layers working together to give you an edge. Click any module to dive in.
            </p>
          </motion.div>

          <div className="mb-6 w-full overflow-x-hidden">
            <MarketCards />
          </div>

          <div className="mb-6 w-full">
            <MarketOverview />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
            <div className="w-full lg:col-span-5 overflow-hidden">
              <StockChart />
            </div>
            <div className="w-full lg:col-span-4">
              <EventHighlights />
            </div>
            <div className="w-full lg:col-span-3">
              <LearningProgress />
            </div>
          </div>

          <div className="w-full overflow-x-auto pb-4 no-scrollbar">
            <FeatureCards onNavigate={handleNavigate} />
          </div>
        </div>
      </div>

      <footer className="relative z-10 border-t border-border/20 py-8 text-center px-4 mb-20 md:mb-0">
        <p className="text-text-secondary text-[10px] md:text-xs">© 2026 ET Edge. Event-driven AI intelligence for Indian markets.</p>
      </footer>
      
      <div className="px-4 pb-12 w-full max-w-7xl mx-auto overflow-x-auto no-scrollbar">
        <AgentRunner />
      </div>
      <div className="px-4 pb-28 w-full max-w-7xl mx-auto overflow-x-auto no-scrollbar">
        <SignalAgent />
      </div>

    </div>
  );
};

export default Dashboard;
