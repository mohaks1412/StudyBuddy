"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { AlertCircle, X } from "lucide-react";

type ConfirmOverlayProps = {
  open: boolean;
  title?: string;
  description?: ReactNode;
  onCancel?: () => void;
  cancelLabel?: string;

  // Main action can be either a button (with onClick)
  // or a <Link> to navigate to a route.
  primaryLabel: string;
  primaryOnClick?: () => void;
  primaryHref?: string;
  primaryVariant?: "danger" | "primary";
};

export function ConfirmOverlay({
  open,
  title = "Are you sure?",
  description,
  onCancel,
  cancelLabel = "Cancel",
  primaryLabel,
  primaryOnClick,
  primaryHref,
  primaryVariant = "primary",
}: ConfirmOverlayProps) {
  if (!open) return null;

  // Logic: Maintain your variant check but map to the new theme variables
  const primaryClasses =
    primaryVariant === "danger"
      ? "bg-[rgb(var(--color-danger))] text-[rgb(var(--color-danger-fg))] hover:brightness-110 shadow-[rgb(var(--color-danger)/0.2)]"
      : "bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] hover:bg-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-fg))] shadow-[rgb(var(--color-fg)/0.1)]";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop: Logic for onCancel preserved */}
      <div 
        className="absolute inset-0 bg-[rgb(var(--color-bg)/0.6)] backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onCancel}
      />

      {/* Modal Container: Updated to Studio Squircle aesthetic */}
      <div className="relative w-full max-w-md rounded-[2.5rem] bg-[rgb(var(--color-bg))] border border-[rgb(var(--color-border)/0.5)] p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Visual Header */}
        <div className="flex items-center justify-between mb-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            primaryVariant === "danger" 
              ? "bg-[rgb(var(--color-danger)/0.1)] text-[rgb(var(--color-danger))]" 
              : "bg-[rgb(var(--color-accent)/0.1)] text-[rgb(var(--color-accent))]"
          }`}>
            <AlertCircle className="w-6 h-6" />
          </div>
          <button 
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-[rgb(var(--color-bg-soft))] text-[rgb(var(--color-fg-subtle))] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {title && (
          <h2 className="text-2xl font-black text-[rgb(var(--color-fg))] tracking-tight mb-2">
            {title}
          </h2>
        )}

        {description && (
          <div className="text-sm font-medium text-[rgb(var(--color-fg-muted))] leading-relaxed mb-8">
            {description}
          </div>
        )}

        {/* Action Logic: Buttons vs Link preserved */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border)/0.5)] text-[rgb(var(--color-fg-muted))] hover:text-[rgb(var(--color-fg))] text-sm font-bold transition-all active:scale-95"
          >
            {cancelLabel}
          </button>

          {primaryHref ? (
            <Link
              href={primaryHref}
              className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all text-center active:scale-95 shadow-lg ${primaryClasses}`}
            >
              {primaryLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={primaryOnClick}
              className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg ${primaryClasses}`}
            >
              {primaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}