// app/(frontend)/components/post/PostCard.tsx
import Link from "next/link";
import Image from "next/image";
import type { Post, TextPost, DocPost } from "../../../types/post";
import { formatDistanceToNow, isValid } from "date-fns";
import communityService from "@/services/community.service";
import { 
  HelpCircle, Lightbulb, BookOpen, FileText, 
  Paperclip, Clock, Hash 
} from "lucide-react";

interface PostCardProps {
  post: Post;
}

function getFileMetadata(url: string) {
  const ext = url.split(".").pop()?.toLowerCase() || "";
  const isImage = ["jpg", "jpeg", "png", "webp"].includes(ext);
  return { ext, isImage };
}

function getTypeIcon(type: string) {
  switch (type) {
    case "question": return <HelpCircle className="w-3.5 h-3.5" />;
    case "answer": return <Lightbulb className="w-3.5 h-3.5" />;
    case "notes": return <BookOpen className="w-3.5 h-3.5" />;
    case "question-paper": return <FileText className="w-3.5 h-3.5" />;
    default: return <Hash className="w-3.5 h-3.5" />;
  }
}

export default async function PostCard({ post }: PostCardProps) {
  const community = await communityService.findCommunityById(post.community as string);
  const isDocPost = post.type === "notes" || post.type === "question-paper";
  const { isImage, ext } = isDocPost ? getFileMetadata((post as DocPost).fileUrl) : { isImage: false, ext: "" };
  const createdAt = new Date(post.createdAt);

  return (
    <Link 
      href={`/posts/${post._id}`}
      className="group flex flex-col sm:flex-row gap-4 p-4 bg-[rgb(var(--color-bg-soft)/0.3)] hover:bg-[rgb(var(--color-bg-soft)/0.6)] border border-[rgb(var(--color-border)/0.3)] rounded-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 overflow-hidden"
    >
      {/* 1. Compact Media Preview (Fixed size on the left/top) */}
      {isDocPost && (
        <div className="relative w-full sm:w-28 h-20 sm:h-auto rounded-xl overflow-hidden bg-[rgb(var(--color-bg-strong)/0.15)] border border-[rgb(var(--color-border)/0.2)] flex-shrink-0">
          {isImage ? (
            <Image 
              src={(post as DocPost).fileUrl} 
              alt={post.title}
              fill
              className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[rgb(var(--color-accent)/0.05)] to-transparent">
               <FileText className="w-5 h-5 text-[rgb(var(--color-accent))]" />
               <span className="text-[8px] font-black uppercase tracking-tighter mt-1 text-[rgb(var(--color-accent))]">{ext}</span>
            </div>
          )}
        </div>
      )}

      {/* 2. Content Info */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <header className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[rgb(var(--color-accent))]">{getTypeIcon(post.type)}</span>
              <span className="text-[8px] font-black uppercase tracking-[0.1em] text-[rgb(var(--color-accent))] opacity-70">
                {post.type.replace("-", " ")}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[8px] font-bold text-[rgb(var(--color-fg-subtle))] opacity-50 uppercase">
              <Clock className="w-2.5 h-2.5" />
              {isValid(createdAt) ? formatDistanceToNow(createdAt) : "now"}
            </div>
          </header>

          <h3 className="text-sm font-bold text-[rgb(var(--color-fg))] leading-tight group-hover:text-[rgb(var(--color-accent))] transition-colors line-clamp-1 mb-1">
            {post.title}
          </h3>

          {!isDocPost && (
            <p className="text-[11px] font-medium text-[rgb(var(--color-fg-muted))] line-clamp-1 opacity-70">
              {(post as TextPost).content}
            </p>
          )}

          {isDocPost && (
            <div className="flex items-center gap-1 opacity-60">
              <Paperclip className="w-2.5 h-2.5" />
              <span className="text-[9px] font-bold truncate max-w-[150px]">
                {(post as DocPost).fileUrl.split('/').pop()}
              </span>
            </div>
          )}
        </div>

        {/* 3. Footer */}
        <footer className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-[rgb(var(--color-accent))]" />
            <span className="text-[8px] font-black uppercase text-[rgb(var(--color-fg-subtle))]">
              {post.subject || "General"}
            </span>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest text-[rgb(var(--color-fg-subtle))] opacity-40">
            {community?.name || "Global"}
          </span>
        </footer>
      </div>
    </Link>
  );
}