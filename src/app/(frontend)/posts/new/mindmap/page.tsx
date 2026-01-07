// app/(frontend)/posts/new/mindmap/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import MindMap from '@/app/(frontend)/components/mindmap/MindMap';
import { createPost } from '@/app/(frontend)/actions/CreatePostAction';

export default async function NewMindmapPage() {

  
  const session = await getServerSession(authOptions);
  if (!session) redirect('/sign-in');


  return (
    <div className="min-h-screen p-8">
      <MindMap postId="new" />

      
    </div>
  );
}
