// app/(frontend)/posts/[_id]/MindMap.tsx (Server)
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import MindMapClient from './MindMapClient';
import mindMapService from '@/services/mindMap.service';
import postService from '@/services/post.service';
import { Node, Link } from '@/app/types/mindmap';

interface Props {
  postId: string;
}

export default async function MindMap({ postId }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/sign-in');

  let mindmapData = {
      nodes: [{
        id: `root_${Date.now()}`,
        label: "This is the root node",
        summary: "",
        description: "",
        children: [],
        level: 0,
      }],
      summary: "",
      subject: "",
      title: "New Mind Map",
      postId: "new",
      authorId: session.user._id,
      links: []
    };

  if(postId !== "new"){

    mindmapData = await mindMapService.fetchMindMapById(postId);


  }
  const isAuthor = session.user._id === mindmapData.authorId

  return (
    <MindMapClient 
      rawData={mindmapData}
      sessionUserId={session.user._id}
      isAuthor={isAuthor}
    />
  );
}
