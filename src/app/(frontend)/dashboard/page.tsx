// app/dashboard/page.tsx
import DashboardSidebar from "../components/dashboard/DashboardSiderbar";
import DashboardDisplay from "../components/dashboard/DashboardDisplay";
// If you later expose auth(), you can gate here:
// import { auth } from "@/lib/auth";
// import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Uncomment when you have auth() exported:
  // const session = await auth();
  // if (!session?.user) redirect("/sign-in");

  // Fetch or define userId for the sidebar logic
  const userId = "placeholder-id"; 

  return (
    <div className="flex min-h-screen bg-[rgb(var(--color-bg))] transition-colors duration-500">
      
      {/* Sidebar - Stays fixed or slides based on the Sidebar component logic */}
      <DashboardSidebar userId={userId} />

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen overflow-y-auto overflow-x-hidden">
        
        {/* Modern Content Wrapper */}
        <div className="relative">
          {/* Subtle background ambient glow for a "sleek" feel */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[rgb(var(--color-accent)/0.03)] blur-[120px] rounded-full pointer-events-none" />
          
          <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 relative z-10">
            {/* DashboardDisplay will now sit inside a cleanly 
               spaced, theme-aware container 
            */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <DashboardDisplay />
            </section>
          </div>
        </div>

        {/* Footer info or padding */}
        <footer className="py-10 text-center opacity-20">
           <div className="h-px w-20 bg-[rgb(var(--color-border))] mx-auto mb-4" />
        </footer>
      </main>
    </div>
  );
}