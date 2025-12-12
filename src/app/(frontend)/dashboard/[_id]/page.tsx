// app/dashboard/[_id]/page.tsx
import type { IUser } from "@/models/user.model"
import { notFound, redirect } from "next/navigation"
import authService from "../../../../services/auth.service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import Input from "@/app/(frontend)/components/Input"
import { friendService } from "@/services/friend.service"
import Link from "next/link"
import postService from "@/services/post.service"
import { revalidatePath } from "next/cache"

interface DashboardUserPageProps {
  params: { _id: string }
}

// --- Reusable Helper Components (Defined locally) ---

interface InfoDisplayProps {
    label: string;
    value: string | null | undefined;
    isMultiline?: boolean;
}

// Component to display read-only information cleanly
const InfoDisplay: React.FC<InfoDisplayProps> = ({ label, value, isMultiline = false }) => (
    <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/60 shadow-md">
        <p className="text-xs font-medium uppercase text-gray-500 mb-1">{label}</p>
        <p className={isMultiline ? "whitespace-pre-wrap text-base text-gray-200" : "text-base font-semibold text-gray-200"}>
            {value || "Not added yet"}
        </p>
    </div>
);

// --- Main Server Component (Logic Unchanged) ---

export default async function DashboardUserPage({ params }: DashboardUserPageProps) {
  const props = await params;
  const { _id } = props;

  // Execute concurrent data fetching (Logic Unchanged)
  const [friendCount, postCount, result, session] = await Promise.all([
    friendService.countFriends(_id),
    postService.countByAuthor(_id),
    authService.findUserById(_id) as Promise<IUser | null>,
    getServerSession(authOptions),
  ])

  if (!result) notFound()
  const user = result as IUser

  const currentUserId = session?.user?._id
  const isOwner = currentUserId === user._id.toString()

  let friendStatus: string = "rejected"
  if (currentUserId && !isOwner) {
    friendStatus = await friendService.getStatus(currentUserId, user._id.toString())
  }

  // SERVER ACTION: Update Profile (Logic Unchanged)
  async function updateProfile(formData: FormData) {
    "use server"

    const currentSession = await getServerSession(authOptions)
    if (!currentSession?.user?._id || currentSession.user._id !== user._id.toString()) {
      redirect(`/dashboard/${user._id}`)
    }

    const college = (formData.get("college") as string) || null
    const major = (formData.get("major") as string) || null
    const bio = (formData.get("bio") as string) || null

    await authService.updateUser(user._id.toString(), {
      college,
      major,
      bio,
    })

    redirect(`/dashboard/${user._id}`)
  }

  // SERVER ACTION: Send Friend Request (Logic Unchanged)
  async function sendFriendRequest() {
    "use server"

    const currentSession = await getServerSession(authOptions)
    if (!currentSession?.user?._id) return
    if (currentSession.user._id === user._id.toString()) return

    await friendService.sendRequest(currentSession.user._id, user._id.toString())
    
    revalidatePath(`/dashboard/${_id}`)
  }

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      
      {/* 1. HEADER SECTION (Profile, Actions, Stats) */}
      <header className="pb-8 border-b border-gray-800">
        <div className="flex items-start justify-between gap-6">
          
          {/* Avatar and Primary Details */}
          <div className="flex gap-6 items-center">
            <div className="w-24 h-24 rounded-full bg-teal-600/70 border-2 border-teal-500 flex items-center justify-center text-4xl font-extrabold text-white shadow-xl flex-shrink-0">
              {user.username[0]?.toUpperCase()}
            </div>
            
            <div>
              <h1 className="text-3xl font-extrabold text-white">{user.name}</h1>
              <p className="text-lg font-medium text-gray-400">@{user.username}</p>
              <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </p>

              {/* Friend Status Indicator (Logic Unchanged) */}
              {!isOwner && friendStatus === "accepted" && (
                <p className="mt-2 text-sm font-semibold text-emerald-400">
                  You are friends with {user.username}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats and MAIN ACTION BUTTON (Create Post or Send Request) */}
        <div className="mt-8 flex items-center justify-between">
            {/* Stats */}
            <div className="flex gap-8 text-lg font-medium">
                <div className="text-gray-300 flex items-center gap-2">
                    <span className="text-teal-400 text-2xl font-bold">{friendCount}</span>
                    <span className="text-sm text-gray-500">FRIENDS</span>
                </div>
                <div className="text-gray-300 flex items-center gap-2">
                    <span className="text-teal-400 text-2xl font-bold">{postCount}</span>
                    <span className="text-sm text-gray-500">POSTS</span>
                </div>
            </div>

            {/* MAIN ACTION BUTTON (Logic Unchanged) */}
            {isOwner ? (
                // OWNER: Create Post Button
                <Link
                    href={`/posts/new`}
                    className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors shadow-lg"
                >
                    + Create New Post
                </Link>
            ) : (
                // OTHER USER: Friend Action Button
                currentUserId && (
                    <>
                        {friendStatus === "rejected" && (
                            <form action={sendFriendRequest}>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-sm font-semibold transition-colors shadow-lg"
                                >
    
                                    Send Friend Request
                                </button>
                            </form>
                        )}
                        {friendStatus === "pending" && (
                            <button
                                type="button"
                                disabled
                                className="px-6 py-2.5 rounded-xl bg-gray-700 text-gray-400 text-sm font-semibold cursor-not-allowed border border-gray-600 shadow-md"
                            >
                                Request Pending
                            </button>
                        )}
                    </>
                )
            )}
        </div>
      </header>


            {/* 2. PROFILE DETAILS / EDIT FORM SECTION */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-teal-400 border-b border-gray-700 pb-2">
          Personal Information
        </h2>

        {isOwner ? (
          // OWNER VIEW: Editable tiles + readonly tiles
          <form action={updateProfile} className="grid gap-6 md:grid-cols-2">
            {/* Read-only tiles (name, email) */}
            <InfoDisplay label="Full Name" value={user.name} />
            <InfoDisplay label="Email" value={user.email} />

            {/* Editable tiles (same tile style as public) */}
            <div className="p-4 rounded-xl bg-gray-800/60 border border-gray-700 focus-within:ring-2 focus-within:ring-teal-500 transition-shadow">
              <Input
                label="College/University"
                name="college"
                defaultValue={user.college ?? ""}
              />
            </div>

            <div className="p-4 rounded-xl bg-gray-800/60 border border-gray-700 focus-within:ring-2 focus-within:ring-teal-500 transition-shadow">
              <Input
                label="Major/Field of Study"
                name="major"
                defaultValue={user.major ?? ""}
              />
            </div>

            <div className="p-4 rounded-xl bg-gray-800/60 border border-gray-700 focus-within:ring-2 focus-within:ring-teal-500 transition-shadow md:col-span-2">
              <Input
                label="Bio"
                name="bio"
                defaultValue={user.bio ?? ""}
                multiline
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg bg-teal-600 hover:bg-teal-700 text-white hover:shadow-teal-500/50"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          // PUBLIC VIEW: Same grid & tile feel, but all InfoDisplay
          <div className="grid gap-6 md:grid-cols-2">
            <InfoDisplay label="Full Name" value={user.name} />
            <InfoDisplay label="Email" value={user.email} />
            <InfoDisplay label="College/University" value={user.college} />
            <InfoDisplay label="Major/Field of Study" value={user.major} />
            <div className="md:col-span-2">
              <InfoDisplay
                label="Bio"
                value={user.bio ?? "This user hasn't written a bio yet."}
                isMultiline
              />
            </div>
          </div>
        )}
      </section>

      
    </div>
  )
}