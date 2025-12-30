// app/actions/deletePost.ts
"use server";

import PostService from "@/services/post.service";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function deletePostAction(postId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await PostService.deletePost(postId, session.user._id);

  redirect("/posts"); // or wherever
}
