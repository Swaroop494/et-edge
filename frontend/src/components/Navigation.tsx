import { motion } from "framer-motion";

const navItems = [
  { id: "radar", label: "Radar" },
  { id: "chart", label: "Charts" },
  { id: "chat", label: "Chat" },
  { id: "video", label: "Video" },
];

interface NavigationProps {
  activeIndex: number;
  onNavigate: (index: number) => void;
}

const Navigation = ({ activeIndex, onNavigate }: NavigationProps) => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-full px-2 py-2 flex items-center gap-1"
    >
      <div className="flex items-center gap-4 px-4">
        <span className="font-display text-sm font-bold text-gradient-primary tracking-wide">ET Edge</span>
        <div className="w-px h-4 bg-border/40" />
      </div>
      {navItems.map((item, i) => (
        <button
          key={item.id}
          onClick={() => onNavigate(i)}
          className={`relative px-4 py-1.5 rounded-full text-xs font-medium transition-colors duration-300 ${
            activeIndex === i ? "text-foreground" : "text-text-secondary hover:text-foreground"
          }`}
        >
          {activeIndex === i && (
            <motion.div
              layoutId="nav-active"
              className="absolute inset-0 bg-primary/15 rounded-full border border-primary/15"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{item.label}</span>
        </button>
      ))}
    </motion.nav>
  );
};

export default Navigation;
