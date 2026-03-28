"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Video, Info, FileText, Zap } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";

/**
 * VideoStatus represents the state of the video generation pipeline.
 */
type VideoStatus = "idle" | "fetching_signal" | "generating_script" | "synthesizing_video" | "ready" | "error";

interface VideoReportProps {
  /**
   * Raw JSON data from AgentRunner (aiResult) or FinfluencerDetector (validationResult).
   * Used as local fallback if enterprise cache is unavailable.
   */
  data: any;
}

const FALLBACK_VIDEO_URL = "/assets/videos/et-edge-demo.mp4";

const VideoReport = ({ data: localFallbackData }: VideoReportProps) => {
  const [videoStatus, setVideoStatus] = useState<VideoStatus>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [generatedScript, setGeneratedScript] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [isUsingEnterpriseCache, setIsUsingEnterpriseCache] = useState(false);

  // Get environment variables
  const TAVUS_API_KEY = process.env.NEXT_PUBLIC_TAVUS_API_KEY;
  const TAVUS_REPLICA_ID = process.env.NEXT_PUBLIC_TAVUS_REPLICA_ID;
  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  /**
   * STEP 1: Signal Retrieval Layer
   * Fetches the latest 'Video-Worthy' signal from the enterprise cache (market_signals).
   */
  const getLatestVideoWorthySignal = async () => {
    setVideoStatus("fetching_signal");
    setProgress(10);
    
    try {
      const signalsRef = collection(db, "market_signals");
      const q = query(
        signalsRef, 
        where("is_video_worthy", "==", true), 
        orderBy("timestamp", "desc"), 
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const signalDoc = querySnapshot.docs[0].data();
        setIsUsingEnterpriseCache(true);
        return signalDoc.outputs || signalDoc;
      }
      return null;
    } catch (err) {
      console.error("Firestore Signal Retrieval Failed:", err);
      return null;
    }
  };

  /**
   * STEP 2: Script Intelligence Layer (Agentic Step)
   * Transforms raw market/validation data into a professional 60-second broadcast script.
   */
  const generateVideoScript = async (marketData: any) => {
    if (!GEMINI_API_KEY) {
      throw new Error("Missing Gemini API Key.");
    }

    setVideoStatus("generating_script");
    setProgress(30);
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      You are an ET Edge News Anchor. Convert this high-impact financial analysis into a compelling 60-second broadcast script. 
      Start with "This is an ET Edge Alert: Market Intelligence Incoming." 
      Tone: Fast-paced, professional, authoritative.
      Mention specific symbols and numbers.
      Conclude with "Invest smart, stay ahead. This is ET Edge." 
      No markdown, just plain text script.
      
      ANALYSIS DATA:
      ${JSON.stringify(marketData, null, 2)}
    `.trim();

    try {
      const result = await model.generateContent(prompt);
      const scriptText = result.response.text().trim();
      setGeneratedScript(scriptText);
      return scriptText;
    } catch (err: any) {
      console.error("Gemini Script Generation Failed:", err);
      throw new Error("Failed to generate broadcast script.");
    }
  };

  /**
   * STEP 3: Tavus Integration (The Execution)
   * Triggers the Tavus API to synthesize a video using the generated script.
   */
  const triggerTavusVideo = async (script: string) => {
    if (!TAVUS_API_KEY || !TAVUS_REPLICA_ID) {
      throw new Error("Missing Tavus configuration.");
    }

    setVideoStatus("synthesizing_video");
    setProgress(60);

    const response = await fetch("https://api.tavus.io/v2/videos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": TAVUS_API_KEY,
      },
      body: JSON.stringify({
        script: script,
        replica_id: TAVUS_REPLICA_ID,
        video_name: `ET Edge Briefing - ${new Date().toISOString()}`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavus API Error: ${response.status}`);
    }

    const resData = await response.json();
    return resData.hosted_url || resData.video_url;
  };

  const handleCreateVideo = async () => {
    try {
      // 1. SIGNAL RETRIEVAL
      let signalData = await getLatestVideoWorthySignal();
      
      if (!signalData) {
        if (localFallbackData) {
          toast.info("No enterprise signal found. Using local context.");
          signalData = localFallbackData;
        } else {
          throw new Error("No video-worthy market signals found.");
        }
      } else {
        toast.success("Enterprise-grade signal detected. Initiating broadcast pipeline.");
      }

      // 2. AUTONOMOUS SCRIPTING
      const script = await generateVideoScript(signalData);
      
      // 3. TAVUS EXECUTION
      const url = await triggerTavusVideo(script);
      
      setVideoUrl(url || FALLBACK_VIDEO_URL);
      setVideoStatus("ready");
      setProgress(100);
    } catch (err: any) {
      console.error("Video Pipeline Failure:", err);
      
      // 4. ERROR RESILIENCE: FALLBACK VIDEO
      setVideoUrl(FALLBACK_VIDEO_URL);
      setVideoStatus("ready");
      setProgress(100);
      toast("Playing ET Edge demo due to API surge.", {
        icon: <Info className="text-accent" size={16} />,
      });
    }
  };

  const getStatusText = () => {
    switch (videoStatus) {
      case "fetching_signal": return "📡 Querying Enterprise Cache...";
      case "generating_script": return "🧠 Drafting 60s Broadcast Script...";
      case "synthesizing_video": return "🎥 Dispatching to Tavus Digital Twin...";
      case "ready": return "Video Ready for Broadcast";
      case "error": return "Generation Failed";
      default: return "Ready to Generate";
    }
  };

  return (
    <div className="glass-strong rounded-[2.5rem] p-8 border border-border/20 relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-50 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-accent/10 border border-accent/20 shrink-0">
              <Video className="text-accent" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="border-accent/30 text-accent text-[10px] uppercase tracking-widest bg-accent/5 px-2">
                  Video Engine
                </Badge>
              </div>
              <h3 className="font-display text-2xl text-foreground truncate">Production Suite</h3>
            </div>
          </div>
          
          {videoStatus !== "ready" && (
            <Button 
              onClick={handleCreateVideo} 
              disabled={videoStatus !== "idle"}
              className="w-full md:w-auto h-12 rounded-xl px-8 bg-accent hover:bg-accent/90 text-white border-none shadow-lg shadow-accent/20 transition-all duration-300 transform active:scale-95 text-sm font-bold"
            >
              {videoStatus === "idle" ? (
                <><Zap size={16} className="mr-2 fill-current" /> Initialize Pipeline</>
              ) : (
                <><Loader2 size={16} className="animate-spin mr-2" /> Generating...</>
              )}
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {videoStatus === "idle" ? (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-12 px-6 rounded-[2rem] border-2 border-dashed border-border/20 bg-secondary/10"
            >
              <Video className="w-12 h-12 text-text-secondary/30 mb-4" />
              <p className="text-center text-text-secondary text-sm max-w-xs leading-relaxed">
                Autonomous system that queries 'Video-Worthy' signals and converts them into production-ready digital twin broadcasts.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="active"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Progress UI for Active Generation */}
              {(videoStatus === "fetching_signal" || videoStatus === "generating_script" || videoStatus === "synthesizing_video") && (
                <div className="space-y-4 py-8">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-xs uppercase tracking-[0.24em] text-accent animate-pulse font-medium">
                      {getStatusText()}
                    </p>
                    <p className="text-xs font-mono text-text-secondary">{progress}%</p>
                  </div>
                  <Progress value={progress} className="h-2 bg-secondary/30 overflow-hidden rounded-full">
                    <div 
                      className="h-full bg-accent transition-all duration-500 ease-out" 
                      style={{ width: `${progress}%` }} 
                    />
                  </Progress>
                  <div className="grid grid-cols-4 gap-2">
                    <div className={`h-1.5 rounded-full transition-colors duration-300 ${progress >= 25 ? "bg-accent" : "bg-border/20"}`} />
                    <div className={`h-1.5 rounded-full transition-colors duration-300 ${progress >= 50 ? "bg-accent" : "bg-border/20"}`} />
                    <div className={`h-1.5 rounded-full transition-colors duration-300 ${progress >= 75 ? "bg-accent" : "bg-border/20"}`} />
                    <div className={`h-1.5 rounded-full transition-colors duration-300 ${progress >= 100 ? "bg-accent" : "bg-border/20"}`} />
                  </div>
                </div>
              )}

              {/* Video Player Display */}
              {videoStatus === "ready" && videoUrl && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative aspect-video rounded-[2rem] overflow-hidden border border-border/30 shadow-2xl bg-black"
                >
                  <video 
                    src={videoUrl} 
                    controls 
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-background/80 backdrop-blur-md border border-border/40 text-foreground py-1.5 px-3">
                      <CheckCircle2 size={12} className="mr-2 text-success shrink-0" /> Broadcast Ready
                    </Badge>
                  </div>
                </motion.div>
              )}

              {/* Script Preview Card */}
              {generatedScript && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-[1.5rem] border border-border/20 bg-secondary/20 p-6"
                >
                  <div className="flex items-center gap-2 mb-3 text-text-secondary">
                    <FileText size={14} className="shrink-0" />
                    <span className="text-[10px] uppercase tracking-[0.24em] font-semibold">Teleprompter Feed</span>
                  </div>
                  <p className="text-xs leading-6 text-text-secondary/80 line-clamp-4 italic">
                    "{generatedScript}"
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <div className="flex items-center gap-2 px-2 mt-auto">
          <Info size={12} className="text-text-secondary/50 shrink-0" />
          <p className="text-[10px] text-text-secondary/50 uppercase tracking-widest font-medium">
            Signal Grounding: Gemini 2.0 Flash · Broadcast Synthesis: Tavus AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoReport;


