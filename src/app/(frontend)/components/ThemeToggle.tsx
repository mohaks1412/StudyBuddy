"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark";

  const handleToggle = () => {
    setIsTransitioning(true);
    setTheme(isDark ? "light" : "dark");
    // Switch duration covers the full sequence: Sky change -> Character stretch -> Text pop
    setTimeout(() => {
      setIsTransitioning(false);
    }, 2000);
  };

  // --- Overlay Animation Variants ---
  const celestialVariants = {
    initial: { y: 150, opacity: 0, scale: 0.5 },
    animate: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
    exit: { y: -150, opacity: 0, scale: 0.5, transition: { duration: 0.5 } }
  };

  const eyeVariants = {
    awake: { scaleY: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
    asleep: { scaleY: 0.1, opacity: 0.4, transition: { duration: 0.4 } },
  };

  const mouthVariants = {
    awake: { scale: 1, opacity: 1, y: 0 },
    asleep: { scale: 0.4, opacity: 0.3, y: 3 },
  };

  const zzzVariants = {
    animate: (i: number) => ({
      y: [-10, -80],
      x: [0, i % 2 === 0 ? 20 : -20],
      opacity: [0, 0.8, 0],
      transition: { duration: 3, repeat: Infinity, delay: i * 0.8 }
    })
  };

  if (!mounted) return <div className="w-24 h-12" />;

  return (
    <>
      {/* 1. THE TRIGGER BUTTON (Navbar) */}
      <div className="relative">
        <button
          onClick={handleToggle}
          aria-label="Toggle Theme"
          className="
            relative inline-flex h-12 w-24 items-center rounded-full
            bg-[rgb(var(--color-bg-strong)/0.3)]
            border-2 border-[rgb(var(--color-border)/0.5)]
            transition-colors duration-500 focus:outline-none
            hover:border-[rgb(var(--color-accent))]
            overflow-hidden z-[50]
            px-1 /* Standardized inner padding */
          "
        >
          {/* THE SLIDER BUTTON WITH ICONS */}
          <motion.div
            animate={{ x: isDark ? 46 : 2 }} /* Adjusted travel for better padding */
            className="relative z-20 flex h-9 w-10 items-center justify-center rounded-full bg-[rgb(var(--color-bg))] border border-[rgb(var(--color-border)/0.5)] shadow-md"
          >
            <AnimatePresence mode="wait">
              {!isDark ? (
                <motion.div
                  key="sun-icon"
                  initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center"
                >
                  <Sun size={18} className="text-orange-500" fill="currentColor" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon-icon"
                  initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center"
                >
                  <Moon size={18} className="text-indigo-400" fill="currentColor" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </button>
      </div>

      {/* 2. THE OVERLAY (Teleported to body) */}
      {mounted && createPortal(
        <AnimatePresence>
          {isTransitioning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-3xl pointer-events-none"
            >
              <div className="flex items-end justify-center h-80 gap-2 relative">
                
                {/* CELESTIAL BACKGROUND ELEMENTS */}
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 z-0">
                  <AnimatePresence mode="wait">
                    {!isDark ? (
                      <motion.div
                        key="sun"
                        variants={celestialVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-28 h-28 bg-yellow-300 rounded-full shadow-[0_0_100px_rgba(253,224,71,0.5)] flex items-center justify-center"
                      >
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-yellow-900/20 rounded-full" />
                          <div className="w-2 h-2 bg-yellow-900/20 rounded-full" />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="moon"
                        variants={celestialVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-24 h-24 bg-slate-100 rounded-full shadow-[0_0_60px_rgba(255,255,255,0.2)] relative overflow-hidden"
                      >
                        <div className="absolute top-4 right-6 w-6 h-6 bg-slate-300/40 rounded-full" />
                        <div className="absolute bottom-6 left-5 w-4 h-4 bg-slate-300/40 rounded-full" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ORANGE CHARACTER */}
                <motion.div 
                  animate={{ height: isDark ? 45 : 64 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="w-28 bg-orange-500 rounded-t-full relative flex flex-col items-center pt-4 shadow-2xl origin-bottom"
                >
                  <div className="flex gap-3 mb-2">
                    <motion.div animate={isDark ? "asleep" : "awake"} variants={eyeVariants} className="w-2.5 h-5 bg-slate-900 rounded-full" />
                    <motion.div animate={isDark ? "asleep" : "awake"} variants={eyeVariants} className="w-2.5 h-5 bg-slate-900 rounded-full" />
                  </div>
                  <motion.div animate={isDark ? "asleep" : "awake"} variants={mouthVariants} className="w-5 h-5 bg-slate-900 rounded-b-full" />
                </motion.div>

                {/* PURPLE CHARACTER */}
                <motion.div 
                  animate={{ height: isDark ? 140 : 230 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.05 }}
                  className="w-24 bg-indigo-600 rounded-t-[4rem] relative -ml-12 flex flex-col items-center pt-10 shadow-2xl origin-bottom z-10 border border-white/10"
                >
                  <AnimatePresence>
                    {isDark && [1, 2, 3].map(i => (
                      <motion.span key={i} custom={i} variants={zzzVariants} animate="animate" className="absolute -top-10 text-white/40 font-bold text-2xl">Zzz</motion.span>
                    ))}
                  </AnimatePresence>
                  <div className="flex gap-4 mb-4">
                    <motion.div animate={isDark ? "asleep" : "awake"} variants={eyeVariants} className="w-2.5 h-2.5 bg-white rounded-full" />
                    <motion.div animate={isDark ? "asleep" : "awake"} variants={eyeVariants} className="w-2.5 h-2.5 bg-white rounded-full" />
                  </div>
                  <motion.div animate={isDark ? "asleep" : "awake"} variants={mouthVariants} className="w-10 h-10 rounded-full bg-white/20 border-b-4 border-white/10" />
                </motion.div>

                {/* YELLOW CHARACTER */}
                <motion.div 
                  animate={{ height: isDark ? 90 : 130, scale: isDark ? 0.95 : 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
                  className="w-32 bg-yellow-400 rounded-3xl relative -ml-8 flex flex-col items-center justify-center shadow-2xl origin-bottom z-20 border-4 border-white/30"
                >
                  <div className="flex gap-4 mb-2">
                    <motion.div animate={isDark ? "asleep" : "awake"} variants={eyeVariants} className="w-4 h-4 bg-slate-900 rounded-full border-2 border-white/50" />
                    <motion.div animate={isDark ? "asleep" : "awake"} variants={eyeVariants} className="w-4 h-4 bg-slate-900 rounded-full border-2 border-white/50" />
                  </div>
                  <motion.div animate={isDark ? "asleep" : "awake"} variants={mouthVariants} className="w-14 h-6 bg-slate-900/30 rounded-b-full" />
                </motion.div>

                {/* BLACK CHARACTER */}
                <motion.div 
                  animate={{ height: isDark ? 100 : 160 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.15 }}
                  className="w-20 bg-slate-900 rounded-t-[3.5rem] relative -ml-6 flex flex-col items-center pt-10 shadow-2xl origin-bottom border border-white/10"
                >
                  <div className="flex gap-3 mb-4">
                    <motion.div animate={isDark ? "asleep" : "awake"} variants={eyeVariants} className="w-2 h-2 bg-white rounded-full" />
                    <motion.div animate={isDark ? "asleep" : "awake"} variants={eyeVariants} className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <motion.div animate={isDark ? "asleep" : "awake"} variants={mouthVariants} className="w-12 h-3 bg-white/10 rounded-full" />
                </motion.div>
              </div>

              {/* Status Text Area */}
              <motion.div
                key={isDark ? "night" : "day"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-16 text-center"
              >
                <h2 className="text-white font-black uppercase tracking-[0.4em] text-3xl drop-shadow-lg">
                  {isDark ? "Sweet Dreams" : "Hello Sunshine"}
                </h2>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}