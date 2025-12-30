"use client";

import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ArrowLeft, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Faucet Stream for Orange
 */
const FaucetStream = ({ side }: { side: "left" | "right" }) => (
  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ 
      height: [110, 115, 110], 
      opacity: 1,
      x: side === "left" ? [-1.5, 1.5, -1.5] : [1.5, -1.5, 1.5], 
    }}
    transition={{ 
      height: { duration: 2, repeat: Infinity, ease: "easeInOut" },
      x: { repeat: Infinity, duration: 0.8, ease: "easeInOut" } 
    }}
    className={`absolute top-2 w-2.5 bg-cyan-400/80 rounded-full z-30 shadow-[0_0_12px_rgba(34,211,238,0.4)] origin-top ${
      side === "left" ? "-left-0.5" : "-right-0.5"
    }`}
  >
    <motion.div 
      animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-2.5 bg-cyan-300 rounded-[100%] blur-[2px]"
    />
  </motion.div>
);

/**
 * Vertical Drip Stream for Black
 */
const TearDrip = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 0 }}
    animate={{ opacity: [0, 1, 0], y: [0, 60], scaleY: [1, 1.2, 1] }}
    transition={{ duration: 3, repeat: Infinity, delay, ease: "easeInOut" }}
    className="absolute top-full w-1 h-3 bg-cyan-200/40 rounded-full z-30"
  />
);

