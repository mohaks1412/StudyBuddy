"use server";
import { revalidatePath } from "next/cache";
import PostService from "@/services/post.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export async function createAnswerAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) redirect("/auth/login");

  console.log(formData);
  

  const questionId = formData.get("questionId") as string;
  const content = formData.get("content") as string;

  // call a PostService method like createAnswer that:
  // - creates a TextPost with type="answer"
  // - links it to the question via associate arrays
  await PostService.createAnswer(session.user._id, {
    questionId,
    content,
  });

  console.log(questionId);
  
  revalidatePath(`/posts/${questionId}`);
}
