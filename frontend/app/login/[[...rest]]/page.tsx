"use client";

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative">
      <div className="absolute inset-0 gradient-hero ambient-shift" />
      <div className="absolute inset-0 vignette-soft pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="text-center space-y-2">
          <h1 className="font-display text-4xl text-foreground">
            <span style={{ background: "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--teal)))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>ET</span>
            {" "}
            <span style={{ background: "linear-gradient(135deg, hsl(var(--electric-violet)), hsl(var(--deep-purple)))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Edge</span>
          </h1>
          <p className="text-text-secondary text-sm">Event-driven AI intelligence for Indian markets.</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-secondary/40 backdrop-blur-xl border border-border/30 rounded-[2rem] shadow-2xl",
              headerTitle: "text-foreground font-display",
              headerSubtitle: "text-text-secondary",
              formButtonPrimary: "bg-primary hover:bg-primary/90 rounded-2xl h-11 text-sm font-medium",
              formFieldInput: "bg-secondary/50 border-border/30 rounded-xl text-foreground placeholder:text-text-secondary/60 focus:ring-primary/40",
              formFieldLabel: "text-text-secondary text-xs uppercase tracking-widest",
              footerActionLink: "text-primary hover:text-primary/80",
              identityPreviewText: "text-foreground",
              identityPreviewEditButton: "text-primary",
              dividerLine: "bg-border/30",
              dividerText: "text-text-secondary",
              socialButtonsBlockButton: "bg-secondary/40 border-border/30 hover:bg-secondary/60 rounded-xl text-foreground",
              socialButtonsBlockButtonText: "text-foreground",
              alertText: "text-foreground",
              formResendCodeLink: "text-primary",
            },
          }}
        />
      </div>
    </div>
  );
}
