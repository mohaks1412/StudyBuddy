// app/(frontend)/communities/[_id]/MembersOverlay.tsx
"use client";

import { useState } from "react";
import { ConfirmOverlay } from "../ConfirmOverlay";
import { PromoteButton } from "./PromoteButton";
import { Users, ShieldCheck } from "lucide-react";

type Props = {
  communityId: string;
  members: Array<{
    _id: string;
    username?: string;
    email?: string;
    avatar?: string;
  }>;
  admins: Array<{ 
    _id: string;
    username?: string;
    email?: string;
  }>;
};

export function MembersOverlay({ communityId, members, admins }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 1. TRIGGER SECTION */}
      <div className="bg-[rgb(var(--color-bg-soft)/0.4)] border border-[rgb(var(--color-border)/0.5)] rounded-[2rem] p-4 transition-all hover:border-[rgb(var(--color-accent)/0.5)]">
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] hover:bg-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-fg))] rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 group"
        >
          <Users className="w-4 h-4 transition-transform group-hover:scale-110" />
          Manage Members ({members.length})
        </button>
      </div>

      {/* 2. OVERLAY MODAL */}
      <ConfirmOverlay
        open={open}
        title="Community Members"
        description={
          <div className="max-h-80 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {members.map((member) => {
              const alreadyAdmin = admins.some(
                (admin: any) => admin._id?.toString() === member._id.toString()
              );

              const name = member.username || member.email?.split("@")[0] || "Unknown";

              return (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[rgb(var(--color-bg-soft)/0.3)] border border-[rgb(var(--color-border)/0.3)] transition-all hover:bg-[rgb(var(--color-bg-soft)/0.6)] group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Squircle Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-bg-strong)/0.2)] border border-[rgb(var(--color-border)/0.5)] flex items-center justify-center text-xs font-black text-[rgb(var(--color-accent))] flex-shrink-0 transition-transform group-hover:rotate-3">
                      {member.username?.slice(0, 2).toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[rgb(var(--color-fg))] truncate group-hover:text-[rgb(var(--color-accent))] transition-colors">
                        {name}
                      </p>
                      {alreadyAdmin && (
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[rgb(var(--color-success))] mt-0.5">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Admin</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!alreadyAdmin && (
                    <div className="ml-2 animate-in fade-in zoom-in-95">
                        <PromoteButton
                          communityId={communityId}
                          userId={member._id.toString()}
                          username={name}
                        />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        }
        onCancel={() => setOpen(false)}
        cancelLabel="Close"
        primaryLabel="Done"
        primaryOnClick={() => setOpen(false)}
        primaryVariant="primary"
      />
    </>
  );
}