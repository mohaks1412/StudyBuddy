// app/(frontend)/components/post/PostList.tsx
import PostCard from "./PostCard";
import type { Post } from "../../../types/post";
import NothingToSeeHere from "../NothingToSeeHere";
import { LayoutGrid, Sparkles } from "lucide-react";

const allowedFilters = ["all", "question", "answer", "notes", "question-paper"] as const;
type PostTypeFilter = (typeof allowedFilters)[number];

interface PostListProps {
  posts: Post[];
  filterType?: PostTypeFilter;
  authorId?: string;
  community?: string | null;
  title?: string;
  emptyMessage?: string;
}

export default function PostList({
  posts,
  filterType = "all",
  authorId,
  community,
  title = "Feed Archive",
}: PostListProps) {
  // Logic preserved
  const filtered = posts.filter((post) => {
    const postAuthorId = post.authorId?._id?.toString() || post.authorId?.toString();
    
    if (filterType !== "all" && post.type !== filterType) return false;
    if (authorId && postAuthorId !== authorId) return false;
    if (community && post.community !== community) return false;
    return true;
  });

  if (filtered.length === 0) {
    return <NothingToSeeHere />;
  }

  return (
    <section className="space-y-8 animate-in fade-in duration-700">
      {/* 1. STUDIO SECTION HEADER */}
      {title && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[rgb(var(--color-accent)/0.1)] text-[rgb(var(--color-accent))]">
               <LayoutGrid className="w-4 h-4" />
            </div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-[rgb(var(--color-fg-subtle))]">
              {title}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[rgb(var(--color-fg-subtle))] opacity-40">
              Showing {filtered.length} entries
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[rgb(var(--color-accent))] opacity-50" />
          </div>
        </div>
      )}

      {/* 2. FEED GRID */}
      {/* Using a vertical stack with increased gap (gap-6) 
          to let the new rounded cards breathe. 
      */}
      <div className="flex flex-col gap-6">
        {filtered.map((post, index) => (
          <div 
            key={post._id} 
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <PostCard post={post} />
          </div>
        ))}
      </div>
    </section>
  );
}