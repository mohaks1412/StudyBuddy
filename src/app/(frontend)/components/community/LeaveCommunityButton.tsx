// components/community/LeaveCommunityButton.tsx
"use client";

import { useState, useTransition } from "react";
import { ConfirmOverlay } from "../ConfirmOverlay"; 
import { leaveCommunityAction } from "@/app/(frontend)/actions/community.actions";
import { LogOut, Loader2 } from "lucide-react";
import { CornerLoadingOverlay } from "../BlobWaiting";

export function LeaveCommunityButton({ communityId }: { communityId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleLeave = () => {
    setError(null);
    startTransition(async () => {
      const res = await leaveCommunityAction(communityId);
      // Logic preserved: if action redirects, this never runs
      if (res && !res.ok) {
        setError(res.error);
        // Note: keeping modal open if there is an error so user can see why
      }
    });
  };

  return (
    <>
      {/* 1. STUDIO TRIGGER BUTTON */}
      <CornerLoadingOverlay isVisible={isPending}/>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          group flex items-center gap-2 px-8 py-3.5 rounded-2xl
          bg-[rgb(var(--color-bg-soft)/0.5)] border border-[rgb(var(--color-border)/0.5)]
          text-[rgb(var(--color-fg-muted))] hover:text-[rgb(var(--color-danger))]
          hover:bg-[rgb(var(--color-danger)/0.05)] hover:border-[rgb(var(--color-danger)/0.2)]
          text-sm font-black uppercase tracking-widest transition-all duration-300
          active:scale-95
        "
      >
        <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Leave Community</span>
      </button>

      {/* 2. REFINED OVERLAY */}
      <ConfirmOverlay
        open={open}
        title="Leave Community?"
        description={
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[rgb(var(--color-fg-muted))] leading-relaxed">
                You will be removed from this community and will no longer see its posts in your feed.
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50">
                Admin Note: If you are the only admin, you must assign another before leaving.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[rgb(var(--color-danger)/0.1)] border border-[rgb(var(--color-danger)/0.2)]">
                <p className="text-xs font-bold text-[rgb(var(--color-danger))] uppercase tracking-tight">
                  Error: {error}
                </p>
              </div>
            )}
          </div>
        }
        onCancel={() => !isPending && setOpen(false)}
        cancelLabel="Keep Membership"
        primaryLabel={isPending ? "Processing..." : "Confirm Leave"}
        primaryOnClick={handleLeave}
        primaryVariant="danger"
      />
    </>
  );
}