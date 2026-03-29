"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Conversation } from "@/components/cvi/components/conversation";
import { CVIProvider } from "@/components/cvi/components/cvi-provider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Mic, 
  MicOff, 
  PhoneOff, 
  Activity, 
  Brain, 
  ShieldCheck, 
  Cpu,
  BarChart3,
  Waves,
  RefreshCw,
  Heart
} from 'lucide-react';
import { cn } from "@/lib/utils";

const TavusAgent = () => {
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [gazeAttention, setGazeAttention] = useState(0.97);
  const [latency, setLatency] = useState(480);
  const [emotion, setEmotion] = useState<'Analytical' | 'Responsive'>('Analytical');
  const [isLoading, setIsLoading] = useState(false);

  // Perception Stats (Neural Processing) Mock
  useEffect(() => {
    const interval = setInterval(() => {
      // Gaze Attention: flickers slightly between 0.95 and 0.99
      setGazeAttention(0.95 + Math.random() * 0.04);
      // Latency: real-time counter showing '450ms - 620ms'
      setLatency(450 + Math.floor(Math.random() * 170));
      // Emotion Map: toggles between 'Analytical' and 'Responsive'
      if (Math.random() > 0.95) {
        setEmotion(prev => prev === 'Analytical' ? 'Responsive' : 'Analytical');
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleStartConversation = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tavus', {
        method: 'POST',
      });

      const data = await response.json();
      if (data.conversation_url) {
        setConversationUrl(data.conversation_url);
        setIsCalling(true);
      } else {
        console.error("No conversation URL in response", data);
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleEndConversation = () => {
    setConversationUrl(null);
    setIsCalling(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-mono selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Video Container */}
        <div className="lg:col-span-2 relative group">
          <div className="absolute -inset-1 bg-emerald-500/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative bg-[#020617] backdrop-blur-3xl border border-emerald-500/20 rounded-2xl overflow-hidden aspect-video flex flex-col shadow-2xl">
            {/* Top Bar */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                </div>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", isCalling ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-slate-600")} />
                  <span className="text-[10px] uppercase tracking-widest text-emerald-400/80 font-bold">Replica: CVI-QUANTUM-7</span>
                </div>
              </div>
              <div className="text-[9px] text-slate-500 uppercase tracking-widest flex items-center gap-4">
                <span>SECURED_CHANNEL_TX: ENABLED</span>
                <span className="text-emerald-500/50">ENC: AES-256</span>
              </div>
            </div>

            {/* Main Video/Call Area */}
            <div className="flex-1 relative bg-[#010409] flex items-center justify-center overflow-hidden">
               {/* Cyberpunk grid overlay */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_90%)] pointer-events-none" />
               
              {conversationUrl ? (
                <CVIProvider>
                  <Conversation 
                    conversationUrl={conversationUrl}
                    onLeave={handleEndConversation}
                  />
                </CVIProvider>
              ) : (
                <div className="flex flex-col items-center gap-6 z-10">
                  <div className="relative">
                    <Cpu className="w-16 h-16 text-emerald-500/20 animate-pulse" />
                    <div className="absolute inset-0 bg-emerald-400/5 blur-2xl" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-emerald-400 font-bold text-lg tracking-widest">INITIALIZE TAVUS LINK</h3>
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider">Establishing encrypted conversational tunnel...</p>
                  </div>
                  <Button 
                    onClick={handleStartConversation}
                    disabled={isLoading}
                    className="group relative bg-[#10b981] hover:bg-emerald-400 text-slate-950 font-black px-10 py-7 rounded-sm border-b-4 border-emerald-700 transition-all active:top-[2px] active:border-b-0 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                  >
                    {isLoading ? (
                       <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        <Activity className="w-4 h-4" /> BIND NEURAL LINK
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Bottom Controls Panel (Optional extra if the implementation in Conversation isn't enough/customizable) */}
            {isCalling && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl z-50 transition-opacity opacity-0 group-hover:opacity-100">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-full border transition-all hover:scale-110",
                    isMuted ? "border-red-500/50 bg-red-500/10 text-red-500" : "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  )}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <div className="h-6 w-px bg-white/10" />
                <button 
                  onClick={handleEndConversation}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-red-500/50 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all hover:scale-110 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                >
                  <PhoneOff className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: System Monitor (Neural Processing) */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#0f172a]/60 backdrop-blur-2xl border border-white/5 rounded-xl p-8 flex flex-col gap-8 shadow-2xl relative overflow-hidden group">
            {/* Scanline effect */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(16,185,129,0.02)_50%)] bg-[size:100%_4px] pointer-events-none" />
            
            <div className="relative space-y-2 border-b border-white/10 pb-6">
              <h2 className="text-xs font-black tracking-[0.2em] flex items-center gap-3 text-emerald-400">
                <Brain className="w-5 h-5 text-emerald-500" /> SYSTEM MONITOR
              </h2>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest pl-8">Perception Feedback Loop v4.2.0</p>
            </div>

            <div className="space-y-8 relative">
              {/* Gaze Attention */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Gaze Attention</span>
                  <span className={cn(
                    "text-xs font-mono font-bold transition-colors duration-100",
                    gazeAttention > 0.97 ? "text-emerald-400" : "text-emerald-500/70"
                  )}>
                    {(gazeAttention * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 overflow-hidden relative border border-white/5">
                   <div 
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300 relative shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    style={{ width: `${gazeAttention * 100}%` }}
                   >
                     <div className="absolute top-0 right-0 w-4 h-full bg-white/20 animate-pulse" />
                   </div>
                </div>
              </div>

              {/* Latency */}
              <div className="flex justify-between items-center py-4 border-y border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Neural Latency</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-emerald-400 tabular-nums">{latency}ms</div>
                  <div className="text-[8px] text-emerald-500/40 uppercase tracking-tighter">Roundtrip TTL</div>
                </div>
              </div>

              {/* Memory Retrieval */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                   <BarChart3 className="w-4 h-4 text-emerald-500" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Retrieval Logs</span>
                </div>
                <div className="space-y-2.5">
                  {['NSE Filing - Q3 2024', 'Reuters Market Live', 'Internal Wealth Oracle'].map((source, i) => (
                    <div key={i} className="group/item flex items-center justify-between p-3 bg-slate-900/50 border border-white/5 hover:border-emerald-500/30 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-sm shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                         <span className="text-[10px] font-bold text-slate-300">{source}</span>
                      </div>
                      <ShieldCheck className="w-3 h-3 text-emerald-500 opacity-40 group-hover/item:opacity-100" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Emotion Map */}
              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <Heart className="w-4 h-4 text-emerald-500" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Affective Map</span>
                </div>
                <Badge className={cn(
                  "rounded-none border transition-all duration-300 px-3 py-1 font-black text-[9px] tracking-widest uppercase",
                  emotion === 'Analytical' 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]" 
                    : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                )}>
                  {emotion} MODE
                </Badge>
              </div>
            </div>
          </div>

          {/* System Health / Bloomberg Ticker Style */}
          <div className="bg-[#020617]/80 backdrop-blur-md border border-white/5 rounded-xl p-5 overflow-hidden">
             <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] font-bold text-slate-500 tracking-[0.3em] uppercase">Market Context Feed</span>
                <div className="flex gap-1">
                   <div className="w-1 h-1 bg-emerald-500/50" />
                   <div className="w-1 h-1 bg-emerald-500" />
                   <div className="w-1 h-1 bg-emerald-500/50" />
                </div>
             </div>
             <div className="space-y-3 font-mono">
                {[
                  { label: "VOICE_RECOG", val: "SYNCHRONIZED", color: "text-emerald-500" },
                  { label: "EMOTION_ENG", val: "OPERATIONAL", color: "text-emerald-500" },
                  { label: "TRUTH_SCORE", val: "0.9942", color: "text-cyan-400" }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2 last:border-0 last:pb-0">
                    <span className="text-[#64748b] font-bold">{item.label}</span>
                    <span className={cn("font-black tracking-widest", item.color)}>{item.val}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TavusAgent;
