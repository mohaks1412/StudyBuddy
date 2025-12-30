
import dbConnect from "../lib/dbConnect";
import Message from "../models/Message.model";
import User from "../models/user.model";
import { Types } from "mongoose";
import { del } from '@vercel/blob';

interface IMedia {
  url: string;
  type: "image" | "video" | "document" | "audio";
  name?: string;
  size?: number;
}

interface SerializedMessage {
  _id: string;
  sender: {
    _id: string;
    username: string;
    avatar?: string;
  };
  receiver: {
    _id: string;
    username: string;
    avatar?: string;
  };
  content?: string;
  media?: IMedia;
  createdAt: string;
}

class MessageService {
async sendMessage(
  senderId: string,
  receiverId: string,
  content?: string,
  media?: IMedia
): Promise<SerializedMessage> {
  await dbConnect();

  const cleanMedia = media ? { 
    url: media.url, 
    type: media.type, 
    ...(media.name && { name: media.name }),
    ...(media.size && { size: media.size })
  } : undefined;

  const messageData: any = {
    sender: new Types.ObjectId(senderId),
    receiver: new Types.ObjectId(receiverId),
  };

  if (content?.trim()) messageData.content = content.trim();
  if (cleanMedia) messageData.media = cleanMedia;

  if (!messageData.content && !messageData.media) {
    throw new Error("Message must contain content or media");
  }

  console.log(messageData);
  
  const savedMessages : any = await Message.create(messageData);


  const [senderDoc, receiverDoc] = await Promise.all([
    User.findById(savedMessages.sender).select('username avatar _id').lean(),
    User.findById(savedMessages.receiver).select('username avatar _id').lean(),
  ]);


  if (!savedMessages) throw new Error('Failed to fetch saved message');

  
  
    return {
    _id: savedMessages._id.toString(),
    sender: {
        _id: senderDoc._id!.toString(),
        username: senderDoc.username,
    },
    receiver: {
        _id: receiverDoc._id!.toString(),
        username: receiverDoc.username,
    },
    content: savedMessages.content,
    media: savedMessages.media,
    createdAt: savedMessages.createdAt.toISOString(),
    };
}


  async getDMs(
    userId1: string,
    userId2: string,
    limit: number = 50,
    before?: string
  ): Promise<SerializedMessage[]> {
    await dbConnect();

    const match: any = {
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 },
      ],
    };

    if (before) {
      match._id = { $lt: new Types.ObjectId(before) };
    }

    const messages = await Message.find(match)
      .populate(["sender", "receiver"], "username avatar _id")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

      
    return messages.reverse().map((message: any) => ({
      _id: message._id.toString(),
      sender: {
        _id: message.sender._id.toString(),
        username: message.sender.username,
        avatar: message.sender.avatar,
      },
      receiver: {
        _id: message.receiver._id.toString(),
        username: message.receiver.username,
        avatar: message.receiver.avatar,
      },
      content: message.content,
      media: message.media,
      createdAt: message.createdAt.toISOString(),
    }));
  }


  async getRecentConversations(userId: string): Promise<any[]> {
    await dbConnect();

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: 100,
      },
      {
        $group: {
          _id: {
            otherUser: {
              $cond: [
                { $eq: ["$sender", new Types.ObjectId(userId)] },
                "$receiver",
                "$sender",
              ],
            },
          },
          lastMessage: { $first: "$$ROOT" },
          messageCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.otherUser",
          foreignField: "_id",
          as: "otherUser",
          pipeline: [{ $project: { username: 1, avatar: 1, _id: 1 } }],
        },
      },
      { $unwind: "$otherUser" },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
      { $limit: 20 },
    ]).exec();

    return conversations.map((conv: any) => ({
      otherUser: {
        _id: conv.otherUser._id.toString(),
        username: conv.otherUser.username,
        avatar: conv.otherUser.avatar,
      },
      lastMessage: {
        _id: conv.lastMessage._id.toString(),
        content: conv.lastMessage.content,
        media: conv.lastMessage.media,
        createdAt: conv.lastMessage.createdAt.toISOString(),
      },
      messageCount: conv.messageCount,
    }));
  }

  
  async findMessagesByIds(messageIds: string[]) {
    await dbConnect();
    return await Message.find({ _id: { $in: messageIds } })
      .populate("sender receiver", "username")
      .lean();
  }

  async bulkDeleteMessages(userId: string, messageIds: string[]): Promise<any> {
    await dbConnect();
    
    
    const messagesToDelete = await Message.find({ 
      _id: { $in: messageIds.map(id => new Types.ObjectId(id)) }, 
      sender: new Types.ObjectId(userId)
    })
    .select('media.url')
    .lean();

    
    const blobUrls = messagesToDelete
      .filter((msg: any) => msg.media && msg.media.url)
      .map((msg: any) => msg.media.url);

    if (blobUrls.length > 0) {
      
      try {
        await Promise.all(blobUrls.map(url => del(url)));
      } catch (blobError) {
        console.error('Blob deletion error (continuing with DB delete):', blobError);
      }
    }

    
    const result = await Message.deleteMany({
      _id: { $in: messageIds.map(id => new Types.ObjectId(id)) },
      sender: new Types.ObjectId(userId)
    });

    return result;
  }

  
async markMessagesRead(userId: string, friendId: string): Promise<number> {
  await dbConnect();
  
  const result = await Message.updateMany(
    { 
      receiver: userId, 
      sender: friendId,
      unread: true
    },
    { unread: false }  
  );
  
  return result.modifiedCount;
}

async getUnreadCount(userId1: string, userId2: string): Promise<number> {
  await dbConnect();
  
  return await Message.countDocuments({
    sender: userId2,
    receiver: userId1,
    unread: true 
  });
}

}

export default new MessageService();
