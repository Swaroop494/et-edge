"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Send, Bot, User, Loader2, ShieldCheck, ExternalLink, Info, History, TrendingUp, Brain, X, Maximize2, Minimize2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { runMarketGPT } from "@/utils/api.js";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAI } from "@/context/AIContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  impact?: "Low" | "Medium" | "High";
  citations?: string[];
  reasoningTrace?: any[];
  timestamp: Date;
}

const impactStyles = {
  Low: "border-success/20 bg-success/10 text-success",
  Medium: "border-warning/20 bg-warning/10 text-warning",
  High: "border-critical/20 bg-critical/10 text-critical",
};

const MarketChat = () => {
  const { user } = useAuth();
  const { isChatOpen, setIsChatOpen, initialMessage } = useAI();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userHoldings, setUserHoldings] = useState<string[]>([]);
  const [activeLessons, setActiveLessons] = useState(0);
  const [recentSignals, setRecentSignals] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    setIsMounted(true);
    const fetchRefinements = async () => {
      try {
        const q = query(collection(db, "system_knowledge"));
        const snapshot = await getDocs(q);
        setActiveLessons(snapshot.size);
      } catch (err) { console.error(err); }
    };
    const fetchLatestSignals = async () => {
      try {
        const stored = localStorage.getItem("et_edge_radar_signals");
        if (stored) setRecentSignals(JSON.parse(stored).slice(0, 3));
      } catch (e) { console.error(e); }
    };
    fetchRefinements();
    fetchLatestSignals();
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isChatOpen]);

  useEffect(() => {
    if (isChatOpen && initialMessage && !initialTriggerRef.current) {
      initialTriggerRef.current = true;
      handleSendMessage(initialMessage);
    }
  }, [isChatOpen, initialMessage]);

  useEffect(() => {
    const fetchHoldings = async () => {
      if (!user) {
        const local = localStorage.getItem("et_edge_user_holdings");
        if (local) setUserHoldings(local.split(",").map(s => s.trim()));
        return;
      }
      try {
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) setUserHoldings(snapshot.docs[0].data().holdings || []);
      } catch (err) { console.error(err); }
    };
    fetchHoldings();
  }, [user]);

  const handleSendMessage = async (text?: string) => {
    const messageContent = text || input;
    if (!messageContent.trim() || isTyping) return;

    const userMsg: Message = { role: "user", content: messageContent, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    if (!text) setInput("");
    setIsTyping(true);

    try {
      const result = await runMarketGPT(messageContent, userHoldings);
      const assistantMsg: Message = {
        role: "assistant",
        content: result?.answer || "I apologize, but I encountered an error. Please try again.",
        impact: result?.impact,
        citations: result?.citations,
        reasoningTrace: result?.reasoningTrace,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) { console.error("Chat error:", err); } finally { setIsTyping(false); }
  };

  const initialTriggerRef = useRef(false);

  if (!isMounted || !isChatOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-none flex items-end justify-center sm:items-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsChatOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xl pointer-events-auto"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 100 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          width: isFullscreen ? "100%" : "min(1280px, 100vw)",
          height: isFullscreen ? "100dvh" : "min(850px, 90dvh)",
          right: isFullscreen ? "0" : (window.innerWidth > 640 ? "2rem" : "0"),
          bottom: isFullscreen ? "0" : (window.innerWidth > 640 ? "2rem" : "0"),
        }}
        exit={{ opacity: 0, scale: 0.9, y: 100 }}
        style={{ contain: "layout" }}
        className={`fixed z-10 flex flex-col bg-[#020617] ring-1 ring-white/10 shadow-3xl overflow-hidden pointer-events-auto w-full sm:w-auto h-full sm:h-auto ${isFullscreen ? "rounded-none" : "rounded-t-[2.5rem] sm:rounded-[2.5rem]"}`}
      >
        <AnimatePresence>
          {activeLessons > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-24 right-4 lg:right-10 z-[100] flex items-center gap-2 group cursor-help bg-accent/20 border border-accent/30 px-4 py-2 rounded-2xl backdrop-blur-md shadow-lg shadow-accent/5"
            >
              <Brain size={16} className="text-accent animate-pulse" />
              <div className="text-[10px] text-accent font-black uppercase tracking-[0.2em]">{activeLessons} Refinements Active</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Navigation */}
        <div className="flex items-center justify-between px-6 py-5 lg:px-10 lg:py-8 border-b border-white/5 bg-white/5 shrink-0 pt-[env(safe-area-inset-top,1.25rem)] lg:pt-8">
          <div className="flex items-center gap-5">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
              <Bot className="text-accent" size={20} />
            </div>
            <div>
              <h3 className="font-display text-[clamp(1.1rem,4vw,1.4rem)] text-white font-black tracking-tight leading-tight">ET Edge Command</h3>
              <div className="flex items-center gap-3 mt-1.5 opacity-60">
                 <Badge variant="outline" className="rounded-full px-2 py-0 border-white/10 text-[8px] uppercase tracking-widest font-bold">V4.0 - Recursive Memory</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)} className="w-10 h-10 lg:w-12 lg:h-12 text-white/40 hover:text-white hover:bg-white/10 rounded-2xl transition-all">
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)} className="w-10 h-10 lg:w-12 lg:h-12 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all">
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Messaging Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-10 scrollbar-thin no-scrollbar relative flex flex-col min-h-0">
          {messages.length === 0 ? (
            <div className="my-auto flex flex-col items-center justify-center text-center space-y-8 lg:space-y-10">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full" />
                <Bot size={48} className="text-accent lg:text-accent relative z-10 lg:w-16 lg:h-16" />
              </div>
              
              <div className="max-w-md space-y-4">
                <h4 className="font-display text-[clamp(1.5rem,6vw,2.25rem)] text-white font-heavy tracking-tighter">Neural Core</h4>
                <p className="text-xs lg:text-sm text-white/60 leading-relaxed font-medium">
                  Autonomous financial agent. Ask about risk clusters or technical breakouts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 w-full max-w-2xl px-4 lg:px-0">
                {[
                  { icon: "🔍", text: "Analyze HDFC's RSI breakout" },
                  { icon: "📊", text: "Impact of recent bulk deals?" },
                  { icon: "🛡️", text: "My portfolio risk today?" },
                  { icon: "📈", text: "Balanced view on IT sector" }
                ].map(q => (
                  <button 
                    key={q.text}
                    onClick={() => handleSendMessage(q.text)}
                    className="group relative flex items-center gap-4 p-4 lg:p-5 text-left rounded-2xl lg:rounded-3xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300"
                  >
                    <span className="text-xl lg:text-2xl">{q.icon}</span>
                    <span className="text-[10px] lg:text-xs text-white/70 group-hover:text-white font-bold transition-colors">{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 lg:space-y-10">
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-4 lg:gap-6 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl shrink-0 flex items-center justify-center ${msg.role === "assistant" ? "bg-accent/10 text-accent border border-accent/20" : "bg-white/10"}`}>
                    {msg.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div className={`max-w-[85%] lg:max-w-[75%] space-y-4 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    <div className={`p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] border shadow-xl ${msg.role === "user" ? "bg-accent text-white border-transparent" : "bg-white/5 border-white/10 text-white/90"}`}>
                      <p className="text-xs lg:text-base leading-[1.6] lg:leading-[1.8] font-medium whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex gap-4 lg:gap-6">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20"><Loader2 size={16} className="text-accent animate-spin" /></div>
                  <div className="bg-white/5 border border-white/10 p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] min-w-[200px] lg:min-w-[240px]">
                     <span className="text-[9px] lg:text-[10px] uppercase tracking-[0.3em] text-accent font-black animate-pulse">Reasoning trace...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4 w-full shrink-0" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 lg:p-10 border-t border-white/5 bg-black/40 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom,1.25rem))]">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative flex items-center gap-3 lg:gap-4">
            <Input value={input} onChange={(e) => setInput(e.target.value)} disabled={isTyping} placeholder="Ask neural core..." className="h-14 lg:h-20 rounded-2xl lg:rounded-3xl pl-12 lg:pl-16 pr-24 lg:pr-32 border-white/10 bg-white/5 focus-visible:ring-accent/30 text-sm lg:text-lg font-medium" />
            <div className="absolute left-4 lg:left-6 text-white/20"><Bot size={20} className="lg:w-7 lg:h-7" /></div>
            <div className="absolute right-2 lg:right-4">
              <Button type="submit" disabled={!input.trim() || isTyping} className="h-10 lg:h-14 rounded-xl lg:rounded-2xl px-6 lg:px-8 bg-accent text-white font-heavy">
                {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="lg:w-6 lg:h-6" />}
              </Button>
            </div>
          </form>
          
          <div className="mt-4 lg:mt-8 flex flex-wrap items-center justify-center gap-x-8 lg:gap-x-12 gap-y-3 lg:gap-y-4 text-[8px] lg:text-[10px] text-white/30 uppercase tracking-[0.2em] lg:tracking-[0.3em] font-black">
             <span className="flex items-center gap-2 lg:gap-3"><div className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-success animate-pulse" /> Verified Sources</span>
             <span className="flex items-center gap-2 lg:gap-3"><div className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-accent animate-pulse" /> Recursive loop</span>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default MarketChat;
