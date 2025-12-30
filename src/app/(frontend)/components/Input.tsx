"use client";

import React from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  multiline?: boolean;
  className?: string;
}

export default function Input({
  label,
  error,
  multiline = false,
  className,
  readOnly,
  ...rest
}: InputProps) {
  
  // === STYLES UPDATED TO USE GLOBAL THEME VARIABLES ===
  const baseStyles = clsx(
    "w-full px-4 py-3 rounded-xl text-base transition-all duration-300 shadow-sm outline-none",
    "bg-[rgb(var(--color-bg-soft)/0.5)] border border-[rgb(var(--color-border)/0.6)] text-[rgb(var(--color-fg))]",
    "placeholder:text-[rgb(var(--color-fg-muted)/0.4)]",
    "focus:ring-2 focus:ring-[rgb(var(--color-accent)/0.2)] focus:border-[rgb(var(--color-accent))]"
  );

  const computedStyles = clsx(
    baseStyles,
    // Read Only State - Logic Unchanged
    readOnly && "bg-[rgb(var(--color-bg-strong)/0.1)] cursor-not-allowed opacity-60 grayscale",
    // Error State - Logic Unchanged
    error && "border-[rgb(var(--color-danger))] focus:ring-[rgb(var(--color-danger)/0.2)] focus:border-[rgb(var(--color-danger))]",
    className
  );

  return (
    <div className="group space-y-2 w-full"> 
      {/* Label styled with theme-aware accent color */}
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[rgb(var(--color-accent))] ml-1">
          {label}
        </label>
      )}

      {multiline ? (
        <textarea
          rows={4}
          className={clsx(computedStyles, "resize-none min-h-[120px]")}
          readOnly={readOnly}
          {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          className={computedStyles}
          readOnly={readOnly}
          {...rest}
        />
      )}

      {/* Error text using theme danger color */}
      {error && (
        <p className="text-xs font-bold text-[rgb(var(--color-danger))] ml-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}