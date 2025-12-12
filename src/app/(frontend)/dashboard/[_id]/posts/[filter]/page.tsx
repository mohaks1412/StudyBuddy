// app/dashboard/[id]/posts/[filter]/page.tsx
import PostList from "@/app/(frontend)/components/post/PostList"
import postService from "@/services/post.service"
import authService from "@/services/auth.service"
import type { Post } from "@/app/types/post"

const allowedFilters = ["all", "questions", "answers", "notes", "question-papers"] as const
type PostTypeFilter = (typeof allowedFilters)[number]

interface PageProps {
  params: {
    _id: string
    filter: string
  }
}

export default async function UserPostsPage({ params }: PageProps) {
  const props = await params;
  const { _id, filter } = props
  

  const filterType: PostTypeFilter = allowedFilters.includes(filter as PostTypeFilter)
    ? (filter as PostTypeFilter)
    : "all"

  const [user, posts] = await Promise.all([
    authService.findUserById(_id),
    postService.fetchPostsByUser(_id),
  ])
  

  const username = user?.username ?? "this user"
  const displayName = user?.name ?? username

  let pageHeading: string
  switch (filterType) {
    case "questions":
      pageHeading = `Questions asked by ${displayName}`
      break
    case "answers":
      pageHeading = `Answers by ${displayName}`
      break
    case "notes":
      pageHeading = `Notes shared by ${displayName}`
      break
    case "question-papers":
      pageHeading = `Question papers shared by ${displayName}`
      break
    default:
      pageHeading = `All posts by ${displayName}`
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-teal-400">{pageHeading}</h1>
      </div>

      <PostList
        posts={posts}
        authorId={_id}
        filterType={filterType}
        title={
          filterType === "all"
            ? "All posts"
            : `${filterType.replace("-", " ")} posts`
        }
        emptyMessage={
          filterType === "all"
            ? `No posts yet. When ${displayName} creates posts, they’ll appear here.`
            : `No ${filterType.replace("-", " ")} posts from ${displayName} yet.`
        }
      />
    </div>
  )
}
