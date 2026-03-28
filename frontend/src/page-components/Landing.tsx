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
      
      {/* Visual Particle Dissolve Layer — Creating the illusion of the gradient background 'fragmenting' into the black section below */}
      <div 
        className="particle-dissolve-zone relative z-10 w-full h-[300px] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3C!-- Neon Cyan Particles --%3E%3Ccircle cx='20' cy='20' r='1.2' fill='%2300ffcc' opacity='0.9' /%3E%3Ccircle cx='150' cy='45' r='0.8' fill='%2300ffcc' opacity='0.4' /%3E%3Ccircle cx='340' cy='12' r='2' fill='%2300ffcc' opacity='0.8' /%3E%3Ccircle cx='80' cy='110' r='1' fill='%2300ffcc' opacity='0.3' /%3E%3Ccircle cx='260' cy='160' r='1.5' fill='%2300ffcc' opacity='0.6' /%3E%3Ccircle cx='45' cy='280' r='0.5' fill='%2300ffcc' opacity='0.2' /%3E%3Ccircle cx='310' cy='220' r='1.2' fill='%2300ffcc' opacity='0.5' /%3E%3Ccircle cx='190' cy='310' r='2.2' fill='%2300ffcc' opacity='0.7' /%3E%3Ccircle cx='75' cy='350' r='0.9' fill='%2300ffcc' opacity='0.3' /%3E%3Ccircle cx='360' cy='290' r='1.4' fill='%2300ffcc' opacity='0.5' /%3E%3C!-- Electric Violet Particles --%3E%3Ccircle cx='380' cy='60' r='1.5' fill='%237000ff' opacity='0.8' /%3E%3Ccircle cx='210' cy='85' r='1.1' fill='%237000ff' opacity='0.5' /%3E%3Ccircle cx='60' cy='30' r='0.9' fill='%237000ff' opacity='0.3' /%3E%3Ccircle cx='120' cy='210' r='2' fill='%237000ff' opacity='0.7' /%3E%3Ccircle cx='330' cy='320' r='1' fill='%237000ff' opacity='0.4' /%3E%3Ccircle cx='25' cy='180' r='1.8' fill='%237000ff' opacity='0.6' /%3E%3Ccircle cx='170' cy='390' r='0.8' fill='%237000ff' opacity='0.2' /%3E%3Ccircle cx='390' cy='370' r='1.5' fill='%237000ff' opacity='0.5' /%3E%3Ccircle cx='120' cy='340' r='0.7' fill='%237000ff' opacity='0.3' /%3E%3Ccircle cx='280' cy='40' r='1.2' fill='%237000ff' opacity='0.4' /%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
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
