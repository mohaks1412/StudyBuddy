"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSocket } from '@/app/(frontend)/providers/SocketProvider';

export interface FriendMeta {
  _id: string;
  username: string;
  name?: string;
  avatar?: string;
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface DmCardProps {
  friend: FriendMeta;
  currentUserId: string;
}

export default function DmCard({ friend, currentUserId }: DmCardProps) {
  const [unreadCount, setUnreadCount] = useState(friend.unreadCount || 0);
  const { socket, isConnected } = useSocket();

  // 🔥 Logic preserved word-for-word
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleUnreadUpdate = (data: { friendId: string; count: number }) => {
      if (data.friendId === friend._id) {
        setUnreadCount(data.count);
      }
    };

    socket.on('unreadUpdate', handleUnreadUpdate);

    return () => {
      socket.off('unreadUpdate', handleUnreadUpdate);
    };
  }, [socket, isConnected, friend._id]);

  const displayName = friend.name || friend.username;
  const hasUnread = unreadCount > 0;
  
  const timeString = friend.lastMessageTime 
    ? new Date(friend.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const handleChatClick = () => {
    if (hasUnread && socket) {
      socket.emit('markRead', { friendId: friend._id });
      setUnreadCount(0);
    }
  };

  return (
    <Link 
      href={`/chat/${friend._id}`}
      onClick={handleChatClick}
      className="
        group relative flex items-center gap-4 p-4 
        bg-transparent hover:bg-[rgb(var(--color-bg-soft)/0.5)] 
        border-b border-[rgb(var(--color-border)/0.3)]
        transition-all duration-300 no-underline outline-none
      "
    >
      {/* 1. AVATAR - Squircle design to match profile */}
      <div className="relative flex-shrink-0">
        <div className="
          w-14 h-14 rounded-2xl overflow-hidden
          bg-gradient-to-tr from-[rgb(var(--color-bg-strong))] to-[rgb(var(--color-bg-soft))]
          border border-[rgb(var(--color-border)/0.5)]
          flex items-center justify-center transition-transform group-hover:scale-105
        ">
          {friend.avatar ? (
            <img 
              src={friend.avatar} 
              alt={displayName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl font-black text-[rgb(var(--color-accent))]">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        
        {/* Connection Status Dot (Optional Visual) */}
        <div className={`
          absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-[rgb(var(--color-bg))]
          ${isConnected ? "bg-[rgb(var(--color-success))]" : "bg-[rgb(var(--color-fg-subtle))]/30"}
        `} />
      </div>

      {/* 2. CONTENT */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className={`
            text-base tracking-tight truncate transition-colors
            ${hasUnread ? "font-black text-[rgb(var(--color-fg))]" : "font-bold text-[rgb(var(--color-fg-muted))] group-hover:text-[rgb(var(--color-fg))]"}
          `}>
            {displayName}
          </h3>
          
          {/* Subtle Timestamp */}
          {friend.lastMessageTime && (
            <span className="text-[10px] font-bold text-[rgb(var(--color-fg-subtle))] uppercase tracking-tighter">
              {timeString}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <p className={`
            text-sm truncate leading-tight
            ${hasUnread ? "font-bold text-[rgb(var(--color-fg))]" : "text-[rgb(var(--color-fg-subtle))]"}
          `}>
            {friend.lastMessage || "No messages yet..."}
          </p>

          {/* 3. UNREAD INDICATOR - Minimalist Pill */}
          {hasUnread && (
            <div className="
              flex items-center justify-center 
              bg-[rgb(var(--color-accent))] text-[rgb(var(--color-accent-fg))] 
              min-w-[20px] h-5 px-1.5 rounded-full 
              text-[10px] font-black shadow-lg shadow-[rgb(var(--color-accent)/0.3)]
            ">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}