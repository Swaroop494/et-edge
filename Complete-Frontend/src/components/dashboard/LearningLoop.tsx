import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { BrainCircuit } from "lucide-react";

const accuracyData = [
  { week: "W1", acc: 68 },
  { week: "W2", acc: 70 },
  { week: "W3", acc: 71 },
  { week: "W4", acc: 72 },
  { week: "W5", acc: 73 },
  { week: "W6", acc: 74 },
  { week: "W7", acc: 75 },
  { week: "W8", acc: 76 },
];

const LearningLoop = () => (
  <motion.div
    initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
    className="glass rounded-2xl p-4"
  >
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
        <BrainCircuit className="w-3.5 h-3.5 text-primary" />
      </div>
      <div>
        <h4 className="text-xs font-semibold text-foreground">AI Accuracy</h4>
        <p className="text-[10px] text-text-secondary">Improving over time</p>
      </div>
      <div className="ml-auto text-right">
        <span className="font-display text-lg font-bold text-accent tabular-nums">76%</span>
        <p className="text-[9px] text-accent">↑ from 68%</p>
      </div>
    </div>
    <div className="h-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={accuracyData}>
          <defs>
            <linearGradient id="accLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(168,100%,48%)" />
              <stop offset="100%" stopColor="hsl(258,78%,55%)" />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              background: "hsl(222,60%,8%)",
              border: "1px solid hsl(222,30%,20%)",
              borderRadius: "8px",
              fontSize: "10px",
              color: "hsl(220,20%,92%)",
            }}
            formatter={(value: number) => [`${value}%`, "Accuracy"]}
          />
          <Line
            type="monotone"
            dataKey="acc"
            stroke="url(#accLine)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: "hsl(168,100%,48%)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

export default LearningLoop;
