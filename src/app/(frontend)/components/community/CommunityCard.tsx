// components/community/CommunityCard.tsx (SERVER COMPONENT)
import Link from 'next/link';
import { Users, ArrowRight, Check } from 'lucide-react';

interface CommunityCardProps {
  community: {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    memberCount?: number;
  };
  isJoined?: boolean;
  showPostsLink?: boolean;
  className?: string;
}

export default function CommunityCard({
  community,
  isJoined = false,
  showPostsLink = false,
  className = '',
}: CommunityCardProps) {
  const memberCount = community.memberCount ?? 0;

  return (
    <Link 
      href={`/community/${community._id}`}
    >
    <div className={`
      group relative flex flex-col h-full p-6
      rounded-[2rem] transition-all duration-500
      bg-[rgb(var(--color-bg-soft)/0.4)] backdrop-blur-sm
      border border-[rgb(var(--color-border)/0.5)]
      hover:border-[rgb(var(--color-accent)/0.4)]
      hover:shadow-2xl hover:shadow-[rgb(var(--color-accent)/0.1)]
      hover:-translate-y-2
      ${className}
    `}>
      {/* Decorative Glow - Only visible on hover */}
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[rgb(var(--color-accent)/0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        {/* TOP SECTION: Title and Join Status */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-[rgb(var(--color-fg))] leading-tight line-clamp-1 group-hover:text-[rgb(var(--color-accent))] transition-colors">
              {community.name}
            </h3>
          </div>
          
          {isJoined && (
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[rgb(var(--color-success)/0.1)] text-[rgb(var(--color-success))]">
              <Check className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* MIDDLE SECTION: Description */}
        <p className="text-[rgb(var(--color-fg-muted))] text-sm leading-relaxed line-clamp-3 mb-8">
          {community.description || 'Join this community to share resources and learn alongside peers.'}
        </p>

        {/* BOTTOM SECTION: Stats & Action */}
        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[rgb(var(--color-fg-subtle))]">
              Community Size
            </span>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {/* Visual Avatar Stack Representation */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-[rgb(var(--color-bg))] bg-[rgb(var(--color-bg-strong))]" />
                ))}
              </div>
              <span className="text-xs font-bold text-[rgb(var(--color-fg))]">
                {memberCount.toLocaleString()}
              </span>
            </div>
          </div>

          {!isJoined ? (
            <div 
              className="
                px-5 py-2.5 rounded-xl text-sm font-bold
                bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))]
                hover:bg-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-fg))]
                transition-all duration-300 shadow-lg shadow-[rgb(var(--color-fg)/0.1)]
              "
            >
              Join
            </div>
          ) : (
            showPostsLink && (
              <Link 
                href={`/community/${community._id}`}
                className="
                  flex items-center gap-2 text-sm font-bold 
                  text-[rgb(var(--color-accent))] hover:underline
                "
              >
                Enter
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )
          )}
        </div>
      </div>
    </div>
    </Link>
  );
}