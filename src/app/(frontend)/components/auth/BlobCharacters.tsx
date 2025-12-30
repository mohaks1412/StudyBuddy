"use client";

import { useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface BlobProps {
  activeField: "identifier" | "password" | null;
  authState: "idle" | "authenticating" | "success" | "failure";
}

export default function BlobCharacters({ activeField, authState }: BlobProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 200 };
  const eyesX = useSpring(mouseX, springConfig);
  const eyesY = useSpring(mouseY, springConfig);

  // Movement Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (authState !== "idle" || activeField === "password") return;
      mouseX.set((e.clientX - window.innerWidth / 2) / 40);
      mouseY.set((e.clientY - window.innerHeight / 2) / 40);
    };

    if (activeField === "password") {
      mouseX.set(-20);
      mouseY.set(-15);
    } else if (activeField === "identifier") {
      mouseX.set(20);
      mouseY.set(10);
    }

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [activeField, authState, mouseX, mouseY]);

  const nervousJitter = [0, -1, 1, -0.5, 0.5, 0];
  const failureShake = [0, -10, 10, -5, 5, 0];
  const mouthColor = "rgba(255, 255, 255, 0.3)";

  return (
    <div className="flex items-end justify-center h-48 w-full mb-8 relative overflow-hidden pt-10">
      {/* PURPLE BLOB (Center) */}
      <motion.div
        animate={{
          height: activeField === "password" ? 140 : 110,
          x: authState === "authenticating" ? nervousJitter : (authState === "failure" ? failureShake : 0),
          y: authState === "success" ? [-10, 0, -10] : 0
        }}
        transition={authState === "authenticating" ? { repeat: Infinity, duration: 0.2 } : {}}
        className="w-20 bg-indigo-600 rounded-t-[3rem] relative flex flex-col items-center pt-6 origin-bottom shadow-xl border border-white/20 z-10"
      >
        <div className="flex gap-3 mb-2">
          <motion.div style={{ x: eyesX, y: eyesY }} animate={{ scaleY: activeField === "password" ? 0.1 : 1 }} className="w-2 h-2 bg-white rounded-full" />
          <motion.div style={{ x: eyesX, y: eyesY }} animate={{ scaleY: activeField === "password" ? 0.1 : 1 }} className="w-2 h-2 bg-white rounded-full" />
        </div>
        <motion.div 
            animate={{ width: authState === "success" ? 20 : 10, height: authState === "success" ? 10 : 2 }}
            style={{ x: eyesX, y: eyesY, backgroundColor: mouthColor, borderRadius: '10px' }} 
        />
      </motion.div>

      {/* YELLOW BLOB (Right) */}
      <motion.div
        animate={{
          scale: authState === "success" ? 1.1 : 1,
          rotate: activeField === "password" ? -15 : 0,
          x: authState === "failure" ? failureShake : -10
        }}
        className="w-16 h-16 bg-yellow-400 rounded-2xl relative flex flex-col items-center justify-center shadow-lg -ml-4 z-20 origin-bottom border-2 border-white/30"
      >
        <div className="flex gap-2 mb-1">
          <motion.div style={{ x: eyesX, y: eyesY }} className="w-2 h-2 bg-slate-900 rounded-full" />
          <motion.div style={{ x: eyesX, y: eyesY }} className="w-2 h-2 bg-slate-900 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
}