"use client";

import CursorGlow from "@/components/CursorGlow";
import RocketHero from "@/components/landing/RocketHero";
import FeatureStrip from "@/components/landing/FeatureStrip";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const Landing = () => {
  const router = useRouter();

  return (
    <div className="bg-background min-h-screen noise-overlay ambient-light relative overflow-x-hidden">
      <CursorGlow />
      <RocketHero />
      
      {/* Particle Dissolve Transition Layer */}
      <div 
        className="particle-dissolve-zone relative z-10 w-full h-[250px] -mt-[125px] overflow-hidden pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1' fill='%2300ffcc' opacity='0.6' /%3E%3Ccircle cx='30' cy='40' r='1.5' fill='%237000ff' opacity='0.4' /%3E%3Ccircle cx='50' cy='15' r='1' fill='%2300ffcc' opacity='0.3' /%3E%3Ccircle cx='70' cy='60' r='2' fill='%237000ff' opacity='0.5' /%3E%3Ccircle cx='85' cy='25' r='1' fill='%2300ffcc' opacity='0.4' /%3E%3Ccircle cx='15' cy='80' r='1.5' fill='%237000ff' opacity='0.3' /%3E%3Ccircle cx='45' cy='90' r='1' fill='%2300ffcc' opacity='0.2' /%3E%3Ccircle cx='95' cy='75' r='1.5' fill='%237000ff' opacity='0.4' /%3E%3C/svg%3E")`,
          backgroundSize: "120px 120px",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
        }}
      />

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
            onClick={() => router.push("/login")}
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
