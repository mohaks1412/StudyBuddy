// app/(frontend)/chat/page.tsx
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import DmCard, { FriendMeta } from '@/app/(frontend)/components/chat/DmCard';
import { friendService } from '@/services/friend.service';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import DebouncedSearchBar from '@/app/(frontend)/components/SearchBar';
import { MessageCircle, Search, UserPlus, Sparkles } from 'lucide-react';
import { SocketProvider } from '../providers/SocketProvider';
import NothingToSeeHere from "../components/NothingToSeeHere"

interface ChatPageProps {
  searchParams: { q?: string };
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?._id;

  if (!userId) redirect('/sign-in');

  const param = await searchParams;
  const searchTerm = (param.q || '').trim();

  // Get friends logic preserved
  const friends: any[] = await friendService.getFriends(userId);
  
  const filteredFriends = searchTerm 
    ? friends.filter((friend: any) => 
        friend.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        friend.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : friends;

  const friendsWithMeta: FriendMeta[] = filteredFriends.map((friend: any) => ({
    _id: friend._id.toString(),
    username: friend.username || '',
    name: friend.name,
    avatar: friend.avatar,
    unreadCount: 0,
    lastMessage: "Say hi to start chatting!",
    lastMessageTime: undefined
  }));

  return (
    <SocketProvider currentUserId={userId}>
      <div className="min-h-screen bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] transition-colors duration-500">
        <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16 space-y-12">
          
          {/* 1. PREMIUM HEADER */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[rgb(var(--color-border)/0.3)]">
            <div className="space-y-2">
              
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                Messages
              </h1>
              <p className="text-[rgb(var(--color-fg-muted))] font-medium">
                Connect and collaborate with your study buddies.
              </p>
            </div>

            {/* Quick Action */}
            <Link 
              href={`/dashboard/${userId}/friends`}
              className="group flex items-center gap-2 text-sm font-black text-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-fg))] transition-colors"
            >
              <UserPlus className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              Add Friends
            </Link>
          </header>

          {/* 2. SEARCH & FILTER SECTION */}
          <section className="relative group">
             {/* Decorative glow behind search */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[rgb(var(--color-accent)/0.2)] to-transparent rounded-2xl blur opacity-25 group-focus-within:opacity-100 transition duration-1000"></div>
            <div className="relative">
              <DebouncedSearchBar 
                placeholder="Search conversations..."
                debounceDelay={300}
              />
            </div>
          </section>

          {/* 3. MESSAGE LIST LOGIC */}
          <main className="space-y-6">
            {searchTerm && (
              <p className="text-sm font-bold text-[rgb(var(--color-fg-subtle))] px-2">
                Showing {friendsWithMeta.length} results for <span className="text-[rgb(var(--color-accent))]">"{searchTerm}"</span>
              </p>
            )}

            {friendsWithMeta.length === 0 ? (
              <NothingToSeeHere/>
            ) : (
              <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {friendsWithMeta.map((friend: FriendMeta) => (
                  <div key={friend._id} className="group relative">
                    {/* Hover Glow Effect */}
                    <div className="absolute -inset-0.5 bg-[rgb(var(--color-accent))] rounded-[2rem] opacity-0 group-hover:opacity-5 blur-md transition duration-500"></div>
                    <div className="relative">
                      <DmCard 
                        friend={friend} 
                        currentUserId={session.user._id.toString()} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

        </div>
      </div>
    </SocketProvider>
  );
}