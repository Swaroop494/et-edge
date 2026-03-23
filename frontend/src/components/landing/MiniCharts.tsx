import { motion } from "framer-motion";

const chartPath1 = "M0,40 Q15,35 30,38 T60,30 T90,25 T120,20 T150,28 T180,18 T210,22 T240,15";
const chartPath2 = "M0,35 Q20,40 40,32 T80,28 T120,35 T160,22 T200,30 T240,20";

const MiniCharts = () => (
  <div className="absolute inset-0 pointer-events-none z-[4]">
    {/* Left chart */}
    <motion.div
      className="absolute left-[3%] bottom-[28%]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.4 }}
      transition={{ duration: 1.5, delay: 2 }}
    >
      <svg width="140" height="50" viewBox="0 0 240 50" fill="none">
        <defs>
          <linearGradient id="miniGrad1" x1="0" y1="0" x2="240" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="hsl(168,100%,48%)" stopOpacity="0.8" />
            <stop offset="1" stopColor="hsl(258,78%,55%)" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <motion.path
          d={chartPath1}
          stroke="url(#miniGrad1)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, delay: 2.2, ease: "easeOut" }}
        />
      </svg>
    </motion.div>

    {/* Right chart */}
    <motion.div
      className="absolute right-[4%] bottom-[22%]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.35 }}
      transition={{ duration: 1.5, delay: 2.5 }}
    >
      <svg width="120" height="50" viewBox="0 0 240 50" fill="none">
        <defs>
          <linearGradient id="miniGrad2" x1="0" y1="0" x2="240" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="hsl(258,78%,55%)" stopOpacity="0.7" />
            <stop offset="1" stopColor="hsl(168,100%,48%)" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <motion.path
          d={chartPath2}
          stroke="url(#miniGrad2)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, delay: 2.8, ease: "easeOut" }}
        />
      </svg>
    </motion.div>
  </div>
);

export default MiniCharts;
