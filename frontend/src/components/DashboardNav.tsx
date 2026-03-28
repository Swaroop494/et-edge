"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutGrid, Radio, Brain, BarChart3, Video, Shield, GitFork, TrendingUp, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { toast } from "@/components/ui/sonner";
const moduleConfig = [
  { icon: LayoutGrid, label: "Dashboard", path: "/dashboard" },
  { icon: Radio, label: "Events", path: "/events" },
  { icon: Brain, label: "Explain", path: "/explain" },
  { icon: BarChart3, label: "Impact", path: "/impact" },
  { icon: Video, label: "Video", path: "/video" },
  { icon: Shield, label: "Detector", path: "/detector" },
  { icon: GitFork, label: "What-if", path: "/whatif" },
  { icon: TrendingUp, label: "Learning", path: "/learning" },
];

const DashboardNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  return (
    <>
      {/* Desktop Vertical Sidebar (lg+) */}
      <nav className="fixed right-6 top-1/2 z-50 hidden -translate-y-1/2 lg:flex lg:flex-col lg:items-center lg:gap-1">
        <div
          className="flex flex-col items-center gap-1 rounded-3xl px-3 py-4 glass-strong border border-white/5"
          style={{
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
          }}
        >
          {moduleConfig.map((config) => {
            const Icon = config.icon;
            const isActive = pathname === config.path;

            return (
              <motion.button
                key={config.path}
                onClick={() => router.push(config.path)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 group ${
                  isActive
                    ? "text-accent"
                    : "text-white/40 hover:text-white"
                }`}
                style={
                  isActive
                    ? {
                        background: "hsl(var(--accent) / 0.15)",
                        boxShadow: "0 0 20px hsl(var(--accent) / 0.2)",
                      }
                    : undefined
                }
                aria-label={`Go to ${config.label}`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active-ring"
                    className="absolute inset-0 rounded-2xl border border-accent/40"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <Icon
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive
                      ? "drop-shadow-[0_0_8px_hsl(var(--accent)/0.6)]"
                      : "group-hover:drop-shadow-[0_0_4px_hsl(var(--accent)/0.3)]"
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <span
                  className={`text-[9px] font-bold mt-1 uppercase tracking-widest transition-opacity duration-300 ${
                    isActive ? "opacity-100" : "opacity-40 group-hover:opacity-100"
                  }`}
                >
                  {config.label}
                </span>
              </motion.button>
            );
          })}
          
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-col items-center gap-4">
            <button
              onClick={async () => {
                if (isLoggingOut) return;
                setIsLoggingOut(true);
                try {
                  await signOut(auth);
                  toast.success("Logged out successfully");
                  router.push("/");
                } catch (e) {
                  toast.error("Logout failed");
                } finally {
                  setIsLoggingOut(false);
                }
              }}
              className="p-3 text-white/30 hover:text-red-500 transition-colors"
            >
              {isLoggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation (lg-) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-auto pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-black/40 backdrop-blur-3xl border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-around px-2 py-3 overflow-x-auto no-scrollbar">
          {moduleConfig.slice(0, 5).map((config) => {
            const Icon = config.icon;
            const isActive = pathname === config.path;

            return (
              <button
                key={config.path}
                onClick={() => router.push(config.path)}
                className={`relative flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-300 ${
                  isActive ? "text-accent bg-accent/10" : "text-white/40"
                }`}
              >
                <Icon size={20} className={isActive ? "drop-shadow-[0_0_8px_hsl(var(--accent)/0.5)]" : ""} />
                <span className={`text-[8px] mt-1 font-bold uppercase tracking-tighter ${isActive ? "opacity-100" : "opacity-40"}`}>
                  {config.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default DashboardNav;
