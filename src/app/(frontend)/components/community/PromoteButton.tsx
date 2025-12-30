// components/community/PromoteButton.tsx
"use client";

import { useState, useTransition } from "react";
import { ConfirmOverlay } from "../../components/ConfirmOverlay";
import { promoteToAdminAction } from "@/app/(frontend)/actions/community.actions";
import { ShieldPlus, Loader2 } from "lucide-react";
import { CornerLoadingOverlay } from "../BlobWaiting";

type Props = {
  communityId: string;
  userId: string;
  username?: string;
};

export function PromoteButton({ communityId, userId, username }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onConfirm = () => {
    setError(null);
    startTransition(async () => {
      const res = await promoteToAdminAction(communityId, userId);
      if (!res.ok) {
        setError(res.error);
        setOpen(false);
      } else {
        window.location.reload();
      }
    });
  };

  return (
    <>
    <CornerLoadingOverlay isVisible = {isPending} />
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          flex items-center gap-1.5 px-3 py-1.5 rounded-xl
          bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border)/0.5)]
          text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-fg-muted))]
          hover:text-[rgb(var(--color-accent))] hover:border-[rgb(var(--color-accent)/0.5)]
          transition-all duration-300 active:scale-95
        "
      >
        <ShieldPlus className="w-3 h-3" />
        <span>Promote</span>
      </button>

      <ConfirmOverlay
        open={open}
        title="Elevate Permissions?"
        description={
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-[rgb(var(--color-fg-muted))] leading-relaxed">
                <span className="text-[rgb(var(--color-fg))] font-black">{username || "This user"}</span> will gain administrative privileges. They will be able to manage members and edit community settings.
              </p>
            </div>
            
            {error && (
              <div className="p-3 rounded-xl bg-[rgb(var(--color-danger)/0.1)] border border-[rgb(var(--color-danger)/0.2)]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-danger))]">
                  Error: {error}
                </p>
              </div>
            )}
          </div>
        }
        onCancel={() => !isPending && setOpen(false)}
        cancelLabel="Dismiss"
        primaryLabel={isPending ? "Updating..." : "Confirm Promotion"}
        primaryOnClick={onConfirm}
        primaryVariant="primary"
      />
    </>
  );
}