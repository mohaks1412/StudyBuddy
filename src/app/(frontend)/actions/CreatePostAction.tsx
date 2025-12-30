"use server";

import { TextPostSchema, DocPostSchema } from "@/schemas/post.schema";
import PostService from "@/services/post.service";
import { getServerSession } from "next-auth";
import type { TextPostCreateData, DocPostCreateData } from "@/app/types/post";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function createPost(
  data: TextPostCreateData | DocPostCreateData
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) {
    throw new Error("Unauthorized");
  }

  const authorId = session.user._id;

  if (data.type === "question" || data.type === "answer") {
    const validated = TextPostSchema.parse(data);
    const mongooseDoc = await PostService.createTextPost(authorId, validated);
    
    // ✅ Convert to plain JSON
    return JSON.parse(JSON.stringify(mongooseDoc));
  }

  if (data.type === "notes" || data.type === "question-paper") {
    const validated = DocPostSchema.parse(data);
    const mongooseDoc = await PostService.createDocPost(authorId, validated);
    
    // ✅ Convert to plain JSON
    return JSON.parse(JSON.stringify(mongooseDoc));
  }

  throw new Error("Invalid post type");
}
