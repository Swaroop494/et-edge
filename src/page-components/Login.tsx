"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import etEdgeLogo from "@/assets/et-edge-logo.png";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero" />

      {/* Ambient glow */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[200px]"
        style={{ top: "20%", left: "30%", background: "hsl(var(--deep-purple) / 0.3)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div
          className="rounded-3xl p-8 text-center"
          style={{
            background: "hsl(var(--glass-bg) / 0.5)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "1px solid hsl(var(--glass-border) / 0.3)",
            boxShadow: "0 0 80px hsl(var(--accent) / 0.06), 0 24px 48px hsl(var(--background) / 0.5)",
          }}
        >
          <img src={etEdgeLogo.src} alt="ET Edge" className="w-20 h-20 mx-auto mb-4 rounded-full object-cover drop-shadow-[0_0_20px_hsl(var(--neon-cyan)/0.3)]" />
          {/* Brand */}
          <h1 className="font-display text-3xl font-bold mb-1">
            <span
              style={{
                background: "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--teal)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ET
            </span>{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(var(--electric-violet)), hsl(var(--deep-purple)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Edge
            </span>
          </h1>
          <p className="text-muted-foreground text-sm mb-8">AI-powered event intelligence</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow duration-300"
              style={{
                background: "hsl(var(--input))",
                border: "1px solid hsl(var(--border))",
              }}
              required
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-display font-semibold text-sm transition-shadow duration-500"
              style={{
                background: "hsl(var(--accent))",
                color: "hsl(var(--accent-foreground))",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 30px hsl(var(--accent) / 0.35)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
