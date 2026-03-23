import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

const CursorGlow = () => {
  const prefersReducedMotion = useReducedMotion();
  const pointerX = useMotionValue(-200);
  const pointerY = useMotionValue(-200);
  const x = useSpring(pointerX, { damping: 32, stiffness: 180, mass: 0.5 });
  const y = useSpring(pointerY, { damping: 32, stiffness: 180, mass: 0.5 });

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handlePointerMove = (event: MouseEvent) => {
      pointerX.set(event.clientX - 180);
      pointerY.set(event.clientY - 180);
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("mousemove", handlePointerMove);
  }, [pointerX, pointerY, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed z-[90] h-[360px] w-[360px] rounded-full"
        style={{
          x,
          y,
          background: "radial-gradient(circle, hsl(var(--accent) / 0.08) 0%, transparent 72%)",
        }}
      />
      <motion.div
        className="pointer-events-none fixed z-[89] h-[280px] w-[280px] rounded-full"
        style={{
          x,
          y,
          translateX: 40,
          translateY: 40,
          background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 70%)",
        }}
      />
    </>
  );
};

export default CursorGlow;
