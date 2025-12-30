// components/ui/Button.tsx
"use client";

import React from "react";
import clsx from "clsx";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "destructive";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
  href?: string;
}

export default function Button({
  variant = "primary",
  size = "md",
  asChild = false,
  href,
  className,
  children,
  ...props
}: ButtonProps) {
  // 1. BASE STUDIO STYLES
  // High-weight uppercase text and tight tracking are hallmarks of the studio look
  const baseStyles = clsx(
    "inline-flex items-center justify-center font-black uppercase tracking-[0.2em] transition-all duration-300",
    "focus:outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
  );

  // 2. THEME-AWARE VARIANTS
  const variants = {
    // Primary: High contrast (Foreground color on Background)
    primary: clsx(
      "bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] rounded-2xl",
      "hover:bg-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-fg))]",
      "shadow-xl shadow-[rgb(var(--color-fg)/0.1)] hover:shadow-[rgb(var(--color-accent)/0.3)]"
    ),
    // Outline: "Ghost" style glassmorphism
    outline: clsx(
      "bg-[rgb(var(--color-bg-soft)/0.5)] border border-[rgb(var(--color-border)/0.5)] rounded-2xl backdrop-blur-sm",
      "text-[rgb(var(--color-fg-muted))] hover:text-[rgb(var(--color-fg))] hover:bg-[rgb(var(--color-bg-strong)/0.5)] hover:border-[rgb(var(--color-border))]"
    ),
    // Destructive: Minimalist danger state
    destructive: clsx(
      "bg-[rgb(var(--color-danger))] text-[rgb(var(--color-danger-fg))] rounded-2xl",
      "hover:brightness-110 shadow-lg shadow-[rgb(var(--color-danger)/0.2)]"
    )
  };

  // 3. STUDIO SIZING
  const sizes = {
    sm: "px-5 py-2 text-[10px] h-9",
    md: "px-8 py-3.5 text-xs h-12",
    lg: "px-10 py-4.5 text-sm h-14"
  };

  const computedStyles = clsx(
    baseStyles,
    variants[variant],
    sizes[size],
    className
  );

  // Logic: Handling Link vs Button preserved
  const content = children;

  if (href) {
    return (
      <Link href={href} className={computedStyles}>
        {content}
      </Link>
    );
  }

  return (
    <button className={computedStyles} {...props}>
      {content}
    </button>
  );
}