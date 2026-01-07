'use server';

import MindMapService from '@/services/mindMap.service';
import { Link, Node } from '@/app/types/mindmap';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

interface CreateMindMapInput {
  postId: string;
  title: string;
  summary: string;
  subject: string;
  nodes: Node[],
  links: Link[],
  communityId: string | null
}

interface UpdateMindMapInput {
  postId: string;
  title: string;
  summary: string;
  subject: string;
  nodes: Node[],
  links: Link[],
}

export async function createMindMapAction(input: CreateMindMapInput) {
  try {
    
    const session = await getServerSession(authOptions);

    if(!session){
        redirect("/posts");
    }

    console.log(input);
    

    if ( !input.title) {
      throw new Error('Missing required fields');
    }

    const mindmap = await MindMapService.createMindMap({
      authorId: session.user._id,
      title: input.title,
      summary: input.summary,
      subject: input.subject,
      nodes : input.nodes,
      links : input.links,
      communityId: input.communityId
    });


    return {
      success: true,
      mindmap,
    };
  } catch (error) {
    console.error('[CREATE_MINDMAP]', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}


export  async function updateMindMapAction(postId: string, input: UpdateMindMapInput){
    try {
    
    const session = await getServerSession(authOptions);

    if(!session){
        redirect("/posts");
    }

    console.log(input);


    const mindmap = await MindMapService.updateMindMap(postId, {
      authorId: session.user._id,
      title: input.title,
      summary: input.summary,
      subject: input.subject,
      nodes : input.nodes,
      links : input.links
    });

    revalidatePath(`/posts/${postId}`)
    return {
      success: true,
    };
  } catch (error) {
    console.error('[CREATE_MINDMAP]', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}