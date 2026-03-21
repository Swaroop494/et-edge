import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { time: "9:15", value: 24180 },
  { time: "9:45", value: 24220 },
  { time: "10:15", value: 24350 },
  { time: "10:45", value: 24290 },
  { time: "11:15", value: 24410 },
  { time: "11:45", value: 24380 },
  { time: "12:15", value: 24520 },
  { time: "12:45", value: 24480 },
  { time: "13:15", value: 24560 },
  { time: "13:45", value: 24620 },
  { time: "14:15", value: 24590 },
  { time: "14:45", value: 24670 },
  { time: "15:15", value: 24710 },
  { time: "15:30", value: 24685 },
];

const stocks = [
  { name: "RELIANCE", price: "2,847.35", change: "+1.24%", up: true },
  { name: "TCS", price: "3,912.10", change: "-0.38%", up: false },
  { name: "HDFC BANK", price: "1,672.80", change: "+0.91%", up: true },
  { name: "INFOSYS", price: "1,543.25", change: "+2.17%", up: true },
  { name: "ITC", price: "467.50", change: "-0.62%", up: false },
];

const news = [
  { time: "2m ago", headline: "RBI signals potential rate hike in upcoming policy review", tag: "Macro" },
  { time: "14m ago", headline: "Reliance Industries announces $3.2B green energy investment", tag: "Sector" },
  { time: "38m ago", headline: "IT sector faces headwinds as US spending contracts Q3", tag: "Earnings" },
  { time: "1h ago", headline: "FII outflows cross ₹8,200 Cr in current week", tag: "Flow" },
];

const MarketOverview = () => (
  <motion.div
    initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
    className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6"
  >
    {/* Main chart */}
    <div className="lg:col-span-7 glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">NIFTY 50</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-2xl font-bold text-foreground">24,685.40</span>
            <span className="flex items-center gap-1 text-xs font-medium text-accent">
              <TrendingUp className="w-3 h-3" />
              +0.87%
            </span>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent">
          <Activity className="w-3 h-3" />
          Live
        </span>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="niftyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(168,100%,48%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(168,100%,48%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215,20%,60%)" }} axisLine={false} tickLine={false} />
            <YAxis domain={["dataMin - 50", "dataMax + 50"]} tick={{ fontSize: 10, fill: "hsl(215,20%,60%)" }} axisLine={false} tickLine={false} width={45} />
            <Tooltip
              contentStyle={{
                background: "hsl(222,60%,8%)",
                border: "1px solid hsl(222,30%,20%)",
                borderRadius: "12px",
                fontSize: "12px",
                color: "hsl(220,20%,92%)",
              }}
            />
            <Area type="monotone" dataKey="value" stroke="hsl(168,100%,48%)" strokeWidth={2} fill="url(#niftyGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Right column: stocks + news */}
    <div className="lg:col-span-5 flex flex-col gap-4">
      {/* Stock ticker list */}
      <div className="glass rounded-2xl p-4 flex-1">
        <h4 className="font-display text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Top Movers
        </h4>
        <div className="space-y-2.5">
          {stocks.map((s) => (
            <div key={s.name} className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">{s.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-secondary tabular-nums">₹{s.price}</span>
                <span className={`flex items-center gap-0.5 text-xs font-medium tabular-nums ${s.up ? "text-accent" : "text-critical"}`}>
                  {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {s.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Breaking signals */}
      <div className="glass rounded-2xl p-4 flex-1">
        <h4 className="font-display text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Breaking Signals
        </h4>
        <div className="space-y-3">
          {news.map((n, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-[10px] text-text-secondary whitespace-nowrap mt-0.5 tabular-nums w-12 shrink-0">
                {n.time}
              </span>
              <div className="min-w-0">
                <p className="text-xs text-foreground leading-snug line-clamp-2">{n.headline}</p>
                <span className="inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                  {n.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

export default MarketOverview;
