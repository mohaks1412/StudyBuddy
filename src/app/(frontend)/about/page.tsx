// app/(frontend)/about/page.tsx
"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, ShieldCheck, Globe, ArrowDownRight, Command } from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] transition-colors duration-500 overflow-hidden">
      
      {/* 1. HERO SECTION: THE MANIFESTO */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-32 relative">
        <motion.div 
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="space-y-8 relative z-10"
        >
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-[rgb(var(--color-accent))]">
            <Command className="w-4 h-4" />
            System Protocol 01
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] italic">
            Knowledge is <br />
            <span className="text-[rgb(var(--color-fg-subtle))] opacity-20">Collective.</span>
          </h1>

          <p className="max-w-2xl text-xl md:text-2xl font-medium text-[rgb(var(--color-fg-muted))] leading-tight tracking-tight">
            We are building a decentralized studio for thinkers, creators, and curators to share high-fidelity insights without the noise.
          </p>
        </motion.div>

        {/* Decorative Background Blob (Subtle) */}
        <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-[rgb(var(--color-accent))] rounded-full blur-[120px] opacity-[0.05] pointer-events-none" />
      </section>

      {/* 2. CORE PILLARS: THE SPECS */}
      <section className="bg-[rgb(var(--color-bg-soft)/0.3)] border-y border-[rgb(var(--color-border)/0.5)] py-24">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            { icon: <Zap />, title: "Velocity", desc: "Instant knowledge drops. No fluff, just the core architectural insights." },
            { icon: <ShieldCheck />, title: "Curated", desc: "Peer-verified communities where quality is the only metric that matters." },
            { icon: <Globe />, title: "Open Source", desc: "Built for the network, by the network. Your data, your manifesto." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[rgb(var(--color-bg-strong))] border border-[rgb(var(--color-border))] flex items-center justify-center text-[rgb(var(--color-accent))]">
                {item.icon}
              </div>
              <h3 className="text-2xl font-black tracking-tight">{item.title}</h3>
              <p className="text-sm font-medium text-[rgb(var(--color-fg-muted))] leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. INTERACTIVE VISION SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-12">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
            Join the <br />
            <span className="text-[rgb(var(--color-accent))]">Network Pulse.</span>
          </h2>
          
          <div className="space-y-8">
            <div className="flex gap-6 group">
              <span className="text-4xl font-black opacity-10 group-hover:opacity-100 transition-opacity">01</span>
              <div>
                <h4 className="font-black text-lg uppercase tracking-widest mb-2">Create Identity</h4>
                <p className="text-sm text-[rgb(var(--color-fg-muted))] leading-relaxed">Claim your unique slug and start building your knowledge footprint across diverse communities.</p>
              </div>
            </div>
            <div className="flex gap-6 group">
              <span className="text-4xl font-black opacity-10 group-hover:opacity-100 transition-opacity">02</span>
              <div>
                <h4 className="font-black text-lg uppercase tracking-widest mb-2">Sync Knowledge</h4>
                <p className="text-sm text-[rgb(var(--color-fg-muted))] leading-relaxed">Upload notes, question papers, and architectural insights. Let the collective verify your expertise.</p>
              </div>
            </div>
          </div>
        </div>

        {/* MOCKUP / VISUAL ELEMENT */}
        <div className="relative">
          <div className="aspect-square rounded-[4rem] bg-[rgb(var(--color-bg-strong))] border border-[rgb(var(--color-border))] overflow-hidden shadow-2xl flex items-center justify-center p-12">
            <div className="grid grid-cols-2 gap-4 w-full">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: i % 2 === 0 ? [0, 2, 0] : [0, -2, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}
                  className="h-32 rounded-3xl bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] flex items-center justify-center"
                >
                  <Sparkles className={`w-8 h-8 opacity-20 text-[rgb(var(--color-accent))]`} />
                </motion.div>
              ))}
            </div>
          </div>
          {/* Decorative Tag */}
          <div className="absolute -bottom-6 -right-6 bg-[rgb(var(--color-accent))] text-[rgb(var(--color-accent-fg))] p-6 rounded-3xl font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl rotate-12">
            Protocol Active
          </div>
        </div>
      </section>

      {/* 4. FINAL CALL TO ACTION */}
      <section className="max-w-6xl mx-auto px-6 pb-40">
        <div className="p-12 md:p-24 rounded-[4rem] bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] relative overflow-hidden flex flex-col items-center text-center space-y-10">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter italic leading-none relative z-10">
            Ready to <br /> contribute?
          </h2>
          
          <Link 
            href="/sign-up"
            className="group relative z-10 flex items-center gap-4 px-12 py-6 bg-[rgb(var(--color-accent))] text-[rgb(var(--color-accent-fg))] rounded-full font-black uppercase text-xs tracking-[0.2em] hover:scale-105 transition-transform shadow-2xl"
          >
            Claim your identity
            <ArrowDownRight className="w-5 h-5 group-hover:rotate-[-90deg] transition-transform" />
          </Link>

          {/* Background Design Element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black opacity-[0.03] select-none pointer-events-none">
            STUDIO
          </div>
        </div>
      </section>
    </div>
  );
}