"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Loading() {
  const [isVisible, setIsVisible] = useState(true);
  const mouthColor = "rgba(255, 255, 255, 0.4)";

  useEffect(() => {
    const minDuration = 2000;
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, minDuration);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center transition-colors duration-500 overflow-hidden"
      style={{ backgroundColor: 'rgb(var(--color-bg))' }}
    >
      {/* Background Blur Overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/5 pointer-events-none" />

      {/* BLOBS HUDDLE - STICKY & BOBBING */}
      <div className="flex items-end justify-center h-48 relative">
        
        {/* 1. ORANGE (Left-most, Front) */}
        <motion.div
          animate={{ y: [0, -15, 0], scaleY: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-14 bg-orange-500 rounded-t-full flex flex-col items-center pt-3 shadow-xl border border-white/10 origin-bottom flex-shrink-0 z-40"
        >
          <div className="flex gap-2 mb-1">
            <div className="w-1.5 h-3 bg-slate-900 rounded-full" />
            <div className="w-1.5 h-3 bg-slate-900 rounded-full" />
          </div>
          <div className="w-3 h-3 bg-slate-900 rounded-full" />
        </motion.div>

        {/* 2. PURPLE (Behind Orange & Yellow) */}
        <motion.div
          animate={{ y: [0, -25, 0], scaleY: [1, 1.03, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="w-16 h-40 bg-indigo-600 rounded-t-[3rem] flex flex-col items-center pt-8 shadow-2xl border border-white/10 origin-bottom flex-shrink-0 -ml-12 z-10"
        >
          <div className="flex gap-3 mb-3">
            <div className="w-2 h-2 bg-white rounded-full" />
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: mouthColor }} />
        </motion.div>

        {/* 3. YELLOW (Front and Center) */}
        <motion.div
          animate={{ y: [0, -20, 0], scaleY: [1, 1.08, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="w-24 h-24 bg-yellow-400 rounded-3xl flex flex-col items-center justify-center shadow-xl border-4 border-white/40 origin-bottom flex-shrink-0 -ml-8 z-30"
        >
          <div className="flex gap-4 mb-2">
            <div className="w-3 h-3 bg-slate-900 rounded-full" />
            <div className="w-3 h-3 bg-slate-900 rounded-full" />
          </div>
          <div className="w-10 h-3 bg-slate-900 rounded-full opacity-30" />
        </motion.div>

        {/* 4. BLACK (Right-most, Tucked behind Yellow) */}
        <motion.div
          animate={{ y: [0, -18, 0], scaleY: [1, 1.04, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
          className="w-16 h-28 bg-slate-900 rounded-t-[2.5rem] flex flex-col items-center pt-8 shadow-2xl border border-white/10 origin-bottom flex-shrink-0 -ml-8 z-20"
        >
          <div className="flex gap-2 mb-3">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
          <div className="w-8 h-2 bg-white/20 rounded-full" />
        </motion.div>
      </div>

      {/* Text Section */}
      <motion.div 
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="mt-20 text-center z-10"
      >
        <h2 className="text-sm font-black uppercase tracking-[0.4em]" style={{ color: 'rgb(var(--color-accent))' }}>
          Loading
        </h2>
        <p className="text-[10px] uppercase tracking-widest mt-2 opacity-40" style={{ color: 'rgb(var(--color-fg))' }}>
          Preparing your workspace...
        </p>
      </motion.div>
    </div>
  );
}