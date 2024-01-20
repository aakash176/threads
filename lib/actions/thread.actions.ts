'use server'
import { revalidatePath } from "next/cache"
import Thread from "../models/thread.model"
import User from "../models/user.model"
import { connectToDB } from "../mongoose"

interface Params{
    text: string,
    author:string,
    communityId:string | null,
    path:string
}
export async function createThread({text, author, communityId, path}:Params){
    try {
        
        connectToDB()
        const createdThread = await Thread.create({
            text,
            author,
            community:null,
    
        })
    
        await User.findByIdAndUpdate(author, {
            $push: {threads: createdThread._id}
        })
        revalidatePath(path)
    } catch (error) {
        throw new Error(`Error while creating thread, ${error}`)
    }
}

export async function fetchPosts(pageNumber=1, pageSize=20){
    connectToDB()

    const skipAmount = (pageNumber-1) * pageSize
    const postsQuery = Thread.find({parentId:{$in:[null, undefined]}})
     .sort({createdAt: 'desc'})
     .skip(skipAmount)
     .limit(pageSize)
     .populate({
        path:"author",
        model:User
     })
     .populate({
        path:"children",
        populate:{
            path:'author',
            model:User,
            select: "_id name parentId image"
        }
     })

    
     const totalPostCount = await Thread.countDocuments({parentId:{$in:[null, undefined]}})
     const posts = await postsQuery.exec()
     const next = totalPostCount > skipAmount + posts.length

     return {posts, next}
}

export async function fetchThreadById(id:string) {
    try {
        connectToDB()

        const thread = await Thread.findById(id)
         .populate({
            path:'author',
            model:User,
            select: '_id id name image'
         })
         .populate({
            path:'children',
            populate:[
                {
                    path:'author',
                    model:User,
                    select:'_id id name parentId image'
                },
                {
                    path:'children',
                    model: Thread,
                    populate:{
                        path:'author',
                        model:User,
                        select:'_id id name parentId image'
                    }
                }
            ]
         }).exec()

         return thread

    } catch (error) {
        throw new Error("Error while fetching thread by Id")
    }
}

export async function addCommentToThread(threadId:string, userId:string, commentText:string, path:string) {
    try {
        connectToDB()
        const originalThread = await Thread.findById(threadId)

        if(!originalThread) throw new Error("Thread not found!!")

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