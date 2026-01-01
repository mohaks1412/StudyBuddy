// components/CornerLoadingOverlay.tsx
"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

const blobVariants : Variants = {
  initial: (corner: string): any => ({
    x: corner.includes("left") ? -150 : 150,
    y: corner.includes("top") ? -150 : 150,
    rotate: corner.includes("left") ? -45 : 45,
  }),
  animate: { 
    x: 0, 
    y: 0, 
    rotate: 0,
    transition: { type: "spring", stiffness: 80, damping: 15 } 
  },
  exit: (corner: string) : any => ({
    x: corner.includes("left") ? -150 : 150,
    y: corner.includes("top") ? -150 : 150,
    transition: { duration: 0.3 }
  })
};

export function CornerLoadingOverlay({ isVisible }: { isVisible: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop Blur */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

          {/* TOP LEFT - ORANGE (Blinking Eyes) */}
          <motion.div 
            custom="top-left"
            variants={blobVariants}
            initial="initial" animate="animate" exit="exit"
            className="absolute -top-10 -left-10 w-48 h-48 bg-orange-500 rounded-br-[5rem] shadow-2xl flex items-center justify-center pt-10 pl-10"
          >
             <div className="flex gap-3">
                <motion.div animate={{ scaleY: [1, 0.1, 1] }} transition={{ repeat: Infinity, duration: 2, times: [0, 0.1, 0.2] }} className="w-3 h-4 bg-slate-900 rounded-full" />
                <motion.div animate={{ scaleY: [1, 0.1, 1] }} transition={{ repeat: Infinity, duration: 2, times: [0, 0.1, 0.2] }} className="w-3 h-4 bg-slate-900 rounded-full" />
             </div>
          </motion.div>

          {/* TOP RIGHT - PURPLE (Floating Zzz) */}
          <motion.div 
            custom="top-right"
            variants={blobVariants}
            initial="initial" animate="animate" exit="exit"
            className="absolute -top-10 -right-10 w-40 h-64 bg-indigo-600 rounded-bl-[5rem] shadow-2xl flex items-center justify-center pt-10 pr-10"
          >
             <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-white/50 font-black text-xl">...</motion.div>
          </motion.div>

          {/* BOTTOM LEFT - YELLOW (Peeking) */}
          <motion.div 
            custom="bottom-left"
            variants={blobVariants}
            initial="initial" animate="animate" exit="exit"
            className="absolute -bottom-10 -left-10 w-56 h-40 bg-yellow-400 rounded-tr-[5rem] shadow-2xl"
          />

          {/* BOTTOM RIGHT - BLACK (Scanning) */}
          <motion.div 
            custom="bottom-right"
            variants={blobVariants}
            initial="initial" animate="animate" exit="exit"
            className="absolute -bottom-10 -right-10 w-40 h-40 bg-slate-900 border border-white/10 rounded-tl-[5rem] shadow-2xl flex items-center justify-center pb-10 pr-10"
          >
             <motion.div 
              animate={{ x: [-10, 10, -10] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-12 h-2 bg-white/20 rounded-full overflow-hidden"
             >
                <motion.div animate={{ x: [-40, 40] }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-full bg-white/60" />
             </motion.div>
          </motion.div>

          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center">
             <motion.p 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-white font-black uppercase tracking-[0.4em] text-lg bg-black/40 px-8 py-3 rounded-full border border-white/10 backdrop-blur-md"
             >
               Processing...
             </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}