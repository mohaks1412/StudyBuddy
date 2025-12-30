// components/post/DeletePostButton.tsx
"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { ConfirmOverlay } from "../ConfirmOverlay";
import { deletePostAction } from "@/app/(frontend)/actions/deletePostAction";
import { CornerLoadingOverlay } from "../BlobWaiting";

export function DeletePostButton({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      {/* STUDIO TRIGGER BUTTON */}
      <CornerLoadingOverlay isVisible={loading}/>
      <button
        onClick={() => setOpen(true)}
        className="
          group flex items-center gap-2 px-5 py-2.5 rounded-xl
          bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border)/0.5)]
          text-sm font-bold text-[rgb(var(--color-fg-muted))]
          hover:text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger)/0.05)]
          hover:border-[rgb(var(--color-danger)/0.2)]
          transition-all duration-300 active:scale-95
        "
        title="Remove this post"
      >
        <Trash2 size={16} className="transition-transform group-hover:rotate-12" />
        <span>Delete</span>
      </button>

      {/* REFINED OVERLAY */}
      <ConfirmOverlay
        open={open}
        title="Delete Permanently?"
        description={
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[rgb(var(--color-danger)/0.05)] border border-[rgb(var(--color-danger)/0.1)]">
              <AlertTriangle className="w-5 h-5 text-[rgb(var(--color-danger))] shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-[rgb(var(--color-fg-muted))] leading-relaxed">
                This will remove the post and all associated contributions. This action is <span className="text-[rgb(var(--color-danger))] font-black">irreversible</span>.
              </p>
            </div>
          </div>
        }
        cancelLabel="Discard Changes"
        onCancel={() => setOpen(false)}
        primaryLabel="Confirm Delete"
        primaryVariant="danger"
        primaryOnClick={async () => {
          setLoading(true);
          await deletePostAction(postId);
          setLoading(false);
        }}
      />
    </>
  );
}