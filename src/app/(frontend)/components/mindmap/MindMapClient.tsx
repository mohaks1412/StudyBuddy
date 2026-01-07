// app/(frontend)/posts/[_id]/MindMapClient.tsx
'use client';
import { Link, Node } from '@/app/types/mindmap';
import { MindMapProvider } from '../../providers/MindMapProvider';  
import { UIProvider } from '../../providers/UiProvider';
import ActionBar from './ActionBar';
import Canvas from './Canvas';
import Sidebar from './SideBar';
import { useSearchParams } from 'next/navigation';
interface Props {
  rawData: {
    nodes: Node[];
    links?: Link[]; 
    title: string;
    summary: string;
    subject: string;
    postId: string;
    authorId: string;
  };
  sessionUserId: string;
  isAuthor: boolean;
}

export default function MindMapClient({ rawData, sessionUserId, isAuthor }: Props) {
  
  
  const searchParams = useSearchParams();
  const communityId = searchParams.get("communityId");
  
  const initialData = {
    nodes: rawData.nodes,
    links: rawData.links || [], 
    title: rawData.title,
    postId: rawData.postId,
    authorId: rawData.authorId,
    isAuthor
  };
  
  return (
    <MindMapProvider initialData={initialData}>
      <div className="h-screen grid grid-rows-[auto_1fr]">
        <UIProvider>
        <ActionBar 
        isAuthor={isAuthor}
        summary={rawData.summary}
        subject={rawData.subject}
        title={rawData.title}/>
        <div className="grid grid-cols-[1fr_auto] overflow-hidden">
            
          <Canvas />
          <Sidebar isAuthor={isAuthor} />
        </div>

        </UIProvider>
      </div>
    </MindMapProvider>
  );
}
