// app/dashboard/[id]/posts/[filter]/page.tsx
import PostList from "@/app/(frontend)/components/post/PostList"
import postService from "@/services/post.service"
import authService from "@/services/auth.service"
import type { Post } from "@/app/types/post"
import { LayoutGrid, Sparkles, User, ChevronRight } from "lucide-react";
import Link from "next/link";

const allowedFilters = ["all", "question", "answer", "notes", "question-paper"] as const
type PostTypeFilter = (typeof allowedFilters)[number]

interface PageProps {
  params: Promise<{
    _id: string;
    filter: string;
  }>;
}

export default async function UserPostsPage({ params }: PageProps) {
  const { _id: userId, filter } = await params;

  

  const filterType: PostTypeFilter = allowedFilters.includes(filter as PostTypeFilter)
    ? (filter as PostTypeFilter)
    : "all";
    

  const [user, posts] = await Promise.all([
    authService.findUserById(userId),
    postService.fetchPostsByUser(userId),
  ]);

  
  const displayName = user?.name || user?.username || "this user";

  // Studio-style heading logic
  let categoryLabel: string;
  switch (filterType) {
    case "question": categoryLabel = "Questions asked"; break;
    case "answer": categoryLabel = "Solutions"; break;
    case "notes": categoryLabel = "Resources"; break;
    case "question-paper": categoryLabel = "Question Bank"; break;
    default: categoryLabel = "Collection";
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 1. STUDIO PAGE HEADER */}
      <header className="space-y-4">
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-fg-subtle))] opacity-60">
          <Link href={`/dashboard/${userId}`} className="hover:text-[rgb(var(--color-accent))] transition-colors">Profile</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[rgb(var(--color-accent))]">Contributions</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">

            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-[rgb(var(--color-fg))]">
              {categoryLabel} <span className="text-[rgb(var(--color-fg-subtle))] opacity-30">by {displayName}</span>
            </h1>
          </div>

        </div>
      </header>

      {/* 2. POST FEED CONTAINER */}
      <main className="relative">
        {/* Subtle decorative line establishing the studio vertical axis */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-[rgb(var(--color-border)/0.5)] via-transparent to-transparent hidden lg:block" />
        
        <div className="lg:pl-8">
          <PostList
            posts={posts}
            authorId={userId}
            filterType={filterType}
            title={filterType === "all" ? "Master Archive" : `${filterType.replace("-", " ")}`}
          />
        </div>
      </main>
    </div>
  );
}