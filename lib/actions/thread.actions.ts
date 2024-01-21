'use server'
import { revalidatePath } from "next/cache"
import Thread from "../models/thread.model"
import User from "../models/user.model"
import { connectToDB } from "../mongoose"
import Community from "../models/community.model"

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string
}
export async function createThread({ text, author, communityId, path }: Params) {
    try {

        connectToDB()
        const communityIdObject = await Community.findOne(
            { id: communityId },
            { _id: 1 }
        );
        const createdThread = await Thread.create({
            text,
            author,
            community: communityIdObject,

        })

        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id }
        })
        if (communityIdObject) {
            // Update Community model
            await Community.findByIdAndUpdate(communityIdObject, {
                $push: { threads: createdThread._id },
            });
        }
        revalidatePath(path)
    } catch (error) {
        throw new Error(`Error while creating thread, ${error}`)
    }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
    connectToDB()

    const skipAmount = (pageNumber - 1) * pageSize
    const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
        .sort({ createdAt: 'desc' })
        .skip(skipAmount)
        .limit(pageSize)
        .populate({
            path: "author",
            model: User
        })
        .populate({
            path: "community",
            model: Community,
        })
        .populate({
            path: "children",
            populate: {
                path: 'author',
                model: User,
                select: "_id name parentId image"
            }
        })


    const totalPostCount = await Thread.countDocuments({ parentId: { $in: [null, undefined] } })
    const posts = await postsQuery.exec()
    const next = totalPostCount > skipAmount + posts.length

    return { posts, next }
}

export async function fetchThreadById(id: string) {
    try {
        connectToDB()

        const thread = await Thread.findById(id)
            .populate({
                path: 'author',
                model: User,
                select: '_id id name image'
            })
            .populate({
                path: 'children',
                populate: [
                    {
                        path: 'author',
                        model: User,
                        select: '_id id name parentId image'
                    },
                    {
                        path: 'children',
                        model: Thread,
                        populate: {
                            path: 'author',
                            model: User,
                            select: '_id id name parentId image'
                        }
                    }
                ]
            }).exec()

        return thread

    } catch (error) {
        throw new Error("Error while fetching thread by Id")
    }
}

export async function addCommentToThread(threadId: string, userId: string, commentText: string, path: string) {
    try {
        connectToDB()
        const originalThread = await Thread.findById(threadId)

        if (!originalThread) throw new Error("Thread not found!!")

        const commentThread = new Thread({
            text: commentText,
            parentId: threadId,
            author: userId
        })

        const savedCommentThread = await commentThread.save()
        originalThread.children.push(savedCommentThread._id)

        await originalThread.save()
        revalidatePath(path)
    } catch (error) {
        throw new Error("Error while adding comment")
    }
}

export async function deleteThread(threadId: string, userId: string, pathname:string) {
    try {
        connectToDB()
        const threadsToDelete = await Thread.find({ $or: [{ _id: threadId }, { parentId: threadId }] });

        const uniqueUserIds = [...new Set(threadsToDelete.flatMap(thread => thread.author))];

        await Promise.all(
            uniqueUserIds.map(async userId => {
                const user = await User.findById(userId);
                if (user) {
                    // Assuming you have a posts field in the user schema that stores post ObjectIDs
                    user.threads = user.threads.filter((userThreadId: { toString: () => any }) => !threadsToDelete.some(t => t._id.toString() === userThreadId.toString()));

                    await user.save();
                }
                console.log("users", user)
            })
        );

        await Thread.deleteMany({ $or: [{ _id: threadId }, { parentId: threadId }] });
        revalidatePath(pathname)



    } catch (error: any) {
        throw new Error(`error while deleting post ${error}`)
    }
}