"use client";

import React from "react";
import { motion } from "framer-motion";

const noteVariants = {
  sing: (i: number) => ({
    y: [0, -70],
    x: [0, i % 2 === 0 ? 25 : -25],
    opacity: [0, 0.6, 0],
    scale: [0.5, 1.2, 0.8],
    transition: {
      duration: 3,
      repeat: Infinity,
      delay: i * 0.5,
      ease: "easeOut",
    },
  }),
};

export default function SingingBlobsOrdered() {
  const mouthColor = "rgba(255, 255, 255, 0.4)";

  // The Group Shear (Lean) + Group Sway (Movement)
  const groupWarp = {
    animate: {
      skewX: [-10, 10, -10], 
      x: [-12, 12, -12],     
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const Note = ({ delay, xOffset }: { delay: number; xOffset: string }) => (
    <motion.span
      custom={delay}
      variants={noteVariants}
      animate="sing"
      className="absolute text-3xl pointer-events-none select-none"
      style={{ left: xOffset, color: "rgb(var(--color-accent))", zIndex: 60 }}
    >
      ♪
    </motion.span>
  );

  return (
    <div className="flex h-full min-h-[500px] w-full items-center justify-center text-center overflow-hidden transition-colors duration-500" style={{ backgroundColor: 'rgb(var(--color-bg))' }}>
      <div className="flex flex-col items-center justify-center px-10 py-16 w-full">
        
        {/* THE WARPING GROUP: Orange -> Purple -> Yellow -> Black */}
        <motion.div 
          variants={groupWarp}
          animate="animate"
          className="flex items-end justify-center mb-16 h-60 relative origin-bottom"
        >
          
          {/* 1. ORANGE (Left-most) */}
          <motion.div
            animate={{ height: [64, 75, 64] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-32 bg-orange-500 rounded-t-full relative z-40 origin-bottom border border-white/20 flex flex-col items-center pt-4 shadow-2xl"
          >
            <div className="flex gap-3 mb-1.5">
              <div className="w-2.5 h-5 bg-slate-900 rounded-full" />
              <div className="w-2.5 h-5 bg-slate-900 rounded-full" />
            </div>
            <div className="w-4 h-4 bg-slate-900 rounded-b-full" />
          </motion.div>
          
          {/* 2. PURPLE (Second, Tucked behind Orange) */}
          <motion.div
            animate={{ height: [230, 260, 230] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            className="w-24 bg-indigo-600 rounded-t-[4rem] relative -ml-14 z-10 origin-bottom shadow-2xl border border-white/30 flex flex-col items-center pt-10"
          >
            <Note delay={1} xOffset="-10%" />
            <div className="flex gap-4 mt-2 mb-3">
              <div className="w-2.5 h-2.5 bg-white rounded-full" />
              <div className="w-2.5 h-2.5 bg-white rounded-full" />
            </div>
            <motion.div 
              animate={{ scaleY: [1, 1.5, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="w-8 h-6 rounded-full" 
              style={{ backgroundColor: mouthColor }} 
            />
          </motion.div>

          {/* 3. YELLOW (Third, Overlapping Purple) */}
          <motion.div
            animate={{ scale: [1, 1.05, 1], y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            className="w-32 h-32 bg-yellow-400 rounded-3xl relative -ml-10 z-30 origin-bottom border-4 border-white/50 flex flex-col items-center justify-center shadow-2xl"
          >
            <div className="flex gap-4 mb-2">
              <div className="w-4 h-4 bg-slate-900 rounded-full border-2 border-white/50" />
              <div className="w-4 h-4 bg-slate-900 rounded-full border-2 border-white/50" />
            </div>
            <div className="w-14 h-5 bg-slate-900 rounded-b-full" />

          </motion.div>

          {/* 4. BLACK (Right-most, Tucked behind Yellow) */}
          <motion.div
            animate={{ height: [140, 160, 140] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="w-20 bg-slate-900 rounded-t-[3.5rem] relative -ml-8 z-20 origin-bottom shadow-2xl border border-white/20 flex flex-col items-center pt-10"
          >
            <Note delay={3} xOffset="70%" />
            <div className="flex gap-3 mb-4">
              <div className="w-2 h-2 bg-white rounded-full" />
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
<svg
  viewBox="0 0 80 20"
  fill="none"
  className="w-full h-full overflow-visible"
>
  <path
    d="M 5 12
       Q 10 4  15 12
       T 25 12
       T 35 12
       T 45 12
       T 55 12
       T 65 12
       T 75 12"
    stroke={mouthColor ?? "#6b7280"}  // Tailwind gray-500-ish
    strokeWidth="6"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</svg>

          </motion.div>

        </motion.div>

        {/* Text Section */}
        <div className="space-y-6 max-w-sm">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none" style={{ color: 'rgb(var(--color-fg))' }}>
              Nothing to see <span className="opacity-30" style={{ color: 'rgb(var(--color-fg-subtle))' }}>here</span>
            </h2>
            <p className="text-sm font-medium leading-relaxed max-w-[300px] mx-auto opacity-80" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              The band is lined up and ready, but the content is still off-stage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}