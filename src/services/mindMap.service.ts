// services/MindMapService.ts
import MindMapModel from "@/models/MindMap.model";
import { MindMapDoc } from "@/models/MindMap.model";
import { Node, Link } from "@/app/types/mindmap";
import { nanoid } from "nanoid";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";

interface UpdateMindMapData {
  authorId: string;
  title: string;
  summary: string;
  subject: string;
  nodes: Node[];
  links: Link[];
}

class MindMapService {

  async createMindMap(data: {
    authorId: string;
    title: string;
    summary: string;
    subject : string;
    nodes: Array<Node>;
    links: Array<Link>;
    communityId: string | null
  }) {

    dbConnect();

    const createData : any = {
    authorId: data.authorId,
    title: data.title,
    subject: data.subject,
    summary: data.summary,
    nodes: data.nodes,
    links: data.links,
  };

  if (data.communityId && data.communityId !== "null") {
    createData.community = data.communityId;
  }
  
  

  await MindMapModel.create(createData);
  }

  // ✅ UPDATE MindMap metadata

async updateMindMap(
  postId: string, 
  data: UpdateMindMapData
): Promise<any> {
  try {
    // ✅ Validate input
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new Error('Invalid postId format');
    }
    if (!data.title.trim() || !data.subject.trim()) {
      throw new Error('Title and subject are required');
    }
    if (!data.authorId || !mongoose.Types.ObjectId.isValid(data.authorId)) {
      throw new Error('Invalid authorId');
    }

    await dbConnect();

    // ✅ Check authorization & existence first
    const existingMindMap = await MindMapModel.findOne({ 
      _id: postId, 
      authorId: data.authorId 
    });
    if (!existingMindMap) {
      throw new Error('MindMap not found or unauthorized');
    }

    // ✅ Update with validation
    const mindmap = await MindMapModel.findByIdAndUpdate(
      postId,
      {
        $set: {
          authorId: data.authorId,
          title: data.title.trim(),
          subject: data.subject.trim(),
          summary: data.summary.trim(),
          nodes: data.nodes,
          links: data.links,
          updatedAt: new Date(),
        },
      },
      { 
        new: true,
        runValidators: true,  // ✅ Enforce schema validation
      }
    )!.lean();

    return mindmap;
  } catch (error) {
    console.error('updateMindMap error:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to update mindmap');
  }
}

async fetchMindMapById(
  postId: string
) {
  await dbConnect();


  const mindmap = await MindMapModel.findById(postId)
    .lean();
      
  return {
    nodes : mindmap.nodes,
    links : mindmap.links,
    title: mindmap.title,
    summary: mindmap.summary,
    subject: mindmap.subject,
    postId: mindmap._id.toString(),
    authorId: mindmap.authorId.toString(),
  }
}

  async deleteMindMap(mindMapId: string) {
    await MindMapModel.findByIdAndDelete(mindMapId);
  }

}

export default new MindMapService();
