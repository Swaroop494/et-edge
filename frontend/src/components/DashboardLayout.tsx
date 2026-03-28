"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Sparkles, X, Minimize2, Maximize2, Bot } from "lucide-react";
import Image from "next/image";
import CursorGlow from "@/components/CursorGlow";
import DashboardNav from "@/components/DashboardNav";
import etEdgeLogo from "@/assets/et-edge-logo.png";
import { createPortal } from "react-dom";
import MarketChat from "@/components/MarketChat";
import { Button } from "@/components/ui/button";
import { useAI } from "@/context/AIContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isChatOpen, setIsChatOpen, initialMessage } = useAI();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use overflow-hidden on body when chat is open or fullscreen to prevent background shifts
  useEffect(() => {
    if (isChatOpen && isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isChatOpen, isFullscreen]);

  // Preserve chat state across navigation (handled by being in Layout)
  // Close chat on specific pages if needed, but the prompt says 
  // "Ensure the chat state is preserved even if the user navigates"
  
  return (
    <div className="bg-background min-h-screen noise-overlay ambient-light relative overflow-x-hidden bg-fixed">
      <CursorGlow />

      {/* Top bar */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 py-4 glass-strong"
      >
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-300"
        >
          <Image src={etEdgeLogo} alt="ET Edge" width={32} height={32} className="rounded-full object-cover drop-shadow-[0_0_8px_hsl(var(--neon-cyan)/0.3)]" priority />
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

      <div className="pt-20 lg:pt-24 min-h-screen overflow-y-auto overflow-x-hidden custom-scrollbar px-4 md:px-8 lg:px-12 lg:pr-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="pb-32 md:pb-36 lg:pb-12"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Global FAB (Floating Action Button) */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-24 md:bottom-8 right-6 md:right-8 z-40 scale-90 md:scale-100"
          >
            <button
              onClick={() => setIsChatOpen(true)}
              className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white shadow-[0_0_40px_rgba(24,255,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-20 group-hover:opacity-40" />
              <Sparkles className="h-7 w-7 relative z-10" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global AI Command Center (States & Portal managed internally) */}
      <MarketChat />
    </div>
  );
};

export default DashboardLayout;
