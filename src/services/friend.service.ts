import dbConnect from "@/lib/dbConnect"
import User from "@/models/user.model"
import FriendRequest from "@/models/FriendRequest.model"
import { Types } from "mongoose"

class FriendService {
  async sendRequest(fromId: string, toId: string) {
    await dbConnect()
    if (fromId === toId) throw new Error("Cannot add yourself")

    const from = new Types.ObjectId(fromId)
    const to = new Types.ObjectId(toId)

    const existing = await FriendRequest.findOne({ from, to })
    if (existing && existing.status === "pending")
      throw new Error("Request already sent")

    const fromUser = await User.findById(from)
    if (fromUser?.friends?.some((f: any) => f.equals(to)))
      throw new Error("Already friends")

    await FriendRequest.findOneAndUpdate(
      { from, to },
      { $set: { status: "pending" } },
      { upsert: true, new: true }
    )
  }

  async respondRequest(requestId: string, accept: boolean) {
  await dbConnect()

  const req = await FriendRequest.findById(requestId)
    if (!req || req.status !== "pending") throw new Error("Invalid request")

    if (accept) {

      
      await User.findByIdAndUpdate(req.from, {
        $addToSet: { friends: req.to },
      })
      await User.findByIdAndUpdate(req.to, {
        $addToSet: { friends: req.from },
      })
    }
      await FriendRequest.findByIdAndDelete(requestId)
  }



async getIncoming(userId: string) {
  await dbConnect();
  const requests = await FriendRequest.find({ to: userId, status: "pending" })
    .populate("from", "name username avatar _id") 
    .lean();

    
  return requests.map((req: any) => ({
    _id: req._id.toString(),
    from: {
      _id: req.from._id.toString(),
      name: req.from.name,
      username: req.from.username,
      avatar: req.from.avatar
    }
  }));
}

async getOutgoing(userId: string) {
  await dbConnect();
  const requests = await FriendRequest.find({ from: userId, status: "pending" })
    .populate("to", "name username avatar _id")
    .lean();

  return requests.map((req: any) => ({
    _id: req._id.toString(),
    to: {
      _id: req.to._id.toString(),
      name: req.to.name,
      username: req.to.username,
      avatar: req.to.avatar
    }
  }));
}

async getFriends(userId: string) {
  await dbConnect();
  const user = await User.findById(userId)
    .populate("friends", "name username avatar _id")
    .lean();

  return (user?.friends || []).map((friend: any) => ({
    _id: friend._id.toString(),
    name: friend.name,
    username: friend.username,
    avatar: friend.avatar
  }));
}


  async getStatus(myId: string, otherId: string): Promise<string> {
    await dbConnect()

    
    const pending = await FriendRequest.findOne({
      from: myId,
      to: otherId,
    })
      .select("_id")
      .lean()

    if (pending) return "pending"

    
    const me = await User.findById(myId).select("friends").lean()
    const isFriend =
      me?.friends &&
      (me.friends as any[]).some((f) => f.toString() === otherId)

    if (isFriend) return "accepted"

    
    return "rejected"
  }

    async removeFriend(myId: string, friendId: string) {
    await dbConnect()
    
    await User.findByIdAndUpdate(myId, {
      $pull: { friends: friendId },
    })

    
    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: myId },
    })
  }

  
  async countFriends(userId: string) {
    const user = await User.findById(userId).select("friends").lean()
    return user?.friends?.length ?? 0
  }


}

export const friendService = new FriendService()
