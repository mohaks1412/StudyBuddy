// app/(dashboard)/dashboard/[id]/friends/page.tsx
import NothingToSeeHere from "../../../components/NothingToSeeHere"
import FriendCard from "../../../components/friends/FriendCard"
import { friendService } from "@/services/friend.service"
import authService from "@/services/auth.service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { notFound } from "next/navigation"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { MessageCircle, Plus } from "lucide-react"
import { redirect } from "next/navigation"
import { acceptRequest, removeFriend, declineRequest, startChat } from "@/app/(frontend)/actions/friend.action"

type FriendsPageProps = {
  params: { _id: string }
}

export default async function FriendsPage({ params }: FriendsPageProps) {
  const props = await params
  const profileUserId = props._id;

  const [user, session] = await Promise.all([
    authService.findUserById(profileUserId),
    getServerSession(authOptions),
  ])

  if (!user) notFound()
  const currentUserId = session?.user?._id
  const isOwner = currentUserId === user._id.toString()
  const isAuthenticated = !!currentUserId

  // --- PUBLIC DATA ---
  const friends = await friendService.getFriends(profileUserId) // ✅ Public friend list
  const incoming = isOwner && currentUserId 
    ? await friendService.getIncoming(currentUserId) 
    : [] // ✅ Owner-only incoming
    

  const hasPending = isOwner && incoming.length > 0
  const hasFriends = friends.length > 0

  return (
  <div className="space-y-8">
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[rgb(var(--color-border)/0.3)]">
            <div className="space-y-2">
              
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                Friends
              </h1>
              <p className="text-[rgb(var(--color-fg-muted))] font-medium">
                Connect and collaborate with your study buddies.
              </p>
            </div>
          </header>
    
    {/* ✅ PENDING REQUESTS - ALWAYS INDEPENDENT */}
    {hasPending && (
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[rgb(var(--color-accent))]">
          Incoming Requests
        </h2>
        <ul className="flex flex-col gap-3">
          {incoming.map((req: any) => (
            <FriendCard
              key={req._id}
              friend={req.from}
              status="pending"
              requestId={req._id}
              profileUserId={profileUserId}  // ✅ PASS IT!
              onAccept={acceptRequest}
              onDecline={declineRequest}
            />
          ))}
        </ul>
      </section>
    )}

    {/* ✅ FRIENDS - INDEPENDENT */}
    {!hasFriends ? (
      <div className="text-center py-20">
        <NothingToSeeHere />
        {!isOwner && <p>{user.username} hasn't added any friends yet.</p>}
      </div>
    ) : (
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[rgb(var(--color-accent))]">
          Friends
        </h2>
        <ul className="flex flex-col gap-3">
          {friends.map((friend: any) => (
            <FriendCard
              key={friend._id}
              friend={friend}
              status="accepted"
              profileUserId={profileUserId}  // ✅ PASS IT!
              onRemove={isOwner ? removeFriend : undefined}
              onChat={isOwner ? startChat : undefined}
            />
          ))}
        </ul>
      </section>
    )}

    {/* UNAUTH CTA - unchanged */}
  </div>
)
}
