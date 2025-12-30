// app/(frontend)/communities/explore/page.tsx
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { Users, Search, Plus, ArrowRight, Sparkles } from 'lucide-react';

import CommunityCard from '@/app/(frontend)/components/community/CommunityCard';
import DebouncedSearchBar from '@/app/(frontend)/components/SearchBar';
import CommunityService, { CommunityWithCount } from '@/services/community.service';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface ExplorePageProps {
  searchParams: { q?: string; page?: string };
}

export default async function ExploreCommunitiesPage({ searchParams }: ExplorePageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?._id;

  // ✅ REMOVED: No more login redirect - public access!

  const param = await searchParams;
  const searchTerm = (param.q || '').trim();
  const page = Number(param.page || 1);

  // ✅ Fetch communities regardless of auth
  const communities: CommunityWithCount[] = searchTerm
    ? await CommunityService.searchCommunities(searchTerm, 50)
    : await CommunityService.getPopularCommunitiesPaginated(page, 12);

  // ✅ Only fetch user-specific data if logged in
  let userCommunities: CommunityWithCount[] = [];
  let isLoggedIn = !!userId;

  if (userId) {
    userCommunities = await CommunityService.getUserCommunities(userId);
  }

  const hasMore = !searchTerm && communities.length === 12;

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] selection:bg-[rgb(var(--color-accent)/0.2)]">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 space-y-20">
        
        {/* MODERN HERO SECTION */}
        <section className="relative text-center max-w-4xl mx-auto space-y-6">
          
          
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1]">
            Discover 
            <span className="block bg-gradient-to-r from-[rgb(var(--color-accent))] via-[rgb(var(--color-fg-muted))] to-[rgb(var(--color-accent))] bg-clip-text text-transparent">
              Communities
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[rgb(var(--color-fg-muted))] max-w-2xl mx-auto leading-relaxed font-medium">
            The best way to learn is together. Find your circle, share knowledge, and grow faster.
          </p>

          {/* INTEGRATED SEARCH BAR */}
          <div className="max-w-2xl mx-auto pt-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[rgb(var(--color-accent)/0.2)] to-[rgb(var(--color-bg-strong)/0.2)] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative">
                <DebouncedSearchBar
                  placeholder="Search by topic, name, or interest..."
                  debounceDelay={400}
                />
              </div>
            </div>
          </div>
        </section>

        {/* RESULTS FEED */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[rgb(var(--color-border))] pb-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight text-[rgb(var(--color-fg))]">
                {searchTerm ? 'Search Results' : 'Trending Now'}
              </h2>
              {searchTerm && (
                <p className="text-[rgb(var(--color-fg-muted))] font-medium">
                  Found {communities.length} results for <span className="text-[rgb(var(--color-accent))]">"{searchTerm}"</span>
                </p>
              )}
            </div>

            {/* ✅ CONDITIONAL: Show "My Communities" only if logged in */}
            {!searchTerm && isLoggedIn && userCommunities.length > 0 && (
              <Link
                href="/communities/my"
                className="group inline-flex items-center gap-2 text-sm font-bold text-[rgb(var(--color-fg-muted))] hover:text-[rgb(var(--color-accent))] transition-colors"
              >
                View Joined Communities
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>

          {communities.length === 0 ? (
            <div className="py-32 text-center rounded-3xl border-2 border-dashed border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-soft)/0.5)]">
              <div className="mx-auto w-16 h-16 rounded-full bg-[rgb(var(--color-bg-strong)/0.2)] flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-[rgb(var(--color-fg-muted))]" />
              </div>
              <h3 className="text-xl font-bold">No results found</h3>
              <p className="text-[rgb(var(--color-fg-muted))] mt-2">
                {!isLoggedIn 
                  ? "Sign in to create your own communities." 
                  : "Try adjusting your search or create a new community."
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {communities.map((community) => (
                <CommunityCard
                  key={community._id}
                  community={community}
                  // ✅ isJoined only if logged in
                  isJoined={isLoggedIn ? userCommunities.some(c => c._id === community._id) : false}
                  className="bg-[rgb(var(--color-bg-soft))] hover:shadow-xl hover:shadow-[rgb(var(--color-accent)/0.05)] transition-all duration-300"
                />
              ))}
            </div>
          )}

          {!searchTerm && hasMore && (
            <div className="flex justify-center pt-12">
              <Link
                href={`?page=${page + 1}`}
                className="px-10 py-4 rounded-full bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] font-bold hover:scale-105 transition-transform"
              >
                Load more results
              </Link>
            </div>
          )}
        </section>

        {/* ✅ MODERN CTA CARD - Conditional for logged-in users only */}
        {isLoggedIn && (
          <section className="relative overflow-hidden rounded-[2.5rem] bg-[rgb(var(--color-fg))] p-1 text-center">
            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-[rgb(var(--color-accent))] opacity-20 blur-[100px]"></div>
            
            <div className="relative rounded-[2.4rem] bg-[rgb(var(--color-bg-soft))] px-8 py-16 sm:py-20">
              <div className="max-w-2xl mx-auto space-y-8">
                <h3 className="text-4xl sm:text-5xl font-black text-[rgb(var(--color-fg))] tracking-tight">
                  Can't find what you're <br />looking for?
                </h3>
                <p className="text-[rgb(var(--color-fg-muted))] text-lg font-medium">
                  Start your own movement. It takes less than a minute to set up a home for your community.
                </p>
                <Link
                  href="/community/create"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[rgb(var(--color-accent))] text-[rgb(var(--color-accent-fg))] font-bold shadow-lg shadow-[rgb(var(--color-accent)/0.3)] hover:-translate-y-1 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Create a Community
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ✅ NEW: Sign-in CTA for unauthorized users */}
        {!isLoggedIn && (
          <section className="relative overflow-hidden rounded-[2.5rem] bg-[rgb(var(--color-fg))] p-1 text-center">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-[rgb(var(--color-accent))] opacity-20 blur-[100px]"></div>
            
            <div className="relative rounded-[2.4rem] bg-[rgb(var(--color-bg-soft))] px-8 py-16 sm:py-20">
              <div className="max-w-2xl mx-auto space-y-8">
                <h3 className="text-4xl sm:text-5xl font-black text-[rgb(var(--color-fg))] tracking-tight">
                  Ready to join the conversation?
                </h3>
                <p className="text-[rgb(var(--color-fg-muted))] text-lg font-medium">
                  Sign in to join communities, create posts, and connect with others.
                </p>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[rgb(var(--color-accent))] text-[rgb(var(--color-accent-fg))] font-bold shadow-lg shadow-[rgb(var(--color-accent)/0.3)] hover:-translate-y-1 transition-all"
                >
                  <Users className="w-5 h-5" />
                  Get Started
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
