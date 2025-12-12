// components/dashboard/Sidebar.tsx
import Link from "next/link"

type SidebarProps = {
  userId: string
}

export default function DashboardSidebar({ userId }: SidebarProps) {
  const mainItems = [
    { href: `/dashboard/${userId}`, label: "Personal Details" },
    { href: `/dashboard/${userId}/communities`, label: "Communities" },
    { href: `/dashboard/${userId}/friends`, label: "Friends" },
  ]

  const postItems = [
    { href: `/dashboard/${userId}/posts/all`, label: "All Posts" },
    { href: `/dashboard/${userId}/posts/questions`, label: "Questions" },
    { href: `/dashboard/${userId}/posts/answers`, label: "Answers" },
    { href: `/dashboard/${userId}/posts/notes`, label: "Notes" },
    { href: `/dashboard/${userId}/posts/question-papers`, label: "Question Papers" },
  ]

  return (
    <aside className="h-screen w-64 bg-gray-950 border-r border-gray-800 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-800">
        <h1 className="text-2xl font-extrabold text-teal-400 tracking-wider">
          StudyBuddy
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Your personal academic hub
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <p className="text-xs font-semibold uppercase text-gray-600 tracking-wider px-2 mb-3">
          Main Menu
        </p>

        {mainItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
          >
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="pt-4 mt-4 border-t border-gray-800">
          <p className="text-xs font-semibold uppercase text-gray-600 tracking-wider px-2 mb-3">
            Content
          </p>

          <div>
            <div className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-sm text-gray-300">
              <span>Posts</span>
            </div>

            <div className="mt-2 space-y-1 pl-4 border-l-2 border-gray-700 ml-4">
              {postItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-400 border border-gray-600">
            U
          </div>
          <div>
            <p className="text-xs text-gray-500">Logged in as</p>
            <p className="font-semibold text-gray-300 truncate text-sm">
              you@example.com
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
