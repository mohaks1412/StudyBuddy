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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex">
      {/* Right: Main content */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <DashboardDisplay />
        </div>
      </main>
    </div>
  );
}
