import { motion } from "framer-motion";
import { ReactNode } from "react";

const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="min-h-screen"
  >
    {children}
  </motion.div>
);

export default PageTransition;
