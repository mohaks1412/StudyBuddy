// app/dashboard/[_id]/page.tsx
import { updateProfile, sendFriendRequest } from "../../actions/profile.actions"
import type { IUser } from "@/models/user.model"
import { notFound } from "next/navigation"
import authService from "../../../../services/auth.service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import Input from "@/app/(frontend)/components/Input"
import { friendService } from "@/services/friend.service"
import Link from "next/link"
import postService from "@/services/post.service"
import { revalidatePath } from "next/cache"
import { Mail, Plus, GraduationCap, Book, ArrowUpRight, Clock, Eye, EyeOff } from "lucide-react"

interface DashboardUserPageProps {
  params: { _id: string }
}

// --- Reusable Helper Component (Minimalist Style) ---
interface InfoDisplayProps {
  label: string;
  value: string | null | undefined;
  isMultiline?: boolean;
}

const InfoDisplay: React.FC<InfoDisplayProps> = ({ label, value, isMultiline = false }) => (
  <div className="py-4 border-b border-[rgb(var(--color-border)/0.3)] last:border-0">
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-fg-subtle))] mb-1">{label}</p>
    <p className={`${isMultiline ? "whitespace-pre-wrap text-sm leading-relaxed" : "text-base font-bold"} text-[rgb(var(--color-fg))]`}>
      {value || "Not added yet"}
    </p>
  </div>
);

export default async function DashboardUserPage({ params }: DashboardUserPageProps) {
  const props = await params;
  const { _id } = props;

  // --- PUBLIC DATA FETCHING ---
  const [friendCount, postCount, result, session] = await Promise.all([
    friendService.countFriends(_id), // ✅ Public counter
    postService.countByAuthor(_id),  // ✅ Public counter  
    authService.findUserById(_id) as Promise<IUser | null>,
    getServerSession(authOptions),
  ])

  if (!result) notFound()
  const user = result as IUser

  const currentUserId = session?.user?._id
  const isOwner = currentUserId === user._id.toString()
  const isAuthenticated = !!currentUserId

  // --- AUTH-ONLY LOGIC (Safe for public access) ---
  let friendStatus: string = "rejected"
  if (isAuthenticated && !isOwner) {
    friendStatus = await friendService.getStatus(currentUserId, user._id.toString())
  }


  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-16 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* 1. HEADER SECTION - PUBLIC WITH AUTH CTAs */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-[rgb(var(--color-border)/0.5)]">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] flex items-center justify-center text-4xl font-black text-[rgb(var(--color-accent))] shadow-sm">
            {user.username[0]?.toUpperCase()}
          </div>
          
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[rgb(var(--color-fg))]">{user.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-[rgb(var(--color-fg-muted))]">
              <span className="text-[rgb(var(--color-accent))] font-bold">@{user.username}</span>
              {isOwner ? (
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> {user.email}</span>
              ) : (
                <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5"/> Email Private</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isOwner ? (
            <Link
              href={`/posts/new`}
              className="px-6 py-3 rounded-xl bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] text-sm font-bold hover:bg-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-fg))] transition-all shadow-lg"
            >
              + Create New Post
            </Link>
          ) : isAuthenticated ? (
            <>
              {friendStatus === "rejected" && (
                <form action={sendFriendRequest.bind(null, user._id.toString())}>
                  <button type="submit" className="px-6 py-3 rounded-xl bg-[rgb(var(--color-accent))] text-[rgb(var(--color-accent-fg))] text-sm font-bold hover:scale-105 transition-all shadow-md">
                    + Friend
                  </button>
                </form>
              )}
              {friendStatus === "pending" && (
                <button type="button" disabled className="px-6 py-3 rounded-xl bg-[rgb(var(--color-bg-soft))] text-[rgb(var(--color-fg-muted))] text-sm font-bold border border-[rgb(var(--color-border))] cursor-not-allowed">
                  Pending
                </button>
              )}
            </>
          ) : (
            <Link
              href="/posts/new"
              className="px-6 py-3 rounded-xl bg-[rgb(var(--color-bg-soft))] text-[rgb(var(--color-fg-muted))] text-sm font-bold border border-dashed border-[rgb(var(--color-border))] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Sign in to connect
            </Link>
          )}
        </div>
      </header>

      {/* 2. STATS & DETAILS GRID - FULLY PUBLIC */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        
        {/* Sidebar info - PUBLIC */}
        <aside className="md:col-span-4 space-y-10">
          <div className="flex gap-10">
            <div>
              <p className="text-2xl font-black text-[rgb(var(--color-fg))]">{friendCount}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-fg-muted))]">Friends</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[rgb(var(--color-fg))]">{postCount}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-fg-muted))]">Posts</p>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-3 text-sm font-bold text-[rgb(var(--color-fg))]">
                <GraduationCap className="w-4 h-4 text-[rgb(var(--color-accent))]" />
                <span>{user.college || "No College"}</span>
             </div>
             <div className="flex items-center gap-3 text-sm font-bold text-[rgb(var(--color-fg))]">
                <Book className="w-4 h-4 text-[rgb(var(--color-accent))]" />
                <span>{user.major || "No Major"}</span>
             </div>
             <div className="flex items-center gap-3 text-sm font-bold text-[rgb(var(--color-fg-muted))]">
                <Clock className="w-4 h-4" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
             </div>
          </div>
        </aside>

        {/* Main profile content - PUBLIC READ / OWNER EDIT */}
        <div className="md:col-span-8 space-y-10">
          <div className="space-y-8">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[rgb(var(--color-accent))]">Personal Workspace</h2>
            
            {isOwner ? (
              <form action={updateProfile} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InfoDisplay label="Full Name" value={user.name} />
                  <InfoDisplay label="Email" value={user.email} />
                </div>
                
                <div className="space-y-8">
                  <input type="hidden" name="profileId" value={_id.toString()} />
                  <Input label="College/University" name="college" defaultValue={user.college ?? ""} className="bg-transparent border-0 border-b rounded-none px-0 focus:ring-0 focus:border-[rgb(var(--color-accent))]" />
                  <Input label="Major/Field of Study" name="major" defaultValue={user.major ?? ""} className="bg-transparent border-0 border-b rounded-none px-0 focus:ring-0 focus:border-[rgb(var(--color-accent))]" />
                  <Input label="Bio" name="bio" defaultValue={user.bio ?? ""} multiline className="bg-transparent border-0 border-b rounded-none px-0 focus:ring-0 focus:border-[rgb(var(--color-accent))]" />
                </div>

                <button type="submit" className="group flex items-center gap-2 text-sm font-black text-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-fg))] transition-colors">
                  Save Changes <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoDisplay label="Display Name" value={user.name} />
                  <InfoDisplay label="Email" value="Private" />
                </div>
                <InfoDisplay label="Bio" value={user.bio || "This user hasn't written a bio yet."} isMultiline />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
