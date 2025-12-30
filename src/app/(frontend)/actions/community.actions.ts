'use server';

import { getServerSession } from 'next-auth';
import CommunityService from '@/services/community.service';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function createCommunityAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const slugRaw = formData.get('slug') as string;
  const description = formData.get('description') as string;

  // Auto-generate slug if empty
  const slug = slugRaw || name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const community = await CommunityService.createCommunity(session.user._id, {
    name,
    slug,
    description: description || undefined
  });

  revalidatePath('/community');
  revalidatePath('/community/my');
  revalidatePath(`/dashboard/${session.user._id}`);
  
  redirect(`/community/${community._id}`);
}


export async function leaveCommunityAction(communityId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) {
    return { ok: false, error: "Unauthorized" };
  }

  try {

    console.log("trying to leave");
    
    await CommunityService.leaveCommunity(session.user._id, communityId);
    console.log("left the community");
    
    revalidatePath(`/communities/${communityId}`);
    revalidatePath("/communities/my");

    // after leaving, send them to My Communities
    redirect("/communities/my");
  } catch (err: any) {
    // optional: handle “last admin” error
    return {
      ok: false,
      error:
        err?.message ||
        "Could not leave community. Please try again in a moment.",
    };
  }
}



export async function joinCommunityAction(communityId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    await CommunityService.joinCommunity(session.user._id, communityId);
    revalidatePath(`/communities/${communityId}`);
    revalidatePath("/communities/my");
    console.log("Joined");
    
    return { ok: true };
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || "Could not join community.",
    };
  }
}

export async function promoteToAdminAction(
  communityId: string,
  targetUserId: string
) {

  
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    await CommunityService.promoteToAdmin(
      session.user._id,
      targetUserId,
      communityId
    );
    revalidatePath(`/communities/${communityId}`);
    return { ok: true };
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || "Could not promote this member to admin.",
    };
  }
}
