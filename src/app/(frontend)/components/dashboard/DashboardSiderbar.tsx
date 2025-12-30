// components/dashboard/Sidebar.tsx (Renamed UX)
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  User, Users, BookOpen, 
  Plus, Sparkles, Layout,
  ChevronUp
} from "lucide-react";

type SidebarProps = {
  userId: string;
}

export default function FloatingDock({ userId }: SidebarProps) {
  const pathname = usePathname();
  const [showPosts, setShowPosts] = useState(false);

  // LOGIC PRESERVED WORD-FOR-WORD
  const mainItems = [
    { href: `/dashboard/${userId}`, label: "Personal Details", icon: User },
    { href: `/dashboard/${userId}/friends`, label: "Friends", icon: Users }, // Using Users icon to stay sleek
  ]

  const postItems = [
    { href: `/dashboard/${userId}/posts/all`, label: "All Posts" },
    { href: `/dashboard/${userId}/posts/question`, label: "Questions" },
    { href: `/dashboard/${userId}/posts/answer`, label: "Answers" },
    { href: `/dashboard/${userId}/posts/notes`, label: "Notes" },
    { href: `/dashboard/${userId}/posts/question-paper`, label: "Question Papers" },
  ]

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-fit">
      
      {/* POSTS SUB-MENU (Flyout) */}
      {showPosts && (
        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-56 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[rgb(var(--color-bg-soft)/0.9)] backdrop-blur-xl border border-[rgb(var(--color-border)/0.5)] rounded-3xl p-3 shadow-2xl">
            <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-fg-subtle))] opacity-60">
              Content Library
            </p>
            <div className="space-y-1">
              {postItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowPosts(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-bold text-[rgb(var(--color-fg-muted))] hover:bg-[rgb(var(--color-bg-strong)/0.2)] hover:text-[rgb(var(--color-fg))] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MAIN DOCK */}
      <nav className="flex items-center gap-1.5 p-2 rounded-[2.5rem] bg-[rgb(var(--color-bg-soft)/0.8)] backdrop-blur-xl border border-[rgb(var(--color-border)/0.5)] shadow-2xl shadow-black/20">
        
        {/* Dynamic Nav Links */}
        <div className="flex items-center gap-1">
          {mainItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative group flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300
                  ${active 
                    ? "bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))]" 
                    : "text-[rgb(var(--color-fg-muted))] hover:bg-[rgb(var(--color-bg-strong)/0.2)] hover:text-[rgb(var(--color-fg))]"}
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{item.label}</span>
                
                {/* Active Indicator Dot */}
                {active && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[rgb(var(--color-accent))] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[rgb(var(--color-accent))]"></span>
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Content Toggle */}
        <button
          onClick={() => setShowPosts(!showPosts)}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all
            ${showPosts 
              ? "bg-[rgb(var(--color-accent))] text-[rgb(var(--color-accent-fg))]" 
              : "text-[rgb(var(--color-fg-muted))] hover:bg-[rgb(var(--color-bg-strong)/0.2)]"}
          `}
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden md:inline">Posts</span>
          <ChevronUp className={`w-3 h-3 transition-transform duration-300 ${showPosts ? "rotate-180" : ""}`} />
        </button>

      </nav>
    </div>
  );
}