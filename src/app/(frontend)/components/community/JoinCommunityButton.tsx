"use client";

import { useState, useTransition } from "react";
import { joinCommunityAction } from "@/app/(frontend)/actions/community.actions";
import { Loader2, Plus, Check } from "lucide-react";
import { CornerLoadingOverlay } from "../BlobWaiting";

export function JoinCommunityButton({ communityId }: { communityId: string }) {
  const [isPending, startTransition] = useTransition();
  const [isJoined, setIsJoined] = useState(false); // ✅ Track success state

  const handleJoin = () => {
    startTransition(async () => {
      const res = await joinCommunityAction(communityId);
      if (res.ok) {
        setIsJoined(true); // ✅ Success → show joined state
      }
      // No error state → no flash
    });
  };

  // ✅ Show success state instead of original button
  if (isJoined) {
    return (
      <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 font-black uppercase tracking-widest text-sm animate-in fade-in duration-500">
        <Check className="w-4 h-4" />
        <span>Joined!</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-3 animate-in fade-in duration-500">
      <CornerLoadingOverlay isVisible={isPending}/>
      <button
        type="button"
        onClick={handleJoin}
        disabled={isPending}
        className={`
          group relative flex items-center gap-2 px-8 py-3.5 rounded-2xl
          text-sm font-black uppercase tracking-widest transition-all duration-300
          shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed
          ${isPending 
            ? "bg-[rgb(var(--color-bg-strong)/0.2)] text-[rgb(var(--color-fg-muted))]" 
            : "bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] hover:bg-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-fg))] shadow-[rgb(var(--color-fg)/0.1)] hover:shadow-[rgb(var(--color-accent)/0.3)]"}
        `}
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Joining...</span>
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>Join Community</span>
          </>
        )}
      </button>
    </div>
  );
}
