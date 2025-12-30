// app/(frontend)/posts/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import PostService from "@/services/post.service";
import type { Post } from "@/app/types/post";
import PostList from "@/app/(frontend)/components/post/PostList";
import NothingToSeeHere from "@/app/(frontend)/components/NothingToSeeHere";
import { Sparkles, Compass, Zap, LogIn } from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 20;

export default async function PostsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?._id || "";

  // Always fetch recent posts for unauthorized users or when no communities
  const userCommunities: string[] = []; 
  const isPersonalized = userCommunities.length > 0 && !!userId;
  let posts: Post[] = [];

  if (isPersonalized && userId) {
    posts = (await PostService.fetchFeedForUser(userId, userCommunities, {
      limit: PAGE_SIZE,
      page: 1,
    })) as Post[];
  } else {
    // Always fetch recent posts - works for both unauth and no communities
    posts = (await PostService.fetchRecentPosts({
      limit: PAGE_SIZE,
      page: 1,
    })) as Post[];
  }

  const isUnauthorized = !userId;
  const showPosts = posts.length > 0;

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] transition-colors duration-500">
      <div className="max-w-5xl mx-auto px-6 py-12 lg:py-20 pb-40 space-y-16">
        
        {/* DYNAMIC HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[rgb(var(--color-border)/0.5)] pb-12">
          <div className="space-y-4">
            
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
              Explore <span className="inline bg-gradient-to-r from-[rgb(var(--color-accent))] via-[rgb(var(--color-fg-muted))] to-[rgb(var(--color-accent))] bg-clip-text text-transparent">Feed.</span>
            </h1>
            
            <p className="text-sm font-medium text-[rgb(var(--color-fg-muted))] max-w-md leading-relaxed">
              {isUnauthorized 
                ? "Browse the latest contributions across the network. Sign in to post stuff."
                : isPersonalized 
                  ? "The latest updates from the communities you've joined."
                  : "A collection of the most recent contributions across the entire network."
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {!isUnauthorized ? (
              <Link 
                href="/posts/new"
                className="px-8 py-4 bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] hover:bg-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-fg))] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl hover:-translate-y-1 active:scale-95"
              >
                New Post
              </Link>
            ) : (
              <div className="px-8 py-4 text-sm font-medium text-[rgb(var(--color-fg-muted))] bg-[rgb(var(--color-bg-secondary)/0.5)] backdrop-blur-sm rounded-2xl border border-[rgb(var(--color-border)/0.5)] min-h-[3.5rem] flex items-center justify-center">
                <LogIn className="w-4 h-4 mr-2 opacity-60" />
                Sign in to post stuff
              </div>
            )}
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main>
          {showPosts ? (
            <div className="lg:col-span-8">
              <PostList
                posts={posts}
                filterType="all"
                title={isUnauthorized 
                  ? "Recent Broadcasts" 
                  : isPersonalized 
                    ? "Community Pulse" 
                    : "Recent Broadcasts"
                }
              />
            </div>
          ) : (
            <div className="min-h-[40vh] flex items-center justify-center">
              <NothingToSeeHere />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
