"use client";

import React from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  multiline?: boolean;
  className?: string;  // custom styles
}

// Keeping the original logic structure and props
export default function Input({
  label,
  error,
  multiline = false,
  className,
  readOnly,
  ...rest
}: InputProps) {
  // === STYLES ONLY MODIFIED FOR DARK MODE (TEAL/DARK GREY) ===
  const baseStyles =
    // Darker background, light text, soft border, modern padding
    "w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-md";

  const computedStyles = clsx(
    baseStyles,
    // Read Only State
    readOnly && "bg-gray-700 cursor-not-allowed opacity-75",
    // Error State
    error && "border-red-500 focus:ring-red-500 focus:border-red-500",
    className // allow overrides
  );
  // ==========================================================

  return (
    // Updated container styles for dark mode text and modern spacing
    <div className="space-y-2"> 
      {/* Updated label to use the teal accent color */}
      {label && <label className="text-sm font-semibold text-teal-400">{label}</label>}

      {multiline ? (
        <textarea
          className={computedStyles}
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

      {/* Updated error text color for dark mode readability */}
      {error && <p className="text-xs font-medium text-red-400">{error}</p>}
    </div>
  );
}