'use client';

import React, { useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  BrainCircuit, 
  ArrowRight, 
  Lock, 
  Search, 
  Plus, 
  MessageSquare 
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  // Inline Intersection Observer Logic
  useEffect(() => {
    const observerOptions = {
      threshold: 0.15, // Trigger when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    // Grab all elements with the .reveal class
    const revealedElements = document.querySelectorAll('.reveal');
    revealedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen font-sans selection:bg-[rgb(var(--color-accent)/0.3)] overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <span className="reveal inline-block py-1.5 px-4 rounded-full bg-[rgb(var(--color-accent)/0.1)] text-[rgb(var(--color-accent))] text-xs font-bold mb-6 tracking-widest uppercase">
            A New Era of Learning
          </span>
          
          <h1 className="reveal delay-100 text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Master Your Subjects <br />
            <span className="text-[rgb(var(--color-accent))]">Through Connection</span>
          </h1>
          
          <p className="reveal delay-200 max-w-2xl mx-auto text-lg md:text-xl text-[rgb(var(--color-fg-muted))] mb-10 leading-relaxed">
            Stop studying in isolation. Bridge the gap between individual notes 
            and collaborative insights. Explore what others are learning and share your path to mastery.
          </p>
          
          <div className="reveal delay-300 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/sign-in"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[rgb(var(--color-accent))] text-[rgb(var(--color-accent-fg))] font-bold shadow-xl shadow-[rgb(var(--color-accent)/0.2)] hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              Get Started Now <ArrowRight size={18} />
            </Link>
            <Link
              href="/posts"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[rgb(var(--color-bg-soft))] border border-border text-[rgb(var(--color-fg))] font-bold hover:bg-[rgb(var(--color-bg-strong)/0.5)] transition-all flex items-center justify-center gap-2"
            >
              <Search size={18} /> Browse Public Posts
            </Link>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[rgb(var(--color-accent))] rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-[rgb(var(--color-success))] rounded-full blur-[120px]" />
        </div>
      </section>

      {/* --- CORE FEATURES SECTION --- */}
      <section className="py-20 px-6 bg-[rgb(var(--color-bg-soft))] border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="reveal text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for the Modern Student</h2>
            <p className="text-[rgb(var(--color-fg-subtle))]">Everything you need to organize your thoughts and find your tribe.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              delayClass="delay-100"
              icon={<BrainCircuit className="text-[rgb(var(--color-accent))]" />}
              title="Knowledge Mapping"
              description="Turn your standard notes into visual mindmaps and question flows. It's not just about reading; it's about seeing the connections."
            />
            <FeatureCard 
              delayClass="delay-200"
              icon={<Users className="text-[rgb(var(--color-accent))]" />}
              title="Open Communities"
              description="Scroll through active study circles and see public discussions. Find a group that matches your specific academic interests."
            />
            <FeatureCard 
              delayClass="delay-300"
              icon={<MessageSquare className="text-[rgb(var(--color-accent))]" />}
              title="Personal Network"
              description="Build a list of friends and peers. Once you're in, direct messaging and private collaborations are just a click away."
            />
          </div>
        </div>
      </section>

      {/* --- PUBLIC PREVIEW / LOG-IN PROMPT --- */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="reveal flex-1 order-2 md:order-1">
             <div className="relative group cursor-default">
                <div className="absolute -inset-1 bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-success))] rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative p-8 rounded-[2.5rem] bg-[rgb(var(--color-bg))] border border-border shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[rgb(var(--color-danger))]" />
                            <div className="w-3 h-3 rounded-full bg-[rgb(var(--color-warning))]" />
                            <div className="w-3 h-3 rounded-full bg-[rgb(var(--color-success))]" />
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Public Feed Preview</div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-20 w-full rounded-xl bg-[rgb(var(--color-bg-soft))] flex items-center px-4 gap-4 opacity-60">
                            <div className="w-10 h-10 rounded-full bg-[rgb(var(--color-bg-strong))]" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-1/3 bg-[rgb(var(--color-bg-strong))] rounded" />
                                <div className="h-2 w-2/3 bg-[rgb(var(--color-bg-strong))] rounded opacity-50" />
                            </div>
                        </div>
                        <div className="h-20 w-full rounded-xl bg-[rgb(var(--color-bg-soft))] flex items-center px-4 gap-4 opacity-40">
                            <div className="w-10 h-10 rounded-full bg-[rgb(var(--color-bg-strong))]" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-1/4 bg-[rgb(var(--color-bg-strong))] rounded" />
                                <div className="h-2 w-1/2 bg-[rgb(var(--color-bg-strong))] rounded opacity-50" />
                            </div>
                        </div>
                        <div className="relative h-20 w-full rounded-xl bg-[rgb(var(--color-bg-soft))] flex items-center justify-center border border-dashed border-border overflow-hidden">
                           <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--color-bg-soft))] to-transparent" />
                           <div className="flex items-center gap-2 text-[rgb(var(--color-accent))] font-bold text-sm z-10">
                             <Lock size={16} /> Sign in to view full conversation
                           </div>
                        </div>
                    </div>
                </div>
             </div>
          </div>
          
          <div className="reveal flex-1 order-1 md:order-2">
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              A Window Into <br />
              <span className="text-[rgb(var(--color-accent))]">Collective Knowledge</span>.
            </h2>
            <p className="text-[rgb(var(--color-fg-subtle))] mb-8 leading-relaxed">
                Feel free to browse through public posts and explore active communities. 
                Get a taste of how others are mapping out complex subjects. 
                <br /><br />
                When you're ready to join the conversation, save your own maps, 
                or reach out to a new study partner, creating an account is just seconds away.
            </p>
            <ul className="space-y-4">
                <li className="reveal delay-100 flex items-center gap-3 font-medium">
                    <div className="w-6 h-6 rounded-full bg-[rgb(var(--color-success)/0.2)] text-[rgb(var(--color-success))] flex items-center justify-center"><Plus size={14} /></div>
                    Create and publish your own Mind Maps
                </li>
                <li className="reveal delay-200 flex items-center gap-3 font-medium">
                    <div className="w-6 h-6 rounded-full bg-[rgb(var(--color-success)/0.2)] text-[rgb(var(--color-success))] flex items-center justify-center"><Plus size={14} /></div>
                    Participate in Community Q&A
                </li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-20 px-6 text-center">
        <div className="reveal max-w-4xl mx-auto p-12 rounded-[2.5rem] bg-[rgb(var(--color-bg-soft))] border border-border shadow-2xl relative overflow-hidden">
          <h2 className="text-4xl font-bold mb-6 relative z-10">Start Your Journey</h2>
          <p className="text-lg mb-8 text-[rgb(var(--color-fg-muted))] relative z-10 font-medium max-w-xl mx-auto">
            Take the first step toward a more connected and visual way of learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link 
              href="/sign-up"
              className="px-10 py-4 rounded-2xl bg-[rgb(var(--color-accent))] text-[rgb(var(--color-accent-fg))] font-bold hover:scale-105 transition-all shadow-lg text-center"
            >
                Create Free Account
            </Link>
            <Link 
              href="/sign-in"
              className="px-10 py-4 rounded-2xl bg-[rgb(var(--color-bg))] border border-border text-[rgb(var(--color-fg))] font-bold hover:bg-[rgb(var(--color-bg-soft))] transition-all text-center"
            >
                Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, delayClass }: { icon: React.ReactNode, title: string, description: string, delayClass: string }) {
  return (
    <div className={`reveal ${delayClass} p-8 rounded-[2rem] bg-[rgb(var(--color-bg))] border border-border hover:border-[rgb(var(--color-accent)/0.5)] transition-all group shadow-sm hover:shadow-xl hover:-translate-y-2`}>
      <div className="w-14 h-14 rounded-2xl bg-[rgb(var(--color-bg-soft))] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-[rgb(var(--color-fg-muted))] leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
}