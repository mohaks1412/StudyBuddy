import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server, Socket } from 'socket.io';
import MessageService from './src/services/message.service';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000');
const wsPath = process.env.NEXT_PUBLIC_WS_PATH || '/ws';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const onlineUsers = new Set<string>();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    try {
      handle(req, res, parse(req.url!, true));
    } catch (err) {
      console.error('Error:', err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, {
    path: wsPath,
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: true,
    },
  });

  // ✅ YOUR EXACT CODE (copied verbatim!)
  io.use((socket: Socket, next) => {
    const { userId } = socket.handshake.auth;
    if (!userId) {
      return next(new Error("Unauthorized"));
    }
    socket.data.userId = userId;
    next();
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;
    onlineUsers.add(userId);
    socket.join(`user:${userId}`);
    io.emit("users:online-set", Array.from(onlineUsers));
    console.log("🟢 Connected:", socket.id);

    // ✅ YOUR EXACT HANDLERS (100% unchanged!)
    socket.on("markRead", async ({ friendId }: { friendId: string }) => {
      console.log('👁️ Mark read:', { userId, friendId });
      try {
        const markedCount = await MessageService.markMessagesRead(userId, friendId);
        console.log(`✅ Marked ${markedCount} messages as read`);
        
        io.to(`user:${userId}`).emit("unreadUpdate", {
          friendId, 
          count: 0    
        });
        
        const friendUnreadCount = await MessageService.getUnreadCount(friendId, userId);
        io.to(`user:${friendId}`).emit("unreadUpdate", {
          friendId: userId,
          count: friendUnreadCount
        });
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    socket.on("unreadUpdate", async ({ friendId, count }: { friendId: string; count: number }) => {
      console.log('📊 Manual unread update:', { userId, friendId, count });
      io.to(`user:${userId}`).emit("unreadUpdate", {
        friendId,
        count
      });
    });

    socket.on("dm:send", async (
      payload: {
        toUserId: string;
        content?: string;
        media?: {
          url: string;
          type: "image" | "video" | "document" | "audio";
          name?: string;
          size?: number;
        };
      },
      ack?: (res: { ok: boolean; message?: any; error?: string }) => void
    ) => {
      try {
        const { toUserId, content, media } = payload;
        console.log('📨 DM sent:', { from: userId, to: toUserId });

        const message = await MessageService.sendMessage(userId, toUserId, content, media);
        io.to(`user:${toUserId}`).emit("dm:new", message);

        const unreadCount = await MessageService.getUnreadCount(toUserId, userId);
        io.to(`user:${toUserId}`).emit("unreadUpdate", {
          friendId: userId,    
          count: unreadCount  
        });

        io.to(`user:${userId}`).emit("dm:new", message);
        ack?.({ ok: true, message });
      } catch (err: any) {
        console.error("DM send error:", err);
        ack?.({ ok: false, error: err.message });
      }
    });

    socket.on("dm:bulk-delete", async (payload: { messageIds: string[] }) => {
      const { messageIds } = payload;
      
      if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
        socket.emit("error", { message: "No messages selected" });
        return;
      }

      if (messageIds.length > 100) {
        socket.emit("error", { message: "Too many messages selected (max 100)" });
        return;
      }

      try {
        const messages = await MessageService.findMessagesByIds(messageIds);
        const areAllMine = messages.every(msg => msg.sender._id.toString() === userId);
        
        if (!areAllMine || messages.length !== messageIds.length) {
          socket.emit("error", { message: "Can only delete your own messages" });
          return;
        }

        const result = await MessageService.bulkDeleteMessages(userId, messageIds);
        
        if (!result.deletedCount || result.deletedCount !== messageIds.length) {
          socket.emit("error", { message: "Some messages could not be deleted" });
          return;
        }

        console.log(`🗑️ User ${userId} bulk deleted ${result.deletedCount} messages`);
        io.emit("dm:bulk-deleted", messageIds);
        socket.emit("dm:bulk-deleted", messageIds);
      } catch (error: any) {
        console.error("Bulk delete error:", error);
        socket.emit("error", { message: "Failed to delete messages" });
      }
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("users:online-set", Array.from(onlineUsers));
      console.log("🔴 Disconnected:", socket.id);
    });
  });

  // ✅ FIXED UPGRADE (no type errors!)
  server.on('upgrade', (req: any, socket: any, head: any) => {
    const { pathname } = parse(req.url!, true);
    
    if (pathname === '/_next/webpack-hmr') return;
    if (pathname === wsPath) {
        // CRITICAL: Add _query for Socket.io types
        (req as any)._query = parse(req.url!, true).query;
        io.engine.handleUpgrade(req, socket, head);
        return;
    }
    socket.destroy();
  });

  server.listen(port, () => {
    console.log(`🚀 http://${hostname}:${port}`);
    console.log(`📡 ws://${hostname}:${port}${wsPath}`);
  });
});
