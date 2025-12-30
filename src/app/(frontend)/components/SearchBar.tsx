"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, Command } from "lucide-react";

interface DebouncedSearchBarProps {
  placeholder?: string;
  debounceDelay?: number;
  className?: string;
}

export default function DebouncedSearchBar({
  placeholder = "Search communities...",
  debounceDelay = 400,
  className,
}: DebouncedSearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchValue.trim()) params.set("q", searchValue);
      else params.delete("q");

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, debounceDelay);

    return () => clearTimeout(id);
  }, [searchValue, debounceDelay, router, pathname, searchParams]);

  const clearSearch = useCallback(() => setSearchValue(""), []);

  return (
    <div className={`relative w-full max-w-2xl mx-auto transition-all duration-500 ${isFocused ? 'scale-[1.01]' : 'scale-100'} ${className ?? ""}`}>
      
      {/* GLOW EFFECT (Hidden when not focused) */}
      <div className={`absolute -inset-1 bg-gradient-to-r from-[rgb(var(--color-accent)/0.4)] to-[rgb(var(--color-success)/0.4)] rounded-2xl blur-xl opacity-0 transition-opacity duration-500 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />

      <div className="group relative">
        <div
          className={`
            relative flex items-center
            rounded-2xl
            bg-[rgb(var(--color-bg-soft)/0.8)] backdrop-blur-xl
            border transition-all duration-300
            ${isFocused 
              ? "border-[rgb(var(--color-accent))] shadow-2xl shadow-[rgb(var(--color-accent)/0.1)]" 
              : "border-[rgb(var(--color-border)/0.6)] shadow-sm"}
          `}
        >
          {/* Leading Icon Container */}
          <div className="pl-5 flex items-center justify-center">
            <Search
              className={`
                h-5 w-5 transition-colors duration-300
                ${isFocused ? "text-[rgb(var(--color-accent))]" : "text-[rgb(var(--color-fg-muted))]/60"}
              `}
            />
          </div>

          {/* Input Field */}
          <input
            type="text"
            value={searchValue}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={placeholder}
            className="
              w-full bg-transparent
              py-4 px-4
              text-base md:text-lg
              font-medium tracking-tight
              text-[rgb(var(--color-fg))]
              placeholder:text-[rgb(var(--color-fg-muted))]/50
              focus:outline-none
            "
          />

          {/* Right Section (Clear button or Shortcut hint) */}
          <div className="pr-4 flex items-center gap-2">
            {searchValue ? (
              <button
                type="button"
                onClick={clearSearch}
                className="
                  p-1.5 rounded-lg
                  bg-[rgb(var(--color-bg-strong)/0.1)]
                  text-[rgb(var(--color-fg-muted))]
                  hover:bg-[rgb(var(--color-danger)/0.1)] hover:text-[rgb(var(--color-danger))]
                  transition-all active:scale-90
                "
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md border border-[rgb(var(--color-border)/0.5)] bg-[rgb(var(--color-bg)/0.5)]">
                <Command className="w-3 h-3 text-[rgb(var(--color-fg-muted))]" />
                <span className="text-[xs] font-bold text-[rgb(var(--color-fg-muted))] uppercase">K</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}