import dbConnect from "@/lib/dbConnect"
import TextPostModel from "@/models/TextPost.model"
import DocPostModel from "@/models/DocPost.model"
import { TextPostSchema, DocPostSchema } from "@/schemas/post.schema"
import type { TextPost, DocPost, PostId } from "../app/types/post"
import {z} from "zod";
import {del} from '@vercel/blob';
import { Types } from "mongoose"
import Community from "@/models/Community.model"
import MindMapPostModel from "@/models/MindMap.model";
import type { MindMapDoc} from "@/models/MindMap.model"

type PopulatedUser = {
  _id: string;
  username: string;
  email: string;
};
type WithPopulatedAuthor<T> = Omit<T, "authorId"> & {
  authorId: PopulatedUser;
};


class PostService {


  normalizePostIds(post: any) {
    if (post._id instanceof Types.ObjectId) {
      post._id = post._id.toString();
    }

    
    if (post.community instanceof Types.ObjectId) {
      post.community = post.community.toString();
    }

    
    if (post.authorId && post.authorId._id instanceof Types.ObjectId) {
      post.authorId._id = post.authorId._id.toString();
    }

    
    if (post.authorId instanceof Types.ObjectId) {
      post.authorId = post.authorId.toString();
    }

    return post;
  }
  

  async createTextPost(
    authorId: string,
    data: z.infer<typeof TextPostSchema>
  ): Promise<TextPost> {
    const validated = TextPostSchema.parse(data)
    await dbConnect()
    
    return TextPostModel.create({
      authorId,
      ...validated,
    })
  }

  
  async createDocPost(
    authorId: string,
    data: z.infer<typeof DocPostSchema>
  ): Promise<DocPost> {
    const validated = DocPostSchema.parse(data)
    await dbConnect()
    
    return DocPostModel.create({
      authorId,
      ...validated,
    })
  }

    
  async  fetchPostsByUser(
    userId: string,
    options: {
      type?: "question" | "answer" | "notes" | "question-paper" | "mind-map";
      limit?: number;
      page?: number;
    } = {}
  ): Promise<(TextPost | DocPost | MindMapDoc)[]> {
    await dbConnect();

    const { type, limit = 20, page = 1 } = options;
    const skip = (page - 1) * limit;
    
    if (type === "question" || type === "answer") {
      const posts = await TextPostModel.find({ authorId: userId, type })
        .populate("authorId", "username email")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
      return posts as TextPost[];
    }

    if (type === "notes" || type === "question-paper") {
      const posts = await DocPostModel.find({ authorId: userId, type })
        .populate("authorId", "username email")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
      return posts as DocPost[];
    }

    if (type === "mind-map") {
      const posts = await MindMapPostModel.find({ authorId: userId })
        .populate("authorId", "username email")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
      return posts as MindMapDoc[];
    }

    const [textPosts, docPosts, mindMapPosts] = await Promise.all([
      TextPostModel.find({ authorId: userId })
        .populate("authorId", "username email")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip),

      DocPostModel.find({ authorId: userId })
        .populate("authorId", "username email")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip),

      MindMapPostModel.find({ authorId: userId })
        .populate("authorId", "username email")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip),
    ]);

    // Optional: sort merged by createdAt desc
    const merged = [
      ...textPosts,
      ...docPosts,
      ...mindMapPosts,
    ].sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return merged as (TextPost | DocPost | MindMapDoc)[];
  }

async fetchPostById(postId: PostId) {
  await dbConnect();

  const [textPost, docPost, mindMapPost] = await Promise.all([
    TextPostModel.findById(postId)
      .populate("authorId", "username email _id")
      .populate({
        path: "associate",
        populate: { path: "authorId", select: "username _id" },
      })
      .lean(),

    DocPostModel.findById(postId)
      .populate("authorId", "username email _id")
      .lean(),

    MindMapPostModel.findById(postId)
      .populate("authorId", "username email _id")
      .lean()
  ]);


  return textPost || docPost || mindMapPost || null;
}
  async updatePost(postId: PostId, userId: string, updateData: {
    title: string;
    subject?: string;
    content?: string;
    summary?: string;
    fileurl?: string;
  }): Promise<TextPost | DocPost | null> {
    await dbConnect();
    

    const [textPost, docPost] = await Promise.all([
      TextPostModel.findOne({ _id: postId, authorId: userId }),
      DocPostModel.findOne({ _id: postId, authorId: userId })
    ]);

    const post = textPost || docPost;
    if (!post) throw new Error("Post not found or unauthorized");

    if (docPost && (docPost.type === "notes" || docPost.type === "question-paper")) {

      if (updateData.fileurl && docPost.fileUrl) {
        try {
          await del(docPost.fileUrl);
        } catch (error) {
          console.warn("Old blob delete failed:", error);
        }
      }

      const newFileUrl = updateData.fileurl ? updateData.fileurl : docPost.fileUrl;

      
      return DocPostModel.findOneAndUpdate(
        { _id: postId, authorId: userId },
        {
          title: updateData.title,
          subject: updateData.subject,
          summary: updateData.summary,
          fileUrl: newFileUrl,
        },
        { new: true, runValidators: true }
      )?.populate("authorId", "username email");
    }

    if (textPost) {
      return TextPostModel.findOneAndUpdate(
        { _id: postId, authorId: userId },
        {
          title: updateData.title,
          subject: updateData.subject,
          content: updateData.content,
        },
        { new: true, runValidators: true }
      )?.populate("authorId", "username email");
    }

    throw new Error("Invalid post type");
  }

