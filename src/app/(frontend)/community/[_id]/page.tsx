// app/(frontend)/communities/[_id]/page.tsx
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import CommunityService from "@/services/community.service";
import PostService from "@/services/post.service";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import PostList from "@/app/(frontend)/components/post/PostList";
import { LeaveCommunityButton } from "../../components/community/LeaveCommunityButton";
import { JoinCommunityButton } from "../../components/community/JoinCommunityButton";
import { MembersOverlay } from "../../components/community/MemberOverlay";
import { Plus, Users, ShieldCheck, Sparkles, LayoutGrid, Eye } from "lucide-react";

interface CommunityPageProps {
  params: { _id: string };
}

// ✅ Type definitions
interface UserSummary {
  _id: string;
  username: string;
  email: string;
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const session = await getServerSession(authOptions);
  const props = await params;
  const communityId = props._id;

  const community = await CommunityService.findCommunityById(communityId);
  if (!community) notFound();

  // ✅ Fetch posts regardless of auth - public feed
  const posts = await PostService.fetchPostsByCommunity(communityId, { limit: 20 });

  // ✅ Only fetch user-specific data if logged in
  let isMember = false;
  let isAdmin = false;
  let members: UserSummary[] = [];
  let admins: UserSummary[] = [];

  if (session?.user?._id) {
    [isMember, isAdmin, members, admins] = await Promise.all([
      CommunityService.isUserInCommunity(session.user._id, communityId),
      CommunityService.isUserAdmin(session.user._id, communityId),
      CommunityService.getCommunityMembers(communityId).then(members => 
        members.map((member: any) => ({
          _id: member._id.toString(),
          username: member.username,
          email: member.email,
        }))
      ),
      Promise.resolve(
        community.admins?.map((admin: any) => ({
          _id: admin._id.toString(),
          username: admin.username,
          email: admin.email,
        })) || []
      ),
    ]);
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-20 space-y-12 pb-32">
        
        {/* 1. STUDIO HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-[rgb(var(--color-border)/0.5)]">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-[rgb(var(--color-accent))] to-[rgb(var(--color-success))] flex items-center justify-center text-2xl font-black text-[rgb(var(--color-accent-fg))] shadow-2xl">
              {community.slug.slice(0, 2).toUpperCase()}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-accent))]">
                <Sparkles className="w-3 h-3" />
                Community Hub
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">{community.name}</h1>
              <div className="flex items-center gap-4 text-xs font-bold text-[rgb(var(--color-fg-muted))]">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {community.memberCount || 0} members
                </span>
                <span className="opacity-20">|</span>
                <Link href="/communities/my" className="hover:text-[rgb(var(--color-accent))] transition-colors">
                  My Network
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* ✅ 3RD VIEW: Unauthorized users see "Sign in to join" */}
            {session?.user?._id ? (
              isMember ? (
                <>
                  <Link
                    href={`/posts/new?communityId=${communityId}`}
                    className="flex items-center gap-2 px-8 py-4 bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] hover:bg-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-fg))] font-black rounded-2xl text-sm transition-all shadow-xl hover:-translate-y-1"
                  >
                    <Plus className="w-4 h-4" />
                    New Post
                  </Link>
                  <LeaveCommunityButton communityId={communityId} />
                </>
              ) : (
                <JoinCommunityButton communityId={communityId} />
              )
            ) : (
              <Link
                href="/sign-in"
                className="flex items-center gap-2 px-8 py-4 bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] hover:bg-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-fg))] font-black rounded-2xl text-sm transition-all shadow-xl hover:-translate-y-1"
              >
                
                Sign in to join
              </Link>

            )}
          </div>
        </header>

        {/* 2. MAIN LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
         
          {/* LEFT: POSTS FEED - Always visible */}
          <section className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <LayoutGrid className="w-6 h-6 text-[rgb(var(--color-accent))]" />
                Latest Feed
              </h2>
              <div className="px-3 py-1 rounded-full bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border)/0.5)] text-[10px] font-black uppercase tracking-widest">
                {posts.length} entries
              </div>
            </div>

            <PostList
              posts={posts}
              filterType="all"
              title=""
              emptyMessage="Be the first to share knowledge here."
            />
          </section>

          {/* RIGHT: STUDIO SIDEBAR */}
          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-10">
            
            {/* About Box - Always visible */}
            <div className="p-8 rounded-[2.5rem] bg-[rgb(var(--color-bg-soft)/0.4)] border border-[rgb(var(--color-border)/0.5)] backdrop-blur-xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-accent))] mb-4">
                Manifesto
              </h3>
              <p className="text-sm font-medium leading-relaxed text-[rgb(var(--color-fg-muted))] italic">
                {community.description || "A collective space for shared learning and growth."}
              </p>
            </div>

            {/* Admin Box - Always visible */}
            {admins.length > 0 && (
              <div className="p-8 rounded-[2.5rem] bg-[rgb(var(--color-bg-soft)/0.4)] border border-[rgb(var(--color-border)/0.5)]">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-fg-subtle))] mb-6">
                  Admins
                </h3>
                <div className="space-y-4">
                  {admins.slice(0, 5).map((admin) => (
                    <Link
                      key={admin._id}
                      href={`/dashboard/${admin._id}`}
                      className="flex items-center gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-bg-strong)/0.5)] border border-[rgb(var(--color-border)/0.5)] flex items-center justify-center text-xs font-black text-[rgb(var(--color-accent))] group-hover:bg-[rgb(var(--color-accent))] group-hover:text-[rgb(var(--color-accent-fg))] transition-all">
                         {admin.username?.slice(0, 2).toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate group-hover:text-[rgb(var(--color-accent))] transition-colors">
                          {admin.username || admin.email?.split("@")[0]}
                        </p>
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[rgb(var(--color-fg-subtle))] opacity-60">
                           <ShieldCheck className="w-2.5 h-2.5" /> Curator
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ✅ Members Section - Adapts to auth state */}
            <div className="p-8 rounded-[2.5rem] bg-[rgb(var(--color-bg-soft)/0.4)] border border-[rgb(var(--color-border)/0.5)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-accent))] flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Active Members
                </h3>
                {!session?.user?._id && (
                  <Link href="/sign-in" className="text-xs font-bold text-[rgb(var(--color-accent))] hover:underline">
                    Sign in →
                  </Link>
                )}
              </div>
              {/* Conditional content based on auth */}
              {!session?.user?._id ? (
                <div className="text-xs text-[rgb(var(--color-fg-subtle))] space-y-1">
                  <p><strong>Sign in</strong> to join conversations</p>
                </div>
              ) : isAdmin ? (
                <MembersOverlay 
                  communityId={communityId} 
                  members={members} 
                  admins={admins}
                />
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
