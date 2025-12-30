// app/posts/[id]/actions.ts
"use server";
import { uploadFile } from "../posts/uploader";
import PostService from "@/services/post.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Post, TextPost, DocPost } from "@/app/types/post"; // your existing file


export async function getPostAction(id: string) {
  const post = await PostService.fetchPostById(id);
  return JSON.parse(JSON.stringify(post)); // plain JSON
}

export async function updatePostAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) redirect("/posts");

  const _id = formData.get("_id") as string;
  const title = (formData.get("title") as string) ?? "";
  const subject = (formData.get("subject") as string) || undefined;
  const content = (formData.get("content") as string) ?? "";
  const summary = (formData.get("summary") as string) ?? "";
  const fileUrl = formData.get("fileUrl") as string | undefined;

  const post = (await PostService.fetchPostById(_id)) as Post | null;
  if (!post || session.user._id !== post.authorId?._id.toString()) {
    redirect("/posts");
  }

  // Text posts: question / answer
  if (post.type === "question" || post.type === "answer") {
    const textPost = post as TextPost;

    await PostService.updatePost(_id, session.user._id,  {
      title,
      subject,
      content,                // only TextPost has content
      summary,
      fileurl: undefined
    });

    revalidatePath(`/posts/${_id}`);
    redirect(`/posts/${_id}`);
  }

  // Doc posts: notes / question-paper
  if (post.type === "notes" || post.type === "question-paper") {
    const docPost = post as DocPost;

    let fileurl = fileUrl? fileUrl : docPost.fileUrl;

    console.log("final File URL : ", fileUrl);
    

    await PostService.updatePost(_id, session.user._id,  {
      title,
      subject,
      content,                // only TextPost has content
      summary,
      fileurl
    });

    revalidatePath(`/posts/${_id}`);
    redirect(`/posts/${_id}`);
  }

  // Fallback
  redirect(`/posts/${_id}`);
}