async deletePost(postId: PostId, userId: string): Promise<boolean> {
    await dbConnect();

    const [textPost, docPost, mindmapPost] = await Promise.all([
        TextPostModel.findOne({ _id: postId, authorId: userId }),
        DocPostModel.findOne({ _id: postId, authorId: userId }),
        MindMapPostModel.findOne({_id: postId, authorId: userId}),
    ]);

    
    if (docPost?.fileUrl) {
        try {
            await del(docPost.fileUrl);
        } catch (error) {
            console.warn("Blob delete failed:", error);
        }
    }

    
    if (docPost) {
        await DocPostModel.findOneAndDelete({ _id: postId, authorId: userId });
        return true;
    }

    if(mindmapPost){
      await MindMapPostModel.findOneAndDelete({_id: postId, authorId: userId})
      return true;
    }

    if (textPost) {
      
        if (textPost.type === "question") {
          
            await TextPostModel.deleteMany({ 
                _id: { $in: textPost.associate || [] } 
            });
        }
        
        await TextPostModel.findOneAndDelete({ _id: postId, authorId: userId });
        return true;
    }

    return false;
}

// 1. fetchFeedForUser
async fetchFeedForUser(
  userId: string,
  communities: string[],
  options: { limit?: number; page?: number } = {}
): Promise<(TextPost | DocPost | MindMapDoc)[]> {
  await dbConnect();
  const { limit = 20, page = 1 } = options;

  if (!communities.length) return [];

  const [textPosts, docPosts, mindMapPosts] = await Promise.all([
    TextPostModel.find({
      community: { $in: communities },
    })
    .populate("authorId", "username email")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit),

    DocPostModel.find({
      community: { $in: communities },
    })
    .populate("authorId", "username email")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit),

    MindMapPostModel.find({
      community: { $in: communities },
    })
    .populate("authorId", "username email")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit)
  ]);

  return [...textPosts, ...docPosts, ...mindMapPosts] as (TextPost | DocPost | MindMapDoc)[];
}

async fetchRecentPosts(options: { limit?: number; page?: number } = {}) {
  await dbConnect();
  const { limit = 20, page = 1 } = options;

  const [textPosts, docPosts, mindMapPosts] = await Promise.all([
    TextPostModel.find({})
    .populate("authorId", "username email")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit),

    DocPostModel.find({})
    .populate("authorId", "username email")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit),

    MindMapPostModel.find({})
    .populate("authorId", "username email")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit)
  ]);

  return [...textPosts, ...docPosts, ...mindMapPosts] as (TextPost | DocPost | MindMapDoc)[];
}

// 3. fetchPostsByCommunity
async fetchPostsByCommunity(
  communityId: string, 
  options: { limit?: number; page?: number } = {}
) {
  await dbConnect();
  
  const communityObjectId = new Types.ObjectId(communityId);
  const community = await Community.findById(communityObjectId);
  if (!community) return [];

  const limit = options.limit || 20;
  const skip = (options.page || 1 - 1) * limit;

  const [docPosts, textPosts, mindMapPosts] = await Promise.all([
    DocPostModel.find({ community: community._id })
    .populate('authorId', 'username email avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean(),

    TextPostModel.find({ community: community._id })
    .populate('authorId', 'username email avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean(),

    MindMapPostModel.find({ community: community._id })
    .populate('authorId', 'username email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean()
  ]);

  const merged = [...docPosts, ...textPosts, ...mindMapPosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return merged.map(this.normalizePostIds);
}

  async countByAuthor(userId: string) {
    const [textPostCount, docPostCount, mindmapCount] = await Promise.all([
      TextPostModel.countDocuments({ author: userId }),
      DocPostModel.countDocuments({ author: userId }),
      MindMapPostModel.countDocuments({authorId : userId})
    ])

    return textPostCount + docPostCount + mindmapCount
  }

 async createAnswer(
    authorId: string,
    data: {
      questionId: string;
      content: string;
      title?: string;
      subject?: string | null;
      community?: string | null;
    }
  ): Promise<TextPost> {
    const { questionId, content, title, subject, community } = data;

    if (!questionId) throw new Error("questionId is required");
    if (!content || !content.trim()) throw new Error("content is required");

    await dbConnect();

    const questionObjectId = new Types.ObjectId(questionId);

    const question = await TextPostModel.findById(questionObjectId);
    if (!question || question.type !== "question") {
      throw new Error("Parent question not found or invalid");
    }

    const answer = await TextPostModel.create({
      authorId,
      title: title && title.trim().length ? title : `Answer: ${question.title}`,
      content,
      type: "answer",
      subject: subject ?? question.subject,
      community: community ?? question.community,
      associate: [question._id],
    });
    
    question.associate.push(answer._id);
    await question.save();

    await answer.populate("authorId", "username email");

    return answer as TextPost;
  }
}

export default new PostService();
