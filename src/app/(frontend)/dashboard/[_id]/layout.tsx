// app/dashboard/layout.tsx
import DashboardSidebar from "../../components/dashboard/DashboardSiderbar" // Updated path name to match logic
import { ReactNode } from "react"

  type LayoutProps = {
      children: ReactNode
      params: Promise<{ _id: string }>
  }

export default async function DashboardLayout({ children, params }: LayoutProps) {

  const props= await params;
  const {_id} = props;

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] flex overflow-hidden">
      {/* Left: Sidebar (always visible for any /dashboard/* route) */}
      <DashboardSidebar userId={_id} />

      {/* Right: Per-page content */}
      <main className="flex-1 min-h-screen overflow-y-auto relative">
        {/* Subtle decorative glow for the background */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[rgb(var(--color-accent)/0.03)] blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 py-10 relative z-10">
          {children}
        </div>
      </main>
    </div>
  )
}