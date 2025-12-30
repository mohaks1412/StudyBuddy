"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NothingToSeeHere() {
  return (
    <div className="flex h-full min-h-[450px] w-full items-center justify-center text-center animate-in fade-in duration-1000">
      <style jsx>{`
        @keyframes eye-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes look-around {
          0%, 30%, 100% { transform: translate(0, 0); }
          40%, 55% { transform: translate(8px, -3px); } 
          65%, 80% { transform: translate(-8px, 2px); } 
        }
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .blink {
          animation: eye-blink 4s infinite;
        }
        .look {
          animation: look-around 7s ease-in-out infinite;
        }
        .float {
          animation: gentle-float 6s ease-in-out infinite;
        }
      `}</style>

      <div className="flex flex-col items-center justify-center px-10 py-16">
        
        {/* Animated Eyes */}
        <div className="flex gap-6 mb-12 float">
          {[1, 2].map((i) => (
            <div 
              key={i} 
              className="relative w-24 h-24 bg-white border-2 border-[rgb(var(--color-border)/0.3)] rounded-[2.5rem] flex items-center justify-center shadow-2xl z-10 overflow-hidden"
              style={{ boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.05)' }}
            >
              {/* Eyelid container */}
              <div className="relative w-12 h-12 flex items-center justify-center blink">
                {/* Pupil (Theme Color) */}
                <div className="relative w-8 h-8 bg-[rgb(var(--color-accent))] rounded-full look shadow-inner">
                    {/* The Shine */}
                    <div className="absolute top-1.5 left-2 w-2.5 h-2.5 bg-white/90 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Updated Studio Text */}
        <div className="space-y-6 max-w-sm">

          
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-[rgb(var(--color-fg))] leading-none">
              Nothing to see <span className="text-[rgb(var(--color-fg-subtle))] opacity-30">here</span>
            </h2>
            <p className="text-sm font-medium text-[rgb(var(--color-fg-muted))] leading-relaxed max-w-[300px] mx-auto">
              We couldnt find any matching content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}