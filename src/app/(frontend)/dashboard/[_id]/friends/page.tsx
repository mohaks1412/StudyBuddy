// app/(dashboard)/dashboard/[id]/friends/page.tsx
import NothingToSeeHere from "../../../components/NothingToSeeHere"
import FriendCard from "../../../components/friends/FriendCard"
import { friendService } from "@/services/friend.service"
import authService from "@/services/auth.service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { notFound, redirect } from "next/navigation"
// app/(dashboard)/dashboard/[id]/friends/page.tsx
import { revalidatePath } from "next/cache"


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
  const incoming =
    isOwner && currentUserId
      ? await friendService.getIncoming(currentUserId)
      : []

  async function removeFriend(formData: FormData) {
    "use server"
    const friendId = formData.get("friendId") as string
    const currentSession = await getServerSession(authOptions)
    if (!currentSession?.user?._id) redirect("/login")
    await friendService.removeFriend(currentSession.user._id, friendId)
  
   revalidatePath(`/dashboard/${profileUserId}/friends`)
  }

  async function startChat(formData: FormData) {
    "use server"
    const friendId = formData.get("friendId") as string
    redirect(`/chat/${friendId}`)
    
    revalidatePath(`/dashboard/${profileUserId}/friends`)
  }

  async function acceptRequest(formData: FormData) {
    "use server"
    const requestId = formData.get("requestId") as string
    const currentSession = await getServerSession(authOptions)
    if (!currentSession?.user?._id) redirect("/login")
    await friendService.respondRequest(requestId, true)
  
  revalidatePath(`/dashboard/${profileUserId}/friends`)
  }

  async function declineRequest(formData: FormData) {
    "use server"
    const requestId = formData.get("requestId") as string
    const currentSession = await getServerSession(authOptions)
    if (!currentSession?.user?._id) redirect("/login")
    await friendService.respondRequest(requestId, false)
  
  revalidatePath(`/dashboard/${profileUserId}/friends`)
  }

  const hasPending = isOwner && incoming.length > 0
  const hasFriends = friends.length > 0

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {user.username}&apos;s friends
        </h1>
        <p className="text-sm text-gray-400">
          {friends.length} friend{friends.length === 1 ? "" : "s"}
        </p>
      </header>

      {!hasPending && !hasFriends ? (
        <NothingToSeeHere />
      ) : (
        <>
          {hasPending && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-300">
                Pending requests
              </h2>
              <ul className="flex flex-col gap-3">
                {incoming.map((req: any) => (
                  <FriendCard
                    key={req._id}
                    friend={req.from}
                    status="pending"
                    requestId={req._id}
                    onAccept={acceptRequest}
                    onDecline={declineRequest}
                  />
                ))}
              </ul>
            </section>
          )}

          {hasFriends && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-300">Friends</h2>
              <ul className="flex flex-col gap-3">
                {friends.map((friend: any) => (
                  <FriendCard
                    key={friend._id}
                    friend={friend}
                    status="accepted"
                    onRemove={isOwner ? removeFriend : undefined}
                    onChat={isOwner ? startChat : undefined}
                  />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
