// app/dashboard/layout.tsx
import DashboardSidebar from "../../components/dashboard/DashboardSiderbar"
import { ReactNode } from "react"

  type LayoutProps = {
      children: ReactNode
      params: { _id: string }
  }

export default async function DashboardLayout({ children, params }: LayoutProps) {

  const {_id} = await params;

  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex">
      {/* Left: Sidebar (always visible for any /dashboard/* route) */}
      <DashboardSidebar userId={_id} />

      {/* Right: Per-page content */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
