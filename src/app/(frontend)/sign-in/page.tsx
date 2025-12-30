"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { signIn } from "next-auth/react";
import { GoogleLogin } from "../components/auth/GoogleLogin";

// Variant for the musical notes (whistling animation)
const noteVariants = {
  whistle: (i: number) => ({
    y: [0, -45],
    x: [0, i % 2 === 0 ? 15 : -15],
    opacity: [0, 1, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      delay: i * 0.4,
      ease: "easeOut",
    },
  }),
};

export default function IntegratedReactiveLogin() {

  const router = useRouter();
  // --- AUTH & FORM STATE ---
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeField, setActiveField] = useState<"email" | "password" | null>(null);
  const [authState, setAuthState] = useState<"idle" | "authenticating" | "success" | "failure">("idle");

  // --- NODDING STATES ---
  const [purpleNodding, setPurpleNodding] = useState(false);
  const [orangeNodding, setOrangeNodding] = useState(false);
  const [yellowNodding, setYellowNodding] = useState(false);
  const [blackNodding, setBlackNodding] = useState(false);

  // --- PHYSICS ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 200 };
  const eyesX = useSpring(mouseX, springConfig);
  const eyesY = useSpring(mouseY, springConfig);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (authState !== "idle" || activeField === "password") return;
    const x = (e.clientX - window.innerWidth / 4) / 30;
    const y = (e.clientY - window.innerHeight / 2) / 30;
    mouseX.set(x);
    mouseY.set(y);
  }, [activeField, authState, mouseX, mouseY]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const isPassword = e.target.type === "password";
    setActiveField(isPassword ? "password" : "email");

    if (isPassword) {
      mouseX.set(-25);
      mouseY.set(-25);
    } else {
      mouseX.set(25);
      const rect = e.target.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const centerOfInput = rect.top + rect.height / 2;
      const calculatedY = ((centerOfInput / viewportHeight) * 60) - 30;
      mouseY.set(calculatedY);
    }
  }, [mouseX, mouseY]);

  const handleBlur = useCallback(() => setActiveField(null), []);

  const triggerPurpleNod = useCallback(() => {
    if (purpleNodding || authState !== "idle") return;
    setPurpleNodding(true);
    setTimeout(() => setPurpleNodding(false), 250);
  }, [purpleNodding, authState]);

  const triggerOrangeNod = useCallback(() => {
    if (orangeNodding || authState !== "idle") return;
    setOrangeNodding(true);
    setTimeout(() => setOrangeNodding(false), 250);
  }, [orangeNodding, authState]);

  const triggerYellowNod = useCallback(() => {
    if (yellowNodding || authState !== "idle") return;
    setYellowNodding(true);
    setTimeout(() => setYellowNodding(false), 250);
  }, [yellowNodding, authState]);

  const triggerBlackNod = useCallback(() => {
    if (blackNodding || authState !== "idle") return;
    setBlackNodding(true);
    setTimeout(() => setBlackNodding(false), 250);
  }, [blackNodding, authState]);

  const handleInputChange = (setter: (val: string) => void, value: string) => {
    setter(value);
    if (authState === "idle" && activeField !== "password") {
      triggerOrangeNod();
      setTimeout(() => triggerPurpleNod(), 40);
      setTimeout(() => triggerYellowNod(), 80);
      setTimeout(() => triggerBlackNod(), 120);
    }
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthState("authenticating");
    setError("");

    const res = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });
    

    if (res?.error) {
      setAuthState("failure");
      setError("Invalid credentials.");
      setTimeout(() => setAuthState("idle"), 1000);
    } else {
      setAuthState("success");
        
       setTimeout(() => {
        
        router.push("/posts");
      }, 1500);
    }
  }

  const nodPattern = [0, -12, 0];
  const nervousJitter = [0, -0.8, 0.8, -0.5, 0.5, 0];
  const failureShake = [0, -15, 12, -8, 5, 0];
  const mouthColor = "rgba(255, 255, 255, 0.4)";

  const MusicNotes = () => (
    <div className="absolute -top-10 pointer-events-none">
      <motion.span custom={1} variants={noteVariants} animate="whistle" className="absolute text-brown/30 text-xl">♪</motion.span>
      <motion.span custom={2} variants={noteVariants} animate="whistle" className="absolute text-brown/30 text-lg ml-6">♫</motion.span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-8 font-sans transition-colors duration-500" style={{ backgroundColor: 'rgb(var(--color-bg))' }}>
      <div 
        className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 rounded-[3.5rem] overflow-hidden shadow-2xl border"
        style={{ backgroundColor: 'rgb(var(--color-bg-soft))', borderColor: 'rgb(var(--color-border))' }}
      >
        
        {/* LEFT SIDE: ANIMATION SIDE (Blobs Left Alone) */}
        <div className="relative flex items-end justify-center p-12 overflow-hidden min-h-[550px] border-r" style={{ backgroundColor: 'rgb(var(--color-bg-strong))', borderColor: 'rgb(var(--color-border))' }}>
          {authState === "authenticating" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
              className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-2xl border backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(var(--color-warning), 0.2)', borderColor: 'rgb(var(--color-warning))' }}
            >
              <AlertTriangle className="w-4 h-4" style={{ color: 'rgb(var(--color-warning))' }} />
              <span className="text-sm font-bold uppercase tracking-tighter" style={{ color: 'rgb(var(--color-warning))' }}>Authenticating...</span>
            </motion.div>
          )}

          <div className="flex items-end justify-center z-10 absolute bottom-12 left-1/2 -translate-x-1/2 w-full">
  {/* BLOBS START - FULLY COPYABLE */}
  
  {/* 🟠 ORANGE */}
  <motion.div 
    animate={{ 
      height: 64, 
      x: authState === "authenticating" ? nervousJitter : (authState === "failure" ? failureShake : 0), 
      rotate: authState === "failure" ? [-5, 5, -5, 0] : (activeField === "password" ? -15 : 0), 
      y: authState === "success" ? [0, -30, 0, -20, 0] : (orangeNodding ? nodPattern : (authState === "authenticating" ? nervousJitter : 0)),
      scale: authState === "success" ? [1, 1.2, 1] : 1
    }} 
    transition={authState === "success" ? { duration: 1.5, repeat: 2 } : (authState === "authenticating" ? { repeat: Infinity, duration: 0.18 } : { duration: 0.4 })}
    className="w-32 bg-orange-500 rounded-t-full relative -mr-16 z-20 origin-bottom border border-white/20 flex flex-col items-center pt-4 shadow-lg"
  >
    {activeField === "password" && <MusicNotes />}
    <div className="flex gap-3 mb-1.5">
      <motion.div style={{ x: eyesX, y: eyesY }} className="w-2.5 h-5 bg-slate-900 rounded-full" />
      <motion.div style={{ x: eyesX, y: eyesY }} className="w-2.5 h-5 bg-slate-900 rounded-full" />
    </div>
    <motion.div 
      animate={{ 
        width: activeField === "password" ? 8 : (authState === "failure" ? 20 : 16), 
        height: activeField === "password" ? 8 : (authState === "failure" ? 10 : 12), 
        borderRadius: activeField === "password" ? "100%" : (authState === "failure" ? "100% 100% 0 0" : "0%") 
      }} 
      className="bg-slate-900" 
      style={{ clipPath: (activeField === "password" || authState === "failure") ? 'none' : 'polygon(50% 100%, 0 0, 100% 0)', x: eyesX, y: eyesY }} 
    />
  </motion.div>

  {/* 🟣 PURPLE */}
  <motion.div 
    animate={{ 
      height: authState === "success" ? 320 : (activeField === "password" ? 290 : 230),
      x: authState === "authenticating" ? nervousJitter : (authState === "failure" ? failureShake : 0), 
      rotate: authState === "failure" ? [-8, 8, -8, 0] : (activeField === "password" ? -5 : (activeField ? 6 : 0)), 
      y: authState === "success" ? [0, -40, 0] : (purpleNodding ? nodPattern : (authState === "authenticating" ? nervousJitter : 0)),
      scale: authState === "success" ? 1.3 : 1
    }} 
    transition={authState === "success" ? { duration: 1.8, repeat: 1 } : (authState === "authenticating" ? { repeat: Infinity, duration: 0.15 } : { duration: 0.4 })}
    className="w-24 bg-indigo-600 rounded-t-[4rem] relative flex flex-col items-center pt-10 origin-bottom shadow-2xl border border-white/30 z-10"
  >
    {activeField === "password" && <MusicNotes />}
    <div className="flex gap-4 mt-2 mb-3">
      <motion.div style={{ x: eyesX, y: eyesY }} animate={{ scaleY: activeField === "password" ? 0.1 : 1 }} className="w-2.5 h-2.5 bg-white rounded-full" />
      <motion.div style={{ x: eyesX, y: eyesY }} animate={{ scaleY: activeField === "password" ? 0.1 : 1 }} className="w-2.5 h-2.5 bg-white rounded-full" />
    </div>
    <motion.div 
      style={{ x: eyesX, y: eyesY, backgroundColor: mouthColor }} 
      animate={{ 
        width: activeField === "password" ? 10 : (authState === "success" ? 32 : (authState === "failure" ? 24 : 12)), 
        height: activeField === "password" ? 10 : (authState === "success" ? 16 : (authState === "failure" ? 10 : 4)), 
        borderRadius: activeField === "password" ? "100%" : (authState === "success" ? "0 0 50px 50px" : (authState === "failure" ? "50px 50px 0 0" : "2px")) 
      }} 
    />
  </motion.div>

  {/* 🟡 YELLOW */}
  <motion.div 
    animate={{ 
      scale: authState === "success" ? [1, 1.4, 1, 1.2, 1] : 1,
      x: authState === "authenticating" ? nervousJitter : (authState === "failure" ? failureShake : 0), 
      rotate: authState === "success" ? [0, 10, -10, 0] : (authState === "failure" ? [-10, 10, -10, 0] : (activeField === "password" ? -8 : (activeField ? 10 : 0))), 
      y: authState === "success" ? [0, -50, 0] : (yellowNodding ? nodPattern : (authState === "authenticating" ? nervousJitter : 0))
    }} 
    transition={authState === "success" ? { duration: 2, repeat: 1 } : (authState === "authenticating" ? { repeat: Infinity, duration: 0.16 } : { duration: 0.4 })}
    className="w-32 h-32 bg-yellow-400 rounded-3xl relative flex flex-col items-center justify-center shadow-2xl -ml-6 z-30 origin-bottom border-4 border-white/50"
  >
    {activeField === "password" && <MusicNotes />}
    <div className="flex gap-4 mb-2">
      <motion.div style={{ x: eyesX, y: eyesY }} className="w-4 h-4 bg-slate-900 rounded-full border-2 border-white/50" />
      <motion.div style={{ x: eyesX, y: eyesY }} className="w-4 h-4 bg-slate-900 rounded-full border-2 border-white/50" />
    </div>
    <motion.div 
      style={{ x: eyesX, y: eyesY, backgroundColor: mouthColor }} 
      animate={{ 
        height: activeField === "password" ? 12 : (authState === "success" ? 8 : (authState === "failure" ? 10 : 4)), 
        width: activeField === "password" ? 12 : (authState === "success" ? 32 : (authState === "failure" ? 24 : 20)), 
        borderRadius: (activeField === "password" || authState === "failure") ? "100% 100% 0 0" : "9999px" 
      }} 
      className="rounded-full" 
    />
  </motion.div>

  {/* ⚫ BLACK */}
  <motion.div 
    animate={{ 
      x: authState === "authenticating" ? nervousJitter : (authState === "failure" ? failureShake : 0), 
      rotate: authState === "success" ? [0, 8, -8, 0] : (authState === "failure" ? [12, -12, 12, 0] : (activeField === "password" ? -10 : (activeField ? 14 : 0))), 
      y: authState === "success" ? [0, -25, 0, -15, 0] : (blackNodding ? nodPattern : (authState === "authenticating" ? nervousJitter : 0)),
      scale: authState === "success" ? 1.2 : 1
    }} 
    transition={authState === "success" ? { duration: 1.6, repeat: 2 } : (authState === "authenticating" ? { repeat: Infinity, duration: 0.17 } : { duration: 0.4 })}
    className="w-20 h-36 bg-slate-900 rounded-t-[3.5rem] relative flex flex-col items-center pt-10 -ml-8 z-10 origin-bottom shadow-2xl border border-white/20"
  >
    {activeField === "password" && <MusicNotes />}
    <div className="flex gap-3 mb-4">
      <motion.div style={{ x: eyesX, y: eyesY }} animate={{ scaleY: activeField === "password" ? 0.2 : 1 }} className="w-2 h-2 bg-white rounded-full" />
      <motion.div style={{ x: eyesX, y: eyesY }} animate={{ scaleY: activeField === "password" ? 0.2 : 1 }} className="w-2 h-2 bg-white rounded-full" />
    </div>
    <motion.div style={{ x: eyesX, y: eyesY }} animate={{ 
      width: activeField === "password" ? 14 : (authState === "success" ? 50 : (authState === "failure" ? 40 : 35)), 
      height: activeField === "password" ? 14 : (authState === "success" ? 16 : (authState === "failure" ? 14 : 12))
    }}>
      <svg viewBox="0 0 60 20" fill="none" className="w-full h-full overflow-visible">
        <motion.path 
          animate={{ 
            d: activeField === "password" ? "M 30, 10 m -10, 0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0" : 
                    (authState === "failure" ? "M 10,18 Q 30,0 50,18" : "M0 10 Q5 0 10 10 T20 10 T30 10 T40 10 T50 10 T60 10")
          }} 
          stroke={mouthColor} 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
    </motion.div>
  </motion.div>
  
  {/* BLOBS END */}
