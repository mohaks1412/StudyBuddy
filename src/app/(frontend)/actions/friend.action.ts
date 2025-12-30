'use server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { friendService } from "@/services/friend.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function removeFriend(formData: FormData) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?._id;
  const friendId = formData.get("friendId") as string;
  const profileUserId = formData.get("profileUserId") as string;
  
  if (!currentUserId || !profileUserId || currentUserId !== profileUserId) {
    return; // Silent fail
  }
  
  await friendService.removeFriend(currentUserId, friendId);
  revalidatePath(`/dashboard/${profileUserId}/friends`);
}

export async function startChat(formData: FormData) {
  const session = await getServerSession(authOptions);
  const friendId = formData.get("friendId") as string;
  const profileUserId = formData.get("profileUserId") as string;
  
  if (!session?.user?._id || session.user._id !== profileUserId) {
    return; // Silent fail
  }
  
  redirect(`/chat/${friendId}`);
}

export async function acceptRequest(formData: FormData) {
    
  const session = await getServerSession(authOptions);
  const requestId = formData.get("requestId") as string;
  const profileUserId = formData.get("profileUserId") as string;
  
  if (!session?.user?._id || session.user._id !== profileUserId) {
    return; // Silent fail
  }
  
  await friendService.respondRequest(requestId, true);
  revalidatePath(`/dashboard/${profileUserId}/friends`);
}

export async function declineRequest(formData: FormData) {
  const session = await getServerSession(authOptions);
  const requestId = formData.get("requestId") as string;
  const profileUserId = formData.get("profileUserId") as string;
  
  if (!session?.user?._id || session.user._id !== profileUserId) {
    return; // Silent fail
  }
  
  await friendService.respondRequest(requestId, false);
  revalidatePath(`/dashboard/${profileUserId}/friends`);
}