export default function SignOutPage() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const handleSignOut = async () => {
    setIsExiting(true);
    await signOut({ callbackUrl: "/posts" });
  };

  const mouthColor = "rgba(255, 255, 255, 0.4)";
  
  const zzzVariants = {
    animate: (i: number) => ({
      y: [-10, -80],
      x: [0, i % 2 === 0 ? 20 : -20],
      opacity: [0, 1, 0],
      transition: { duration: 3, repeat: Infinity, delay: i * 0.8 }
    })
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[rgb(var(--color-bg))] px-6 transition-colors duration-500 overflow-hidden text-[rgb(var(--color-fg))]">
      <div className="relative w-full max-w-lg">
        
        {/* CHARACTER STAGE */}
        <div className="flex items-end justify-center h-48 mb-[-12px] relative z-10 px-4">
          
          {/* 🟠 ORANGE */}
          <motion.div 
            animate={{ height: isExiting ? 40 : 64 }}
            className="w-32 bg-orange-500 rounded-t-full relative -mr-16 z-20 origin-bottom border border-white/20 flex flex-col items-center pt-5 shadow-lg"
          >
            <div className="flex gap-3 mb-2 relative">
              <div className="relative">
                <motion.div animate={{ scaleY: isExiting ? 0.1 : 1 }} className="w-3 h-3 bg-slate-900 rounded-full" />
                {!isExiting && <FaucetStream side="left" />}
              </div>
              <div className="relative">
                <motion.div animate={{ scaleY: isExiting ? 0.1 : 1 }} className="w-3 h-3 bg-slate-900 rounded-full" />
                {!isExiting && <FaucetStream side="right" />}
              </div>
            </div>
            <motion.div className="bg-slate-900 w-4 h-2.5" style={{ clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)' }} />
          </motion.div>

          {/* 🟣 PURPLE (Waving with Handkerchief) */}
          <motion.div 
            animate={{ height: isExiting ? 140 : 230 }}
            className="w-24 bg-indigo-600 rounded-t-[4rem] relative flex flex-col items-center pt-12 origin-bottom shadow-2xl border border-white/30 z-10"
          >
            {!isExiting && (
              <motion.div
                animate={{ rotate: [0, -35, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                style={{ originY: 1, originX: 0 }}
                className="absolute -left-5 top-16 w-3 h-12 bg-indigo-600 rounded-full border-l border-white/20"
              >
                {/* THE HANDKERCHIEF */}
                <motion.div
                  animate={{ 
                    rotate: [0, 15, -10, 0],
                    scale: [1, 1.1, 0.9, 1]
                  }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  style={{ originY: 0, originX: 0.5, clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 50% 80%, 0% 100%)' }}
                  className="absolute -left-4 -top-6 w-10 h-10 bg-white shadow-sm"
                />
              </motion.div>
            )}
            
            <AnimatePresence>
              {isExiting && [1, 2].map(i => (
                <motion.span key={i} custom={i} variants={zzzVariants} animate="animate" className="absolute -top-10 text-white/30 font-bold text-xl">Zzz</motion.span>
              ))}
            </AnimatePresence>
            <div className="flex gap-4 mb-4">
              <motion.div animate={{ scaleY: isExiting ? 0.1 : 1 }} className="w-3 h-3 bg-white rounded-full" />
              <motion.div animate={{ scaleY: isExiting ? 0.1 : 1 }} className="w-3 h-3 bg-white rounded-full" />
            </div>
            <motion.div style={{ backgroundColor: mouthColor }} className="w-6 h-2 rounded-t-full" />
          </motion.div>

          {/* 🟡 YELLOW */}
          <motion.div 
            animate={{ height: isExiting ? 80 : 130 }}
            className="w-32 h-32 bg-yellow-400 rounded-3xl relative flex flex-col items-center justify-center shadow-2xl -ml-6 z-30 origin-bottom border-4 border-white/50"
          >
             {!isExiting && (
              <motion.div
                initial={{ rotate: 10 }}
                animate={{ rotate: [10, 45, 10] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                style={{ originY: 0.5, originX: 0 }} 
                className="absolute -right-10 top-12 w-12 h-4 bg-yellow-400 rounded-full border-r border-white/40 shadow-sm"
              />
            )}

            <div className="flex gap-4 mb-3">
              <motion.div animate={{ scaleY: isExiting ? 0.1 : 1 }} className="w-4 h-4 bg-slate-900 rounded-full border-2 border-white/50" />
              <motion.div animate={{ scaleY: isExiting ? 0.1 : 1 }} className="w-4 h-4 bg-slate-900 rounded-full border-2 border-white/50" />
            </div>
            <motion.div style={{ backgroundColor: mouthColor }} className="w-8 h-2 rounded-t-full" />
          </motion.div>

          {/* ⚫ BLACK */}
          <motion.div 
            animate={{ height: isExiting ? 90 : 150 }}
            className="w-20 h-36 bg-slate-900 rounded-t-[3.5rem] relative flex flex-col items-center pt-12 -ml-8 z-10 origin-bottom shadow-2xl border border-white/20"
          >
            <div className="flex gap-3 mb-5">
              <div className="relative">
                <motion.div animate={{ scaleY: isExiting ? 0.1 : 1 }} className="w-2.5 h-2.5 bg-white rounded-full" />
                {!isExiting && <TearDrip delay={0} />}
              </div>
              <div className="relative">
                <motion.div animate={{ scaleY: isExiting ? 0.1 : 1 }} className="w-2.5 h-2.5 bg-white rounded-full" />
                {!isExiting && <TearDrip delay={1.5} />}
              </div>
            </div>
            <div className="w-10 h-4">
              <svg viewBox="0 0 60 20" fill="none" className="w-full h-full overflow-visible">
                <path d="M 10,18 Q 30,0 50,18" stroke={mouthColor} strokeWidth="6" strokeLinecap="round" />
              </svg>
            </div>
          </motion.div>
        </div>

        {/* EXIT CARD */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-10 pt-16 rounded-[3rem] bg-[rgb(var(--color-bg-soft)/0.4)] border border-[rgb(var(--color-border)/0.5)] backdrop-blur-2xl shadow-2xl text-center space-y-8"
        >
          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tight text-[rgb(var(--color-fg))]">
              Leaving <span className="text-[rgb(var(--color-danger))]">Already?</span>
            </h1>
            <p className="text-[rgb(var(--color-fg-muted))] font-medium text-sm leading-relaxed max-w-[280px] mx-auto">
              Are you sure you want to end your session?
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <button
              disabled={isExiting}
              onClick={handleSignOut}
              className="group w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] shadow-xl hover:bg-[rgb(var(--color-danger))] hover:text-white transition-all active:scale-[0.95]"
            >
              Confirm Sign Out
            </button>
            <button 
              onClick={() => router.back()} 
              className="w-full py-4 text-[rgb(var(--color-fg-subtle))] font-bold text-xs uppercase tracking-widest hover:text-[rgb(var(--color-fg))] transition-all"
            >
              Stay a while
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}