// app/(frontend)/dashboard/page.tsx (SERVER COMPONENT)
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Sparkles } from 'lucide-react';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Handle unauthenticated on server
  if (!session?.user) {
    redirect('/sign-in');
  }

  const username = session.user.username || session.user.email?.split('@')[0];

  return (
    <>
      {/* Loading state handled by Suspense boundary in layout */}
      <div className="min-h-screen bg-[rgb(var(--color-bg))] p-6 sm:p-10 lg:p-12">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* WELCOME HEADER */}
          <header className="relative overflow-hidden rounded-[2.5rem] bg-[rgb(var(--color-bg-soft)/0.5)] border border-[rgb(var(--color-border)/0.5)] p-8 sm:p-12">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[rgb(var(--color-accent)/0.15)] blur-[100px] rounded-full" />
            
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[rgb(var(--color-accent)/0.1)] text-[rgb(var(--color-accent))] text-[10px] font-black uppercase tracking-widest w-fit">
                <Sparkles className="w-3 h-3" />
                Overview
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-black text-[rgb(var(--color-fg))] tracking-tight">
                Welcome back,{' '}
                <span className="text-[rgb(var(--color-accent))]">{username}</span>
              </h1>
              
              <p className="text-[rgb(var(--color-fg-muted))] text-lg font-medium max-w-xl">
                Ready to continue your learning journey? Here is what has been happening in your communities.
              </p>
            </div>
          </header>

          {/* DASHBOARD CONTENT AREA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-64 rounded-[2rem] border-2 border-dashed border-[rgb(var(--color-border)/0.5)] bg-[rgb(var(--color-bg-soft)/0.2)] flex items-center justify-center">
              <p className="text-[rgb(var(--color-fg-subtle))] font-bold italic">Dashboard Widgets Incoming...</p>
            </div>
            <div className="h-64 rounded-[2rem] border-2 border-dashed border-[rgb(var(--color-border)/0.5)] bg-[rgb(var(--color-bg-soft)/0.2)] flex items-center justify-center">
              <p className="text-[rgb(var(--color-fg-subtle))] font-bold italic">Activity Feed</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
