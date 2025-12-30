// app/(frontend)/communities/my/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import CommunityCard from '@/app/(frontend)/components/community/CommunityCard';
import CommunityService from '@/services/community.service';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Users, LayoutGrid, Compass, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default async function MyCommunitiesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) redirect('/sign-in');

  const userCommunities = await CommunityService.getUserCommunities(session.user._id.toString());

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-20 space-y-16 pb-32">
        
        {/* 1. STUDIO HERO HEADER */}
        <header className="flex flex-col items-center text-center space-y-4">

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none">
            My <span className="text-[rgb(var(--color-accent))]">Spaces</span>
          </h1>
          <p className="text-[rgb(var(--color-fg-muted))] max-w-xl text-lg font-medium">
            Manage your study groups, collaboration hubs, and specialized academic circles.
          </p>
        </header>

        {/* 2. STATS BAR (Sleek Minimalist) */}
        {userCommunities.length > 0 && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-8 px-10 py-6 rounded-[2.5rem] bg-[rgb(var(--color-bg-soft)/0.4)] border border-[rgb(var(--color-border)/0.5)] backdrop-blur-xl shadow-sm">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black leading-none">{userCommunities.length}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-fg-subtle))] mt-1">Active Hubs</span>
              </div>
              <div className="w-px h-8 bg-[rgb(var(--color-border)/0.5)]" />
              <Link 
                href="/communities/explore"
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-fg))] transition-colors"
              >
                <Compass className="w-4 h-4" />
                Find More
              </Link>
            </div>
          </div>
        )}

        {/* 3. CONTENT AREA */}
        <main>
          {userCommunities.length === 0 ? (
            <div className="text-center py-32 rounded-[3rem] border-2 border-dashed border-[rgb(var(--color-border)/0.5)] bg-[rgb(var(--color-bg-soft)/0.1)] animate-in fade-in zoom-in-95 duration-700">
              <div className="w-24 h-24 bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm group hover:rotate-6 transition-transform">
                <Users className="w-10 h-10 text-[rgb(var(--color-fg-subtle))]" />
              </div>
              <h2 className="text-3xl font-black text-[rgb(var(--color-fg))] mb-4">Solo traveler?</h2>
              <p className="text-[rgb(var(--color-fg-muted))] mb-10 max-w-sm mx-auto font-medium">
                Academic success is better shared. Join a community to start exchanging notes and questions.
              </p>
              <Link 
                href="/communities/explore"
                className="inline-flex items-center px-10 py-4 bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] hover:bg-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-fg))] font-black rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95"
              >
                Explore Communities
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              {userCommunities.map((community) => (
                <div key={community._id.toString()} className="group relative">
                  {/* Subtle hover glow */}
                  <div className="absolute -inset-1 bg-gradient-to-tr from-[rgb(var(--color-accent)/0.15)] to-transparent rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-500" />
                  
                  <div className="relative">
                    <CommunityCard 
                      community={{
                        _id: community._id.toString(),
                        name: community.name,
                        slug: community.slug,
                        description: community.description,
                        memberCount: community.memberCount
                      }}
                      isJoined
                      showPostsLink
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}