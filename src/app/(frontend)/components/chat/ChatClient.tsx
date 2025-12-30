"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { 
  ChevronLeft, MessageCircle, Trash2, CheckSquare, X, Users, 
  Paperclip, Loader2, XCircle, Image as ImageIcon, 
  FileText, Music, Video as VideoIcon, Send, Sparkles, Plus
} from "lucide-react";
import { ConfirmOverlay } from "@/app/(frontend)/components/ConfirmOverlay";
import { uploadFile } from "../../posts/uploader";
import { useSocket } from "@/app/(frontend)/providers/SocketProvider";

type Message = {
  _id: string;
  sender: { _id: string; username: string; avatar?: string };
  receiver: { _id: string; username: string; avatar?: string };
  content?: string;
  media?: {
    url: string;
    type: "image" | "video" | "document" | "audio";
    name?: string;
    size?: number;
  };
  createdAt: string;
};

type Props = {
  currentUserId: string;
  receiverId: string;
  receiverInfo: { _id: string; username: string; avatar?: string };
  initialMessages: Message[];
};

export default function ChatClient({
  currentUserId,
  receiverId,
  receiverInfo,
  initialMessages,
}: Props) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [receiverOnline, setReceiverOnline] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [countRecieverSelected, setCountRecieverSelected] = useState<number>(0);
  const [deletingMessages, setDeletingMessages] = useState<Set<string>>(new Set());
  const [confirmOverlayOpen, setConfirmOverlayOpen] = useState(false);
  const [unreadCountForThisFriend, setUnreadCountForThisFriend] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSendMessage = input.trim() || selectedFile;

  useEffect(() => {
    const receiverSelectedCount = Array.from(selectedMessages).filter((id) => {
      const message = messages.find((msg) => msg._id === id);
      return message && message.sender._id !== currentUserId;
    }).length;
    setCountRecieverSelected(receiverSelectedCount);
  }, [selectedMessages, messages, currentUserId]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (message: Message) => {
      const isRelevant =
        (message.sender._id === currentUserId && message.receiver._id === receiverId) ||
        (message.sender._id === receiverId && message.receiver._id === currentUserId);
      
      if (isRelevant) {
        setMessages((prev) => [...prev, message]);
        if (message.sender._id === receiverId) {
          socket.emit("markRead", { friendId: receiverId });
        }
      }
    };

    const handleMessageDeleted = (deletedMessageId: string) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== deletedMessageId));
    };

    const handleBulkDeleted = (deletedMessageIds: string[]) => {
      setDeletingMessages(prev => {
        const next = new Set(prev);
        deletedMessageIds.forEach(id => next.add(id));
        return next;
      });

      requestAnimationFrame(() => {
        setTimeout(() => {
          const deletedSet = new Set(deletedMessageIds);
          setMessages(prev => prev.filter(msg => !deletedSet.has(msg._id)));
          setDeletingMessages(new Set());
          setSelectedMessages(new Set());
          setIsSelecting(false);
          setConfirmOverlayOpen(false);
        }, 350);
      });
    };

    const handleUnreadUpdate = (payload: { friendId: string; count: number }) => {
      if (payload.friendId === receiverId) setUnreadCountForThisFriend(payload.count);
    };

    const handleOnlineSet = (onlineSet: string[]) => {
      setOnlineUsers(new Set(onlineSet));
      setReceiverOnline(onlineSet.includes(receiverId));
    };

    const handleUserOnline = (userId: string) => {
      if (userId === receiverId) setReceiverOnline(true);
    };

    const handleUserOffline = (userId: string) => {
      if (userId === receiverId) setReceiverOnline(false);
    };

    socket.on("dm:new", handleNewMessage);
    socket.on("dm:deleted", handleMessageDeleted);
    socket.on("dm:bulk-deleted", handleBulkDeleted);
    socket.on("unreadUpdate", handleUnreadUpdate);
    socket.on("users:online-set", handleOnlineSet);
    socket.on("user:online", handleUserOnline);
    socket.on("user:offline", handleUserOffline);

    return () => {
      socket.off("dm:new", handleNewMessage);
      socket.off("dm:deleted", handleMessageDeleted);
      socket.off("dm:bulk-deleted", handleBulkDeleted);
      socket.off("unreadUpdate", handleUnreadUpdate);
      socket.off("users:online-set", handleOnlineSet);
      socket.off("user:online", handleUserOnline);
      socket.off("user:offline", handleUserOffline);
    };
  }, [socket, isConnected, receiverId, currentUserId]);

  useEffect(() => {
    if (!socket || !isConnected || !receiverId) return;
    socket.emit("markRead", { friendId: receiverId });
    const handleFocus = () => socket.emit("markRead", { friendId: receiverId });
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [socket, isConnected, receiverId, currentUserId]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    event.target.value = '';
  };

  const sendMessage = useCallback(async () => {
    if (!socket || !isConnected || (!input.trim() && !selectedFile)) return;
    setUploading(true);
    try {
      let media = null;
      if (selectedFile) {
        const url = await uploadFile(selectedFile);
        const mediaType = selectedFile.type.startsWith('image/') ? 'image' :
                         selectedFile.type.startsWith('video/') ? 'video' :
                         selectedFile.type.startsWith('audio/') ? 'audio' : 'document';
        media = { url, type: mediaType, name: selectedFile.name, size: selectedFile.size };
      }
      socket.emit("dm:send", { toUserId: receiverId, content: input.trim() || undefined, media: media || undefined });
      setInput("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Send failed:", error);
    } finally {
      setUploading(false);
    }
  }, [socket, isConnected, input, selectedFile, receiverId]);

  const toggleMessage = useCallback((messageId: string) => {
    setSelectedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) newSet.delete(messageId);
      else newSet.add(messageId);
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedMessages(new Set());
    setIsSelecting(false);
  }, []);

  const requestBulkDelete = useCallback(() => {
    if (!selectedMessages.size || !socket) return;
    setConfirmOverlayOpen(true);
  }, [selectedMessages, socket]);

  const confirmBulkDelete = useCallback(() => {
    if (!socket) return;
    socket.emit("dm:bulk-delete", { messageIds: Array.from(selectedMessages) });
    setConfirmOverlayOpen(false);
  }, [socket, selectedMessages]);

  const cancelBulkDelete = useCallback(() => {
    setConfirmOverlayOpen(false);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openMedia = (url: string, type: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isMine = message.sender._id === currentUserId;
    const isSelected = selectedMessages.has(message._id);
    const isDeleting = deletingMessages.has(message._id);
    
    return (
      <div 
        onClick={() => isSelecting && toggleMessage(message._id)}
        className={`flex flex-col mb-4 group animate-in fade-in slide-in-from-bottom-2 duration-300 relative
          ${isSelecting ? "cursor-pointer" : ""}
          ${isDeleting ? 'opacity-0 scale-95 transition-all duration-300' : ''}
        `}
      >
        <div className={`flex w-full items-end gap-3 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
          
          {/* Entire bubble logic updated to be the hit-area when isSelecting */}
          <div
            className={`
              relative max-w-[75%] px-4 py-2.5 rounded-2xl transition-all duration-300
              ${isMine 
                ? "bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] rounded-br-none shadow-sm" 
                : "bg-[rgb(var(--color-bg-soft)/0.6)] text-[rgb(var(--color-fg))] rounded-bl-none border border-[rgb(var(--color-border)/0.3)] backdrop-blur-sm"
              }
              ${isSelected ? "ring-2 ring-[rgb(var(--color-danger))] scale-[1.02] shadow-lg translate-x-1" : ""}
              ${isSelecting && !isSelected ? "opacity-60 grayscale-[0.5]" : ""}
            `}
          >
            {/* Visual Checkmark indicator - purely decorative now, click happens on parent */}
            {isSelecting && (
               <div className={`absolute -top-2 ${isMine ? "-left-2" : "-right-2"} z-20`}>
                  <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center shadow-md ${isSelected ? "bg-[rgb(var(--color-danger))] border-white" : "bg-[rgb(var(--color-bg))] border-[rgb(var(--color-border))]"}`}>
                    {isSelected && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                  </div>
               </div>
            )}

            {message.media && (
              <div className="mb-2 rounded-xl overflow-hidden cursor-pointer group/media" onClick={(e) => { 
                if(!isSelecting) {
                  e.stopPropagation(); 
                  openMedia(message.media!.url, message.media!.type); 
                }
              }}>
                 {message.media.type === "image" ? (
                   <img src={message.media.url} className="w-full object-cover max-h-60 hover:brightness-110 transition-all" alt="" />
                 ) : (
                   <div className="p-3 bg-[rgb(var(--color-bg)/0.2)] flex items-center gap-3 border border-white/10 rounded-xl">
                      {message.media.type === "audio" ? <Music className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      <div className="min-w-0">
                         <p className="text-xs font-bold truncate">{message.media.name}</p>
                         <p className="text-[10px] opacity-60">{(message.media.size! / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                   </div>
                 )}
              </div>
            )}
            
            {message.content && <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{message.content}</p>}
          </div>
        </div>
        <p className={`text-[9px] font-black uppercase tracking-[0.1em] text-[rgb(var(--color-fg-subtle))] opacity-40 mt-1 ${isMine ? "text-right mr-1" : "text-left ml-1"}`}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto animate-in fade-in duration-700">
      
      <header className="flex items-center justify-between p-5 bg-[rgb(var(--color-bg-soft)/0.4)] backdrop-blur-xl border border-[rgb(var(--color-border)/0.5)] rounded-[2rem] mb-6 shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/chat" className="p-2 hover:bg-[rgb(var(--color-bg-strong)/0.1)] rounded-full transition-colors shrink-0">
            <ChevronLeft className="w-5 h-5 text-[rgb(var(--color-fg-muted))]" />
          </Link>
          <div className="relative shrink-0">
             <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[rgb(var(--color-accent))] to-[rgb(var(--color-success))] flex items-center justify-center text-lg font-black text-[rgb(var(--color-accent-fg))] shadow-md">
                {receiverInfo.username[0].toUpperCase()}
             </div>
             {receiverOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[rgb(var(--color-success))] border-2 border-[rgb(var(--color-bg))]" />}
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-black text-[rgb(var(--color-fg))] truncate">{receiverInfo.username}</h1>
            <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-fg-subtle))] opacity-60">
                {receiverOnline ? "Online Now" : "Offline"}
                </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
           <button
            onClick={() => { if (isSelecting) clearSelection(); setIsSelecting(!isSelecting); }}
            className={`p-2.5 rounded-xl transition-all border flex items-center gap-2 ${isSelecting ? "bg-[rgb(var(--color-danger))] border-transparent text-white px-4" : "bg-transparent border-[rgb(var(--color-border)/0.5)] text-[rgb(var(--color-fg-muted))] hover:text-[rgb(var(--color-fg))] hover:bg-[rgb(var(--color-bg-soft))]"}`}
          >
            {isSelecting ? <><X className="w-4 h-4" /> <span className="text-xs font-black uppercase tracking-widest">Cancel</span></> : <Trash2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar scroll-smooth">
        {messages.map((message) => (
          <MessageBubble key={message._id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-6">
        {isSelecting && selectedMessages.size > 0 && countRecieverSelected === 0 ? (
          <div className="flex items-center justify-between p-4 bg-[rgb(var(--color-danger))] rounded-2xl text-white animate-in slide-in-from-bottom-4 shadow-xl">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg"><Trash2 className="w-4 h-4" /></div>
                <p className="text-sm font-black uppercase tracking-widest">{selectedMessages.size} selected</p>
             </div>
             <div className="flex gap-2">
                <button onClick={clearSelection} className="px-4 py-2 hover:bg-white/10 rounded-xl font-bold text-xs transition-all">Clear All</button>
                <button onClick={requestBulkDelete} className="px-5 py-2 bg-white text-[rgb(var(--color-danger))] rounded-xl font-black text-xs transition-all hover:scale-105">Delete for Me</button>
             </div>
          </div>
        ) : (
          <div className="relative">
            {selectedFile && (
              <div className="absolute bottom-full left-0 mb-4 p-3 bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] rounded-2xl flex items-center gap-3 animate-in slide-in-from-bottom-2 shadow-lg backdrop-blur-md">
                <div className="p-2 bg-[rgb(var(--color-accent)/0.1)] rounded-lg text-[rgb(var(--color-accent))]">
                   {selectedFile.type.startsWith('image/') ? <ImageIcon className="w-4 h-4" /> : <Paperclip className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                   <p className="text-xs font-bold truncate max-w-[150px]">{selectedFile.name}</p>
                   <p className="text-[9px] opacity-60">Ready to upload</p>
                </div>
                <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-red-500/10 rounded-lg text-[rgb(var(--color-danger))]">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className={`flex items-end gap-2 p-2 bg-[rgb(var(--color-bg-soft)/0.6)] backdrop-blur-xl border border-[rgb(var(--color-border)/0.5)] rounded-[2.5rem] transition-all duration-300 shadow-sm focus-within:shadow-md focus-within:border-[rgb(var(--color-accent))]`}>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()} 
                disabled={uploading || !isConnected || isSelecting}
                className="p-3.5 text-[rgb(var(--color-fg-muted))] hover:text-[rgb(var(--color-accent))] transition-colors disabled:opacity-30"
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-6 h-6" />}
              </button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
              
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={isSelecting ? "Finish selection to message..." : "Type your message..."}
                disabled={isSelecting}
                className="flex-1 bg-transparent border-none text-[rgb(var(--color-fg))]
                  placeholder-[rgb(var(--color-fg-subtle))]
                  font-medium py-3.5 max-h-32 scrollbar-none disabled:opacity-50

                  outline-none
                  focus:outline-none
                  focus:ring-0
                  focus-visible:outline-none
                  focus-visible:ring-0"
              />

              <button
                disabled={!canSendMessage || uploading || !isConnected || isSelecting}
                onClick={sendMessage}
                className={`p-4 rounded-full transition-all shadow-lg ${canSendMessage ? "bg-[rgb(var(--color-accent))] text-[rgb(var(--color-accent-fg))] scale-100 shadow-[rgb(var(--color-accent)/0.3)]" : "bg-[rgb(var(--color-bg-strong)/0.2)] text-[rgb(var(--color-fg-subtle))] scale-90 opacity-40 cursor-not-allowed"}`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmOverlay
        open={confirmOverlayOpen}
        title="Delete History"
        description={`Are you sure you want to remove ${selectedMessages.size} selected messages?`}
        onCancel={cancelBulkDelete}
        primaryOnClick={confirmBulkDelete}
        primaryVariant="danger"
        primaryLabel="Remove"
      />
    </div>
  );
}