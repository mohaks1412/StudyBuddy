// services/friend.service.ts
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

    // also avoid if already friends
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

      // make them mutual friends
      await User.findByIdAndUpdate(req.from, {
        $addToSet: { friends: req.to },
      })
      await User.findByIdAndUpdate(req.to, {
        $addToSet: { friends: req.from },
      })
    }
      // reject: remove the request document entirely
      await FriendRequest.findByIdAndDelete(requestId)
  }


  async getIncoming(userId: string) {
    await dbConnect()
    return FriendRequest.find({ to: userId, status: "pending" })
      .populate("from", "name username")
      .lean()
  }

  async getOutgoing(userId: string) {
    await dbConnect()
    return FriendRequest.find({ from: userId, status: "pending" })
      .populate("to", "name username")
      .lean()
  }

  async getFriends(userId: string) {
    await dbConnect()
    const user = await User.findById(userId)
      .populate({ path: "friends", strictPopulate: false })
      .lean()
    return user?.friends ?? []
  }

  async getStatus(myId: string, otherId: string): Promise<string> {
    await dbConnect()

    // 1) Pending? (only state stored in FriendRequest now)
    const pending = await FriendRequest.findOne({
      from: myId,
      to: otherId,
    })
      .select("_id")
      .lean()

    if (pending) return "pending"

    // 2) Accepted? (encoded in friends list)
    const me = await User.findById(myId).select("friends").lean()
    const isFriend =
      me?.friends &&
      (me.friends as any[]).some((f) => f.toString() === otherId)

    if (isFriend) return "accepted"

    // 3) Otherwise treated as rejected / no relation
    return "rejected"
  }

    async removeFriend(myId: string, friendId: string) {
    await dbConnect()

    // remove friendId from my friends
    await User.findByIdAndUpdate(myId, {
      $pull: { friends: friendId },
    })

    // remove myId from friend's friends
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
