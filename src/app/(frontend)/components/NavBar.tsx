"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Users,
  MessageCircle,
  User,
  Compass,
  LogOut,
  Home,
  BookOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const root = document.documentElement;
      setIsDark(root.classList.contains('dark'));
    };

    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

interface NavItem {
  href: string;
  label: string;
  icon: any;
  exact?: boolean;
}

export default function NavBar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isDark = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAuthenticated = status === "authenticated";
  const userId = session?.user?._id;

  const navItems: NavItem[] = isAuthenticated
    ? [
        { href: "/posts", label: "Posts", icon: Home },
        { href: "/community/explore", label: "Communities", icon: Compass },
        { href: "/community/my", label: "My Communities", icon: Compass },
        { href: `/dashboard/${userId}/friends`, label: "Friends", icon: Users },
        { href: "/chat", label: "Messages", icon: MessageCircle },
        { href: `/dashboard/${userId}`, label: "Profile", icon: User },
      ]
    : [
        { href: "/posts", label: "Posts", icon: Home },
        { href: "/community/explore", label: "Explore", icon: Compass },
        { href: "/about", label: "About", icon: BookOpen },
      ];

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const logoHref = isAuthenticated ? `/dashboard/${userId}` : "/";

  // Hamburger Animation Variants
  const variant = mobileOpen ? "opened" : "closed";
  const topBar = {
    closed: { rotate: 0, y: 0 },
    opened: { rotate: 45, y: 6 },
  };
  const middleBar = {
    closed: { opacity: 1, x: 0 },
    opened: { opacity: 0, x: -20 },
  };
  const bottomBar = {
    closed: { rotate: 0, y: 0 },
    opened: { rotate: -45, y: -6 },
  };

  return (
    <nav className={`
      sticky top-0 z-50 transition-all duration-300
      ${scrolled 
        ? "bg-[rgb(var(--color-bg)/0.8)] backdrop-blur-xl border-b border-[rgb(var(--color-border)/0.5)] py-1.5 shadow-sm" 
        : "bg-transparent py-2"
      }
    `}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* ✅ MASSIVE LOGO */}
          <Link href={logoHref} className="group p-2">
            <img 
              src={`/${isDark ? 'LogoDark.png' : 'LogoLight.png'}`}
              alt="CereBro"
              className="
                w-28 h-28 
                object-contain 
                drop-shadow-[0_35px_60px_rgba(0,0,0,0.4)]
                group-hover:scale-110 
                group-hover:rotate-3
                transition-all duration-500 ease-out
              "
            />
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-1 bg-[rgb(var(--color-bg-soft)/0.5)] border border-[rgb(var(--color-border)/0.5)] p-1 rounded-2xl backdrop-blur-sm overflow-hidden">
            {navItems.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    relative flex items-center gap-2 px-4 py-1.5 rounded-xl
                    text-sm font-bold transition-all duration-200 whitespace-nowrap
                    ${active
                      ? "bg-[rgb(var(--color-bg))] text-[rgb(var(--color-accent))] shadow-sm"
                      : "text-[rgb(var(--color-fg-muted))] hover:text-[rgb(var(--color-fg))] hover:bg-[rgb(var(--color-bg-soft))]"
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "animate-pulse" : ""}`} />
                  {label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {isAuthenticated ? (
              <Link 
                href="/signout"
                className="
                  px-4 py-2 rounded-xl text-sm font-bold
                  text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger)/0.1)]
                  transition-all flex items-center justify-center gap-2 whitespace-nowrap
                "
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                Logout
              </Link>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/sign-in" className="px-4 py-2 rounded-xl text-sm font-bold text-[rgb(var(--color-fg))] hover:bg-[rgb(var(--color-bg-soft))] transition whitespace-nowrap">
                  Login
                </Link>
                <Link href="/sign-up" className="px-4 py-2 rounded-xl bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] text-sm font-bold shadow-md hover:scale-105 transition whitespace-nowrap">
                  Sign Up
                </Link>
              </div>
            )}

            {/* MOBILE HAMBURGER */}
            <button
              className="md:hidden p-2 rounded-xl bg-[rgb(var(--color-bg-soft))] text-[rgb(var(--color-fg))] border border-[rgb(var(--color-border)/0.5)] flex flex-col items-center justify-center gap-1 w-11 h-11 transition-all active:scale-90"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Menu"
            >
              <motion.div
                variants={topBar}
                animate={variant}
                transition={{ duration: 0.3 }}
                className="w-6 h-0.5 bg-current rounded-full origin-center"
              />
              <motion.div
                variants={middleBar}
                animate={variant}
                transition={{ duration: 0.3 }}
                className="w-6 h-0.5 bg-current rounded-full"
              />
              <motion.div
                variants={bottomBar}
                animate={variant}
                transition={{ duration: 0.3 }}
                className="w-6 h-0.5 bg-current rounded-full origin-center"
              />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="
              absolute top-full left-0 w-full md:hidden 
              bg-[rgb(var(--color-bg)/0.95)] backdrop-blur-2xl border-b border-[rgb(var(--color-border))]
              shadow-2xl py-4 px-4 space-y-1
            "
          >
            <div className="grid grid-cols-3 gap-1 mb-4">
              {navItems.slice(0, 3).map(({ href, icon: Icon, label, exact }) => {
                const active = isActive(href, exact);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`
                      flex flex-col items-center p-2 rounded-xl transition-all group overflow-hidden
                      ${active
                        ? "bg-[rgb(var(--color-accent)/0.2)] text-[rgb(var(--color-accent))] shadow-lg"
                        : "text-[rgb(var(--color-fg-muted))] hover:text-[rgb(var(--color-fg))] hover:bg-[rgb(var(--color-bg-soft))]"
                      }
                    `}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className={`w-5 h-5 mb-1 flex-shrink-0 ${active ? "animate-pulse" : ""}`} />
                    <span className="text-[10px] font-bold tracking-tight opacity-90 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {isAuthenticated && navItems.length > 3 && (
              <div className="space-y-2 mb-4">
                {navItems.slice(3).map(({ href, label, icon: Icon, exact }) => {
                  const active = isActive(href, exact);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`
                        flex items-center gap-3 w-full p-3 rounded-xl transition-all overflow-hidden
                        ${active
                          ? "bg-[rgb(var(--color-accent)/0.2)] text-[rgb(var(--color-accent))] shadow-md"
                          : "bg-[rgb(var(--color-bg-soft)/0.5)] hover:bg-[rgb(var(--color-accent)/0.1)]"
                        }
                      `}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-bold text-sm whitespace-nowrap">{label}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-[rgb(var(--color-border)/0.5)]">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[rgb(var(--color-bg-soft)/0.5)]">
                <span className="text-sm font-bold text-[rgb(var(--color-fg-muted))] tracking-tight whitespace-nowrap">Theme</span>
                <ThemeToggle />
              </div>

              {!isAuthenticated ? (
                <Link 
                  href="/sign-in" 
                  className="w-full block px-4 py-3 bg-[rgb(var(--color-accent)/0.1)] border border-[rgb(var(--color-accent)/0.3)] rounded-xl text-[rgb(var(--color-accent))] font-bold text-sm hover:bg-[rgb(var(--color-accent)/0.2)] transition-all text-center whitespace-nowrap"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
              ) : (
                <Link 
                  href="/signout"
                  className="
                    w-full px-4 py-3 rounded-xl text-sm font-bold
                    text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger)/0.1)]
                    transition-all flex items-center justify-center gap-2 whitespace-nowrap
                  "
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  Logout
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
