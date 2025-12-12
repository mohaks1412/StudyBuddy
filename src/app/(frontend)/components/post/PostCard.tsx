import Link from "next/link"
import type { Post, TextPost } from "../../../types/post"
import { formatDistanceToNow } from "date-fns"

interface PostCardProps {
  post: Post
}

function getTypeIcon(type: string): string {
  const icons = {
    question: "❓",
    answer: "💡", 
    notes: "📚",
    "question-paper": "📄"
  } as const
  return icons[type as keyof typeof icons] || "📝"
}

export default function PostCard({ post }: PostCardProps) {
  const isDocPost = post.type === "notes" || post.type === "question-paper"
  
  return (
    <Link 
      href={`/posts/${post._id}`}
      className="group block p-6 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-2xl transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getTypeIcon(post.type)}</span>
          <div>
            <h3 className="font-bold text-lg group-hover:text-teal-400 transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {post.subject || "General"} • {formatDistanceToNow(new Date(post.createdAt))} ago
            </p>
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-4">
        {isDocPost ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>📎</span>
            <span className="truncate max-w-[200px]">{post.fileUrl}</span>
            {"summary" in post && post.summary && (
              <span className="text-xs bg-blue-500/20 px-2 py-1 rounded-full">
                {post.summary.slice(0, 30)}...
              </span>
            )}
          </div>
        ) : (
          <p className="text-gray-300 line-clamp-3 leading-relaxed">
            {(post as TextPost).content}
          </p>
        )}
      </div>

      {/* Footer with community */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700 text-xs text-gray-500">
        <span className="px-2 py-1 rounded-full bg-gray-700/70 text-gray-300">
          {post.community || "Global"}
        </span>
        <span className="text-gray-400">
          {post.type.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
        </span>
      </div>
    </Link>
  )
}
