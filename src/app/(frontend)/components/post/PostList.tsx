import PostCard from "./PostCard"
import type { Post } from "../../../types/post"
import NothingToSeeHere from "../NothingToSeeHere"

const allowedFilters = ["all", "questions", "answers", "notes", "question-papers"] as const
type PostTypeFilter = (typeof allowedFilters)[number]


interface PostListProps {
  posts: Post[]
  filterType?: PostTypeFilter
  authorId?: string
  community?: string | null
  title?: string
  emptyMessage?: string
}

export default function PostList({
  posts,
  filterType = "all",
  authorId,
  community,
  title = "Posts",
}: PostListProps) {
  const filtered = posts.filter((post) => {
    if (filterType !== "all" && post.type !== filterType) return false
    if (authorId && post.authorId._id?.toString?.() !== authorId) return false
    if (community && post.community !== community) return false
    return true
  })

  if (filtered.length === 0) {
    return (
      <NothingToSeeHere/>
    )
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-teal-400">{title}</h2>
      <div className="space-y-4">
        {filtered.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  )
}
