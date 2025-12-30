// app/(dashboard)/components/FriendCard.tsx - FULL UI RESTORED

import Link from "next/link";
import { MessageSquare, UserMinus, Check, X } from "lucide-react";

type FriendStatus = "pending" | "accepted"

type Friend = {
  _id: string
  name: string
  username: string
  college?: string | null
  major?: string | null
}

type FriendCardProps = {
  friend: Friend
  status: FriendStatus
  requestId?: string
  profileUserId: string  // ✅ REQUIRED!
  onAccept?: (formData: FormData) => undefined | Promise<void>
  onDecline?: (formData: FormData) => undefined | Promise<void>
  onRemove?: (formData: FormData) => undefined | Promise<void>
  onChat?: (formData: FormData) => undefined | Promise<void>
}

export default function FriendCard({
  friend,
  status,
  requestId,
  profileUserId,
  onAccept,
  onDecline,
  onRemove,
  onChat,
}: FriendCardProps) {
  return (
    <li className="w-full group">
      <div className="flex w-full items-center justify-between gap-4 border-b border-[rgb(var(--color-border)/0.3)] bg-transparent px-2 py-4 transition-all hover:bg-[rgb(var(--color-bg-soft)/0.3)]">
        
        {/* ✅ LEFT: Avatar + Text Details - FULLY RESTORED */}
        <Link
          href={`/dashboard/${friend._id}`}
          className="flex min-w-0 items-center gap-4 no-underline"
        >
          {/* Studio Squircle Avatar */}
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgb(var(--color-bg-strong)/0.2)] border border-[rgb(var(--color-border)/0.5)] text-base font-black text-[rgb(var(--color-accent))] shadow-sm transition-transform group-hover:scale-105">
            {friend.name[0]?.toUpperCase() ?? friend.username[0]?.toUpperCase()}
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="truncate text-base font-bold text-[rgb(var(--color-fg))]">{friend.name}</div>
            <div className="truncate text-xs font-medium text-[rgb(var(--color-accent))]">{`@${friend.username}`}</div>
            {(friend.college || friend.major) && (
              <div className="truncate text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-fg-subtle))] opacity-60">
                {[friend.college, friend.major].filter(Boolean).join(" • ")}
              </div>
            )}
          </div>
        </Link>

        {/* ✅ RIGHT: Actions - WORKING WITH profileUserId */}
        <div className="flex flex-shrink-0 items-center justify-end gap-2">
          {status === "pending" && requestId && (
            <div className="flex items-center gap-2">
              {onAccept && (
                <form action={onAccept}>
                  <input type="hidden" name="requestId" value={requestId} />
                  <input type="hidden" name="profileUserId" value={profileUserId} />
                  <button
                    type="submit"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] transition-all hover:bg-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-fg))] shadow-sm active:scale-95"
                    title="Accept Request"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </form>
              )}

              {onDecline && (
                <form action={onDecline}>
                  <input type="hidden" name="requestId" value={requestId} />
                  <input type="hidden" name="profileUserId" value={profileUserId} />
                  <button
                    type="submit"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border)/0.5)] text-[rgb(var(--color-fg-muted))] transition-all hover:bg-[rgb(var(--color-danger)/0.1)] hover:text-[rgb(var(--color-danger))] active:scale-95"
                    title="Decline Request"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {status === "accepted" && (
            <div className="flex items-center gap-2">
              {onChat && (
                <form action={onChat}>
                  <input type="hidden" name="friendId" value={friend._id} />
                  <input type="hidden" name="profileUserId" value={profileUserId} />
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border)/0.5)] text-[rgb(var(--color-fg))] transition-all hover:bg-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-fg))] hover:border-transparent active:scale-95"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Chat</span>
                  </button>
                </form>
              )}

              {onRemove && (
                <form action={onRemove}>
                  <input type="hidden" name="friendId" value={friend._id} />
                  <input type="hidden" name="profileUserId" value={profileUserId} />
                  <button
                    type="submit"
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-[rgb(var(--color-fg-subtle))] opacity-40 transition-all hover:opacity-100 hover:bg-[rgb(var(--color-danger)/0.1)] hover:text-[rgb(var(--color-danger))] active:scale-95"
                    title="Remove Friend"
                  >
                    <UserMinus className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
