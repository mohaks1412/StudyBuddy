import dbConnect from "@/lib/dbConnect"
import TextPostModel from "@/models/TextPost.model"
import DocPostModel from "@/models/DocPost.model"
import { TextPostSchema, DocPostSchema } from "@/schemas/post.schema"
import type { TextPost, DocPost, PostId } from "../app/types/post"
import {z} from "zod";

class PostService {
  /**
   * Create text-based post (question, answer, note)
   */
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

  /**
   * Create document post (question paper)
   */
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

  /**
   * Fetch all user's posts (both text + docs)
   */
  async fetchPostsByUser(
    userId: string,
    options: {
      type?: "question" | "answer" | "notes" | "question-paper"
      limit?: number
      page?: number
    } = {}
  ): Promise<(TextPost | DocPost)[]> {
    await dbConnect()
    const { type, limit = 20, page = 1 } = options

    // Fetch both models based on type
    const [textPosts, docPosts] = await Promise.all([
      TextPostModel.find({ 
        authorId: userId,
        ...(type === "question" || type === "answer"  ? { type } : {})
      })
      .populate("authorId", "username email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit),
      
      type === "question-paper" || type === "notes"
        ? DocPostModel.find({ authorId: userId , ...(type && { type })})
            .populate("authorId", "username email")
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
        : Promise.resolve([])
    ])

    return [...textPosts, ...docPosts] as (TextPost | DocPost)[]
  }

  /**
   * Fetch single post by ID (handles both models)
   */
  async fetchPostById(postId: PostId): Promise<TextPost | DocPost | null> {
    await dbConnect()
    
    const textPost = await TextPostModel.findById(postId)
      .populate("authorId", "username email")
      .populate("associate", "title content authorId")
    
    if (textPost) return textPost

    return DocPostModel.findById(postId)
      .populate("authorId", "username email")
  }

  /**
   * Update text post (owner only)
   */
  async updateTextPost(
    postId: PostId,
    userId: string,
    data: Partial<z.infer<typeof TextPostSchema>>
  ): Promise<TextPost | null> {
    await dbConnect()
    return TextPostModel.findOneAndUpdate(
      { _id: postId, authorId: userId },
      data,
      { new: true, runValidators: true }
    )
  }

  /**
   * Update doc post (owner only)
   */
  async updateDocPost(
    postId: PostId,
    userId: string,
    data: Partial<z.infer<typeof DocPostSchema>>
  ): Promise<DocPost | null> {
    await dbConnect()
    return DocPostModel.findOneAndUpdate(
      { _id: postId, authorId: userId },
      data,
      { new: true, runValidators: true }
    )
  }

  /**
   * Delete post (owner only)
   */
  async deletePost(postId: PostId, userId: string): Promise<boolean> {
    await dbConnect()
    
    const deletedText = await TextPostModel.findOneAndDelete({ 
      _id: postId, 
      authorId: userId 
    })
    
    if (deletedText) return true
    
    const deletedDoc = await DocPostModel.findOneAndDelete({ 
      _id: postId, 
      authorId: userId 
    })
    
    return !!deletedDoc
  }

  async fetchFeedForUser(
    userId: string,
    communities: string[],
    options: { limit?: number; page?: number } = {}
  ): Promise<(TextPost | DocPost)[]> {
    await dbConnect()
    const { limit = 20, page = 1 } = options

    if (!communities.length) return []

    const [textPosts, docPosts] = await Promise.all([
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
    ])

    return [...textPosts, ...docPosts] as (TextPost | DocPost)[]
  }

   async fetchPostsByCommunity(
    community: string,
    options: {
      type?: "question" | "answer" | "notes" | "question-paper"
      limit?: number
      page?: number
    } = {}
  ): Promise<(TextPost | DocPost)[]> {
    await dbConnect()
    const { type, limit = 20, page = 1 } = options

    const [textPosts, docPosts] = await Promise.all([
      TextPostModel.find({
        community,
        ...(type === "question" || type === "answer" ? { type } : {}),
      })
        .populate("authorId", "username email")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit),

      type === "question-paper" || type === "notes"
        ? DocPostModel.find({
            community,
            ...(type && { type }),
          })
            .populate("authorId", "username email")
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
        : Promise.resolve([]),
    ])

    return [...textPosts, ...docPosts] as (TextPost | DocPost)[]
  }
  
  async countByAuthor(userId: string) {
    const [textPostCount, docPostCount] = await Promise.all([
      TextPostModel.countDocuments({ author: userId }),
      DocPostModel.countDocuments({ author: userId }),
    ])

    return textPostCount + docPostCount
  }


}

export default new PostService();