</div>

        </div>

        {/* RIGHT SIDE: FORM AREA (RESTYLED WITH CSS VARIABLES) */}
        <div className="p-10 lg:p-20 flex flex-col justify-center" style={{ backgroundColor: 'rgb(var(--color-bg))' }}>
          <div className="max-w-md mx-auto w-full space-y-10">
            <h1 className="text-4xl font-black tracking-tight uppercase italic" style={{ color: 'rgb(var(--color-fg))' }}>Welcome Back</h1>
            <form onSubmit={handleLogin} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgb(var(--color-fg-muted))' }}>Email Address</label>
                <input 
                  type="email" 
                  value={identifier} 
                  onChange={(e) => handleInputChange(setIdentifier, e.target.value)} 
                  onFocus={handleFocus} 
                  onBlur={handleBlur} 
                  required
                  className="w-full bg-transparent border-b-2 py-4 text-xl font-bold outline-none transition-all"
                  style={{ 
                    color: 'rgb(var(--color-fg))', 
                    borderColor: activeField === 'email' ? 'rgb(var(--color-accent))' : 'rgb(var(--color-border))'
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgb(var(--color-fg-muted))' }}>Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  onFocus={handleFocus} 
                  onBlur={handleBlur} 
                  required
                  className="w-full bg-transparent border-b-2 py-4 text-xl font-bold outline-none transition-all"
                  style={{ 
                    color: 'rgb(var(--color-fg))', 
                    borderColor: activeField === 'password' ? 'rgb(var(--color-accent))' : 'rgb(var(--color-border))'
                  }}
                />
              </div>

              {error && <p className="text-xs font-bold uppercase tracking-tight" style={{ color: 'rgb(var(--color-danger))' }}>{error}</p>}

              <button 
                type="submit" 
                disabled={authState !== "idle"} 
                className="w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:brightness-110 disabled:opacity-30 transition-all"
                style={{ backgroundColor: 'rgb(var(--color-accent))', color: 'rgb(var(--color-accent-fg))' }}
              >
                {authState === "authenticating" ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="space-y-6 pt-6 border-t" style={{ borderColor: 'rgb(var(--color-border))' }}>
              <GoogleLogin />
              <p className="text-center text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                New here? <a href="/sign-up" className="hover:underline" style={{ color: 'rgb(var(--color-accent))' }}>Create Account</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}