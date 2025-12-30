import dbConnect from "@/lib/dbConnect";
import Community, { ICommunity } from "@/models/Community.model";
import User, { IUser } from "@/models/user.model";
import { Types } from "mongoose";
import TextPostModel from "@/models/TextPost.model";
import DocPostModel from "@/models/DocPost.model";

export interface CommunityWithCount {
  _id: string;
  name: string;
  slug: string;
    admins: Array<{
    _id: string | import('mongoose').Types.ObjectId;
    username?: string;
    email?: string;
    avatar?: string;
  }>;
  description?: string;
  memberCount: number;
}

class CommunityService {
  
 async createCommunity(
    creatorId: string,
    data: {
      name: string;
      slug: string;
      description?: string;
    }
  ): Promise<ICommunity> {
    await dbConnect();

    const session = await Community.startSession();
    session.startTransaction();

    try {
      const creatorObjectId = new Types.ObjectId(creatorId);

      const existing = await Community.findOne({ slug: data.slug }).session(session);
      if (existing) {
        throw new Error("Community with this slug already exists");
      }

      const community = Community.buildCommunity({
        name: data.name,
        slug: data.slug,
        description: data.description,
        admins: [creatorObjectId],
      });

      await community.save({ session });

      await User.findByIdAndUpdate(
        creatorObjectId,
        { $addToSet: { community: community._id } },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return community;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  
  async deleteCommunity(
    communityId: string,
    requesterId: string
  ): Promise<boolean> {
    await dbConnect();

    const communityObjectId = new Types.ObjectId(communityId);
    const requesterObjectId = new Types.ObjectId(requesterId);

    const community = await Community.findById(communityObjectId);
    if (!community) throw new Error("Community not found");

    const isAdmin = community.admins.some(
      (adminId) => adminId.toString() === requesterObjectId.toString()
    );

    if (!isAdmin) {
      throw new Error("Not authorized to delete this community");
    }

    
    await User.updateMany(
      { communities: communityObjectId },
      { $pull: { communities: communityObjectId } }
    );

    await Community.findByIdAndDelete(communityObjectId);

    return true;
  }

  
  async joinCommunity(
    userId: string,
    communityId: string
  ): Promise<void> {
    await dbConnect();

    const userObjectId = new Types.ObjectId(userId);
    const communityObjectId = new Types.ObjectId(communityId);

    const community = await Community.findById(communityObjectId);
    if (!community) throw new Error("Community not found");
    
    await User.findByIdAndUpdate(
      userObjectId,
      { $addToSet: { community: communityObjectId } },
      { new: true }
    );
  }

  
  async promoteToAdmin(
    requesterId: string,
    targetUserId: string,
    communityId: string
  ): Promise<ICommunity> {
    await dbConnect();
    

    const requesterObjectId = new Types.ObjectId(requesterId);
    const targetObjectId = new Types.ObjectId(targetUserId);
    const communityObjectId = new Types.ObjectId(communityId);

    const community = await Community.findById(communityObjectId);
    if (!community) throw new Error("Community not found");

    const isRequesterAdmin = community.admins.some(
      (id) => id.toString() === requesterObjectId.toString()
    );
    

    if (!isRequesterAdmin) {
      throw new Error("Only admins can promote users");
    }

    
    const targetUser = await User.findOne({
      _id: targetObjectId,
      community: communityObjectId,
    });

    if (!targetUser) {
      throw new Error("User is not a member of this community");
    }

    await Community.findByIdAndUpdate(
    communityObjectId,
    { $addToSet: { admins: targetObjectId } },
    { new: true }
    );

    return community;
  }

  
  async leaveCommunity(userId: string, communityId: string): Promise<void> {
    await dbConnect();

    const userObjectId = new Types.ObjectId(userId);
    const communityObjectId = new Types.ObjectId(communityId);

    const community = await Community.findById(communityObjectId);
    if (!community) throw new Error("Community not found");


    const isAdmin = community.admins.some(
      (id) => id.toString() === userObjectId.toString()
    );
    
    if (isAdmin && community.admins.length === 1) {
      
      const error: any = new Error(
      "You are the only admin. Assign another admin before leaving this community."
      );
      error.code = "LAST_ADMIN";
      throw error;
    }

    if (isAdmin) {
      await Community.findByIdAndUpdate(communityObjectId, {
        $pull: { admins: userObjectId }
      });
    }

    await User.findByIdAndUpdate(userObjectId, {
      $pull: { community: communityObjectId },
    });


    const memberCount = await User.countDocuments({
      community: communityObjectId,
    });

    if (memberCount === 0) {
      
      await Promise.all([
        TextPostModel.deleteMany({ community: communityObjectId }),
        DocPostModel.deleteMany({ community: communityObjectId }),
      ]);

      await Community.findByIdAndDelete(communityObjectId);
    }
  }


  
async getUserCommunities(userId: string): Promise<CommunityWithCount[]> {
  await dbConnect();

  const userObjectId = new Types.ObjectId(userId);

  const user = await User.findById(userObjectId)
    .select("community")
    .lean();

  console.log("user.community =", user?.community);

  if (!user?.community || user.community.length === 0) {
    return [];
  }

  const communityIds = user.community.map((id: Types.ObjectId | string) =>
    new Types.ObjectId(id as any)
  );

  return Community.aggregate([
    
    { $match: { _id: { $in: communityIds } } },

    {
      $lookup: {
        from: "users",
        let: { communityId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: [
                  "$$communityId",
                  { $ifNull: ["$community", []] } 
                ]
              }
            }
          },
          { $count: "totalMembers" }
        ],
        as: "memberInfo"
      }
    },

    {
      $addFields: {
        memberCount: {
          $ifNull: [{ $arrayElemAt: ["$memberInfo.totalMembers", 0] }, 0]
        }
      }
    },

    {
      $lookup: {
        from: "users",
        localField: "admins",
        foreignField: "_id",
        as: "admins",
        pipeline: [{ $project: { username: 1, email: 1, avatar: 1 } }]
      }
    },

    {
      $project: {
        name: 1,
        slug: 1,
        description: 1,
        admins: 1,
        createdAt: 1,
        memberCount: 1
      }
    },

    { $sort: { createdAt: -1 } }
  ]) as Promise<CommunityWithCount[]>;
}


