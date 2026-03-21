import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Target, CheckCircle2, XCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const weeklyData = [
  { week: "W1", accuracy: 68, predictions: 42, correct: 29 },
  { week: "W2", accuracy: 70, predictions: 38, correct: 27 },
  { week: "W3", accuracy: 71, predictions: 45, correct: 32 },
  { week: "W4", accuracy: 72, predictions: 41, correct: 30 },
  { week: "W5", accuracy: 73, predictions: 50, correct: 37 },
  { week: "W6", accuracy: 74, predictions: 47, correct: 35 },
  { week: "W7", accuracy: 75, predictions: 52, correct: 39 },
  { week: "W8", accuracy: 76, predictions: 48, correct: 37 },
];

const recentPredictions = [
  { event: "RBI rate hike impact on banking", predicted: "NIFTY Bank -2.1%", actual: "NIFTY Bank -1.8%", correct: true },
  { event: "IT earnings beat expectations", predicted: "TCS +3.2%", actual: "TCS +2.9%", correct: true },
  { event: "Oil price surge effect", predicted: "ONGC +4.5%", actual: "ONGC +1.2%", correct: false },
  { event: "FII outflow acceleration", predicted: "NIFTY -1.5%", actual: "NIFTY -1.7%", correct: true },
  { event: "Rupee depreciation impact", predicted: "IT sector +2.0%", actual: "IT sector +2.4%", correct: true },
  { event: "Monsoon forecast positive", predicted: "FMCG +1.8%", actual: "FMCG +0.3%", correct: false },
];

const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const LearningLoopPage = () => {
  const totalPredictions = weeklyData.reduce((sum, w) => sum + w.predictions, 0);
  const totalCorrect = weeklyData.reduce((sum, w) => sum + w.correct, 0);

  return (
    <section className="relative min-h-screen overflow-hidden px-6 py-12 md:px-10 lg:px-16">
      <div className="absolute inset-0 gradient-explain" />
      <div className="absolute inset-0 vignette-soft pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute left-[25%] top-[15%] h-[32rem] w-[32rem] rounded-full bg-electric-violet/10 blur-[180px]"
          animate={{ scale: [0.96, 1.04, 0.96], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[20%] bottom-[20%] h-[24rem] w-[24rem] rounded-full bg-teal/8 blur-[150px]"
          animate={{ x: [0, 18, 0], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: smoothEase }}
          className="max-w-4xl mb-10"
        >
          <Badge variant="outline" className="border-border/40 bg-secondary/40 px-4 py-1 text-[0.65rem] uppercase tracking-[0.32em] text-text-secondary">
            Learning Loop
          </Badge>
          <h1 className="mt-6 font-display text-4xl leading-[0.94] text-foreground md:text-6xl">
            AI that gets smarter with every prediction.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-text-secondary md:text-lg">
            Track how ET Edge's prediction accuracy improves over time as the system learns from market outcomes.
          </p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: BrainCircuit, label: "Current Accuracy", value: "76%", sub: "↑ from 68%", accent: true },
            { icon: Target, label: "Total Predictions", value: totalPredictions.toString(), sub: "last 8 weeks" },
            { icon: CheckCircle2, label: "Correct Calls", value: totalCorrect.toString(), sub: `${Math.round((totalCorrect / totalPredictions) * 100)}% hit rate` },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.08, ease: smoothEase }}
              className="glass rounded-[1.75rem] p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-accent" />
                </div>
                <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">{stat.label}</p>
              </div>
              <p className={`font-display text-4xl ${stat.accent ? "text-accent" : "text-foreground"}`}>{stat.value}</p>
              <p className="text-xs text-text-secondary mt-1">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Accuracy chart */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.4, ease: smoothEase }}
          className="glass-strong rounded-[2rem] p-8 mb-8"
        >
          <p className="text-xs uppercase tracking-[0.28em] text-text-secondary mb-6">Accuracy Over Time</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(168,100%,48%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(168,100%,48%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="accStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(168,100%,48%)" />
                    <stop offset="100%" stopColor="hsl(258,78%,55%)" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(215,20%,60%)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 82]} tick={{ fontSize: 11, fill: "hsl(215,20%,60%)" }} axisLine={false} tickLine={false} width={35} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(222,60%,8%)",
                    border: "1px solid hsl(222,30%,20%)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "hsl(220,20%,92%)",
                  }}
                  formatter={(value: number) => [`${value}%`, "Accuracy"]}
                />
                <Area type="monotone" dataKey="accuracy" stroke="url(#accStroke)" strokeWidth={2.5} fill="url(#accGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent predictions */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.5, ease: smoothEase }}
          className="glass rounded-[2rem] p-8"
        >
          <p className="text-xs uppercase tracking-[0.28em] text-text-secondary mb-6">Recent Predictions vs Outcomes</p>
          <div className="space-y-3">
            {recentPredictions.map((pred, i) => (
              <motion.div
                key={pred.event}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.06, ease: smoothEase }}
                className="flex items-center gap-4 rounded-[1.25rem] border border-border/20 bg-secondary/15 p-4"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${pred.correct ? "bg-success/10" : "bg-critical/10"}`}>
                  {pred.correct ? <CheckCircle2 className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-critical" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium truncate">{pred.event}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-text-secondary">
                    <span>Predicted: <span className="text-foreground">{pred.predicted}</span></span>
                    <span>Actual: <span className="text-foreground">{pred.actual}</span></span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`rounded-full px-3 py-0.5 text-[10px] ${pred.correct ? "border-success/20 bg-success/10 text-foreground" : "border-critical/20 bg-critical/10 text-foreground"}`}
                >
                  {pred.correct ? "Hit" : "Miss"}
                </Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LearningLoopPage;
