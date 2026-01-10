// app/(dashboard)/dashboard/[id]/friends/page.tsx
import NothingToSeeHere from "../../../components/NothingToSeeHere"
import FriendCard from "../../../components/friends/FriendCard"
import { friendService } from "@/services/friend.service"
import authService from "@/services/auth.service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { notFound } from "next/navigation"
import ScrollRevealWrapper from "@/app/(frontend)/components/ScrollRevealWrapper" // Import Wrapper
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

  const friends = await friendService.getFriends(profileUserId)
  const incoming = isOwner && currentUserId 
    ? await friendService.getIncoming(currentUserId) 
    : [] 

  const hasPending = isOwner && incoming.length > 0
  const hasFriends = friends.length > 0

  return (
    <ScrollRevealWrapper>
      <div className="space-y-12">
        {/* HEADER */}
        <header className="reveal flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[rgb(var(--color-border)/0.3)]">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight block bg-gradient-to-r from-[rgb(var(--color-accent))] via-[rgb(var(--color-fg-muted))] to-[rgb(var(--color-accent))] bg-clip-text text-transparent">
              Friends
            </h1>
            <p className="text-[rgb(var(--color-fg-muted))] font-medium">
              Connect and collaborate with your study buddies.
            </p>
          </div>
        </header>
    
        {/* PENDING REQUESTS */}
        {hasPending && (
          <section className="reveal delay-100 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-[rgb(var(--color-accent))] px-1">
              Incoming Requests
            </h2>
            <ul className="flex flex-col gap-3">
              {incoming.map((req: any, index: number) => (
                <li key={req._id} className={`reveal delay-${(index + 1) * 100}`}>
                  <FriendCard
                    friend={req.from}
                    status="pending"
                    requestId={req._id}
                    profileUserId={profileUserId}
                    onAccept={acceptRequest}
                    onDecline={declineRequest}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FRIENDS LIST */}
        <section className="reveal delay-200 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-[rgb(var(--color-accent))] px-1">
            All Friends
          </h2>
          {!hasFriends ? (
            <div className="reveal delay-300 text-center py-20 bg-[rgb(var(--color-bg-soft)/0.3)] rounded-[2rem] border border-dashed border-border">
              <NothingToSeeHere />
              {!isOwner && <p className="mt-4 text-[rgb(var(--color-fg-muted))]">{user.username} hasn't added any friends yet.</p>}
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {friends.map((friend: any, index: number) => (
                <li key={friend._id} className={`reveal delay-${(index + 1) * 100}`}>
                  <FriendCard
                    friend={friend}
                    status="accepted"
                    profileUserId={profileUserId}
                    onRemove={isOwner ? removeFriend : undefined}
                    onChat={isOwner ? startChat : undefined}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </ScrollRevealWrapper>
  )
}