  async findCommunityById(communityId: string): Promise<CommunityWithCount | null> {
  await dbConnect();

  const result = await Community.aggregate([
    {
      $match: { _id: new Types.ObjectId(communityId) }
    },
    {
      $lookup: {
        from: "users",
        let: { communityId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: [
                  "$$communityId",
                  { $ifNull: ["$community", []] }  // uses *community* as array
                ]
              }
            }
          },
          { $count: "totalMembers" }
        ],
        as: "memberInfo"
      }
    },
    {
      $addFields: {
        memberCount: {
          $ifNull: [{ $arrayElemAt: ["$memberInfo.totalMembers", 0] }, 0]
        }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "admins",
        foreignField: "_id",
        as: "admins",
        pipeline: [
          { $project: { username: 1, email: 1, avatar: 1 } }
        ]
      }
    },
    {
      $project: {
        name: 1,
        slug: 1,
        description: 1,
        admins: 1,
        createdAt: 1,
        memberCount: 1
      }
    }
  ]);

  return result[0] ?? null;
}

async isUserInCommunity(userId: string, communityId: string): Promise<boolean> {
  await dbConnect();

  const user = await User.findOne({
    _id: userId,
    community: new Types.ObjectId(communityId),
  })
    .select("_id")
    .lean();

  return !!user;
}

async isUserAdmin(userId: string, communityId: string): Promise<boolean> {
  await dbConnect();
  const community = await Community.findById(communityId)
    .select("admins")
    .lean();
  if (!community) return false;
  return community.admins.some(
    (id: any) => id.toString() === userId.toString()
  );
}

async getCommunityMembers(communityId: string) {
  await dbConnect();
  return User.find({ community: communityId })
    .select("username email avatar")
    .lean();
}
async getPopularCommunities(limit: number = 12): Promise<CommunityWithCount[]> {
  await dbConnect();

  return Community.aggregate([
    {
      $lookup: {
        from: "users",
        let: { communityId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$$communityId", { $ifNull: ["$community", []] }]
              }
            }
          },
          { $count: "totalMembers" }
        ],
        as: "memberInfo"
      }
    },
    {
      $addFields: {
        memberCount: {
          $ifNull: [{ $arrayElemAt: ["$memberInfo.totalMembers", 0] }, 0]
        }
      }
    },

    {
      $lookup: {
        from: "textposts",
        localField: "_id",
        foreignField: "community",
        as: "textPosts",
        pipeline: [{ $count: "count" }]
      }
    },

    {
      $lookup: {
        from: "docposts",
        localField: "_id",
        foreignField: "community",
        as: "docPosts",
        pipeline: [{ $count: "count" }]
      }
    },

    {
      $addFields: {
        postCount: {
          $sum: [
            { $ifNull: [{ $arrayElemAt: ["$textPosts.count", 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ["$docPosts.count", 0] }, 0] }
          ]
        }
      }
    },

    {
      $lookup: {
        from: "users",
        localField: "admins",
        foreignField: "_id",
        as: "admins",
        pipeline: [
          { 
            $project: { 
              username: 1, 
              email: 1, 
              avatar: 1 
            } 
          }
        ]
      }
    },

    {
      $project: {
        name: 1,
        slug: 1,
        description: 1,
        admins: 1,
        memberCount: 1,
        postCount: 1,
        createdAt: 1
      }
    },

    {
      $sort: {
        memberCount: -1,
        postCount: -1,
        createdAt: -1
      }
    },

    {
      $limit: limit
    }
  ]) as Promise<CommunityWithCount[]>;
}


