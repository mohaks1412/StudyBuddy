// app/(dashboard)/components/FriendCard.tsx

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
  onAccept?: (formData: FormData) => undefined | Promise<void>
  onDecline?: (formData: FormData) => undefined | Promise<void>
  onRemove?: (formData: FormData) => undefined | Promise<void>
  onChat?: (formData: FormData) => undefined | Promise<void>
}

export default function FriendCard({
  friend,
  status,
  requestId,
  onAccept,
  onDecline,
  onRemove,
  onChat,
}: FriendCardProps) {
  return (
    <li className="w-full">
      <div className="flex w-full items-center justify-between gap-4 rounded-lg border border-gray-800 bg-gray-900/60 px-4 py-3 hover:border-teal-500 transition-colors">
        {/* Left: avatar + text */}
        <a
          href={`/dashboard/${friend._id}`}
          className="flex min-w-0 items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold">
            {friend.name[0]?.toUpperCase() ?? friend.username[0]?.toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{friend.name}</div>
            <div className="truncate text-xs text-gray-400">
              @{friend.username}
            </div>
            {(friend.college || friend.major) && (
              <div className="truncate text-[11px] text-gray-500">
                {[friend.college, friend.major].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>
        </a>

        {/* Right: actions */}
        <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2">
          {status === "pending" && requestId && (
            <>
              {onAccept && (
                <form action={onAccept}>
                  <input type="hidden" name="requestId" value={requestId} />
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs rounded-full bg-teal-600 hover:bg-teal-700 text-white font-medium"
                  >
                    Accept
                  </button>
                </form>
              )}

              {onDecline && (
                <form action={onDecline}>
                  <input type="hidden" name="requestId" value={requestId} />
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs rounded-full bg-gray-700 hover:bg-gray-600 text-gray-100 font-medium"
                  >
                    Decline
                  </button>
                </form>
              )}
            </>
          )}

          {status === "accepted" && (
            <>
              {onChat && (
                <form action={onChat}>
                  <input type="hidden" name="friendId" value={friend._id} />
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs rounded-full bg-teal-700 hover:bg-teal-600 text-white font-medium"
                  >
                    Chat
                  </button>
                </form>
              )}

              {onRemove && (
                <form action={onRemove}>
                  <input type="hidden" name="friendId" value={friend._id} />
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs rounded-full bg-red-700 hover:bg-red-600 text-white font-medium"
                  >
                    Remove
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </li>
  )
}
