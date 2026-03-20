import CursorGlow from "@/components/CursorGlow";
import RocketHero from "@/components/landing/RocketHero";
import FeatureStrip from "@/components/landing/FeatureStrip";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background min-h-screen noise-overlay ambient-light relative overflow-x-hidden">
      <CursorGlow />
      <RocketHero />
      <FeatureStrip />

      {/* CTA strip */}
      <section className="relative z-10 py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2
            className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            Intelligence that moves with the market
          </h2>
          <p className="text-text-secondary mb-8">
            From detection to decision — every layer works together.
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl glass border border-accent/25 text-accent font-display font-semibold text-sm transition-shadow duration-500 hover:shadow-[0_0_30px_hsl(var(--accent)/0.2)]"
          >
            Login
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </section>

      <footer className="relative z-10 border-t border-border/20 py-12 text-center">
        <p className="text-text-secondary text-xs">© 2026 ET Edge. Event-driven AI intelligence for Indian markets.</p>
      </footer>
    </div>
  );
};

export default Landing;