async getPopularCommunitiesPaginated(page: number = 1, limit: number = 12): Promise<CommunityWithCount[]> {
  await dbConnect();
  
  const skip = (page - 1) * limit;
  
  return Community.aggregate([
    {
      $lookup: {
        from: "users",
        let: { communityId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$$communityId", { $ifNull: ["$community", []] }]
              }
            }
          },
          { $count: "totalMembers" }
        ],
        as: "memberInfo"
      }
    },

    {
      $addFields: {
        memberCount: {
          $ifNull: [{ $arrayElemAt: ["$memberInfo.totalMembers", 0] }, 0]
        }
      }
    },

    {
      $lookup: {
        from: "textposts",
        localField: "_id",
        foreignField: "community",
        as: "textPosts",
        pipeline: [{ $count: "count" }]
      }
    },

    {
      $lookup: {
        from: "docposts",
        localField: "_id",
        foreignField: "community",
        as: "docPosts",
        pipeline: [{ $count: "count" }]
      }
    },

    {
      $addFields: {
        postCount: {
          $sum: [
            { $ifNull: [{ $arrayElemAt: ["$textPosts.count", 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ["$docPosts.count", 0] }, 0] }
          ]
        }
      }
    },

    {
      $lookup: {
        from: "users",
        localField: "admins",
        foreignField: "_id",
        as: "admins",
        pipeline: [
          { 
            $project: { 
              username: 1, 
              email: 1, 
              avatar: 1 
            } 
          }
        ]
      }
    },

    {
      $project: {
        name: 1,
        slug: 1,
        description: 1,
        admins: 1,
        memberCount: 1,
        postCount: 1,
        createdAt: 1
      }
    },

    {
      $sort: {
        memberCount: -1,
        postCount: -1,
        createdAt: -1
      }
    },

    { $skip: skip },
    { $limit: limit }
  ]) as Promise<CommunityWithCount[]>;
}



async searchCommunities(query: string, limit: number = 50): Promise<CommunityWithCount[]> {
  await dbConnect();
  
  if (!query.trim()) return [];

  const searchTerm = query.toLowerCase().trim();

  return Community.aggregate([
    // Text search across name, slug, description
    {
      $match: {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { slug: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    },
    
    // Same lookups as getPopularCommunities...
    {
      $lookup: {
        from: "users",
        let: { communityId: "$_id" },
        pipeline: [
          { $match: { $expr: { $in: ["$$communityId", { $ifNull: ["$community", []] }] } } },
          { $count: "totalMembers" }
        ],
        as: "memberInfo"
      }
    },
    {
      $addFields: {
        memberCount: { $ifNull: [{ $arrayElemAt: ["$memberInfo.totalMembers", 0] }, 0] }
      }
    },
    {
      $lookup: {
        from: "textposts",
        localField: "_id",
        foreignField: "community",
        as: "textPosts",
        pipeline: [{ $count: "count" }]
      }
    },
    {
      $lookup: {
        from: "docposts",
        localField: "_id",
        foreignField: "community",
        as: "docPosts",
        pipeline: [{ $count: "count" }]
      }
    },
    {
      $addFields: {
        postCount: {
          $sum: [
            { $ifNull: [{ $arrayElemAt: ["$textPosts.count", 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ["$docPosts.count", 0] }, 0] }
          ]
        }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "admins",
        foreignField: "_id",
        as: "admins",
        pipeline: [{ $project: { username: 1, email: 1, avatar: 1 } }]
      }
    },
    {
      $project: {
        name: 1, slug: 1, description: 1, admins: 1, memberCount: 1, postCount: 1, createdAt: 1
      }
    },
    { $sort: { memberCount: -1, postCount: -1, createdAt: -1 } },
    { $limit: limit }
  ]) as Promise<CommunityWithCount[]>;
}


}

export default new CommunityService();
