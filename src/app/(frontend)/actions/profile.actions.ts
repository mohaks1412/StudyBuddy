// app/actions/profile.ts
'use server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import authService from "@/services/auth.service";
import { friendService } from "@/services/friend.service";
import { revalidatePath } from "next/cache";
import { log } from "util";

export async function updateProfile(formData: FormData) {

  const profileUserId = formData.get("profileId") as string;
  
  const currentSession = await getServerSession(authOptions);
  if (!currentSession?.user?._id || currentSession.user._id !== profileUserId) {
    return; // Silent fail for non-owners
  }
  
  const college = (formData.get("college") as string) || null;
  const major = (formData.get("major") as string) || null;
  const bio = (formData.get("bio") as string) || null;
  
  
  await authService.updateUser(profileUserId, { college, major, bio });

  revalidatePath(`/dashboard/${profileUserId}`);
}

export async function sendFriendRequest(profileUserId: string) {
  const currentSession = await getServerSession(authOptions);
  if (!currentSession?.user?._id || currentSession.user._id === profileUserId) {
    return; // Silent fail
  }
  
  await friendService.sendRequest(currentSession.user._id, profileUserId);
  revalidatePath(`/dashboard/${profileUserId}`);
}
