import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutGrid, Radio, Brain, BarChart3, Video, Shield, GitFork, TrendingUp } from "lucide-react";

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
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed right-3 top-1/2 z-50 hidden -translate-y-1/2 md:flex md:flex-col md:items-center md:gap-1">
      <div
        className="flex flex-col items-center gap-1 rounded-2xl px-2 py-3"
        style={{
          background: "hsl(var(--glass-bg) / 0.4)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid hsl(var(--glass-border) / 0.15)",
        }}
      >
        {moduleConfig.map((config) => {
          const Icon = config.icon;
          const isActive = location.pathname === config.path;

          return (
            <motion.button
              key={config.path}
              onClick={() => navigate(config.path)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 group ${
                isActive
                  ? "text-accent"
                  : "text-muted-foreground/50 hover:text-muted-foreground"
              }`}
              style={
                isActive
                  ? {
                      background: "hsl(var(--accent) / 0.12)",
                      boxShadow: "0 0 20px hsl(var(--accent) / 0.15)",
                    }
                  : undefined
              }
              aria-label={`Go to ${config.label}`}
            >
              {/* Active glow ring */}
              {isActive && (
                <motion.span
                  layoutId="nav-active-ring"
                  className="absolute inset-0 rounded-xl"
                  style={{ border: "1px solid hsl(var(--accent) / 0.3)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <Icon
                className={`w-5 h-5 transition-all duration-300 ${
                  isActive
                    ? "drop-shadow-[0_0_6px_hsl(var(--accent)/0.5)]"
                    : "group-hover:drop-shadow-[0_0_4px_hsl(var(--accent)/0.3)]"
                }`}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span
                className={`text-[9px] font-medium mt-1 transition-opacity duration-300 ${
                  isActive ? "opacity-100" : "opacity-50 group-hover:opacity-80"
                }`}
              >
                {config.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default DashboardNav;
