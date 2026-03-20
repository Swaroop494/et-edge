import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ArrowLeft } from "lucide-react";
import CursorGlow from "@/components/CursorGlow";
import DashboardNav from "@/components/DashboardNav";
import etEdgeLogo from "@/assets/et-edge-logo.png";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="bg-background min-h-screen noise-overlay ambient-light relative">
      <CursorGlow />

      {/* Top bar */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass-strong"
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-300"
        >
          <img src={etEdgeLogo} alt="ET Edge" className="w-8 h-8 rounded-full object-cover drop-shadow-[0_0_8px_hsl(var(--neon-cyan)/0.3)]" />
          <span className="font-display text-sm font-bold tracking-wide">
            <span style={{ background: "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--teal)))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>ET</span>
            {" "}
            <span style={{ background: "linear-gradient(135deg, hsl(var(--electric-violet)), hsl(var(--deep-purple)))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Edge</span>
          </span>
        </button>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-accent">
            <Activity className="w-3 h-3" />
            <span className="hidden sm:inline">System Active</span>
          </span>
        </div>
      </motion.header>

      <DashboardNav />

      <div className="pt-16 min-h-screen overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DashboardLayout;
