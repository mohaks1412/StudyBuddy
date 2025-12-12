"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading your dashboard...</p>
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    // Soft redirect on client
    redirect("/sign-in");
    return null;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">
        Welcome, {session.user.username || session.user.email}
      </h1>
      {/* real dashboard here */}
    </div>
  );
}
