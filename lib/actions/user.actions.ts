'use server'

import { revalidatePath } from "next/cache"
import User from "../models/user.model"
import { connectToDB } from "../mongoose"
import Thread from "../models/thread.model"
import { FilterQuery, SortOrder } from "mongoose"

interface Props{
    userId:string, username:string, name:string, bio:string, image:string, path:string
}

export async function fetchUser(id:string){
    try {
        connectToDB()
        return await User.findOne({id})
    } catch (error) {
        throw new Error(`Error while fetching user information of user Id : ${id} , ${error}`);
        
    }
}
export async function updateUser({userId, username, name, bio, image, path }:Props):Promise<void>{
    try {
        connectToDB()
        await User.findOneAndUpdate(
            {id:userId},
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded:true
            },
            {
                upsert:true
            }
        )

        if(path === '/profile/edit'){
            revalidatePath(path)
        }
    } catch (error:any) {
        throw new Error(`failed to update the user ${error.message}`)
    }
}


export async function fetchUserPosts(userId:string) {
    try {
        connectToDB()
        const threads = await User.findOne({id: userId})
         .populate({
            path:'threads',
            model:Thread,
            populate:{
                path:'children',
                model:Thread,
                populate:{
                    path:'author',
                    model:User,
                    select:'name image id'
                }
            }
         })
         return threads
    } catch (error) {
        throw new Error("Error while fetching posts")
    }
}

export async function fetchUsers({
    userId,
    searchString='',
    pageNumber=1,
    pageSize=20,
    sortBy='desc'
}:{
    userId:string,
    searchString?:string,
    pageNumber?:number,
    pageSize?:number,
    sortBy?:SortOrder
}){
    try {
        connectToDB()
        const skipAmount = (pageNumber-1) * pageSize
        const regex = new RegExp(searchString,'i')
        const query:FilterQuery<typeof User> = {
            id: {$ne:userId}
        }

        if(searchString.trim() != ''){
            query.$or = [
                {username:{$regex:regex}}, 
                {name:{$regex:regex}}
            ]
        }

        const sortOption = {createdAt: sortBy}
        const userQuery = User.find(query)
         .sort(sortOption)
         .skip(skipAmount)
         .limit(pageSize)

         const totalUsersCount = await User.countDocuments(query)
         const users = await userQuery.exec()
         const isNext = totalUsersCount > skipAmount+users.length

         return {isNext, users}
        
    } catch (error:any) {
        throw new Error(`eror while searching for users ${error.message}`)
    }
}

export async function getActivity(userId:string){
    try {
        connectToDB()

        const userthread = await Thread.find({author:userId})

        const childThreadsid = userthread.reduce((acc,userthread) => {return acc.concat(userthread.children)},[])

        const replies = await Thread.find({
            _id:{ $in: childThreadsid},
            author:{$ne: userId}
        })
        .populate({
            path:'author',
            model:User,
            select:'name image _id'
        })

        return replies
    } catch (error:any) {
        throw new Error(`error while getting activities ${error}`)
    }
}