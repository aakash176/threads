'use client'
import React from 'react'
import { PopoverContent } from '../ui/popover'
import { deleteThread } from '@/lib/actions/thread.actions'
import { usePathname } from 'next/navigation'
interface Props{
    threadId:string,
    authorId:string
  
  }
const Pop = ({threadId, authorId}:Props) => {
    const pathname = usePathname()
    const handleDelete = async() =>{
        await deleteThread(threadId, authorId, pathname)
    }
  return (
    <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Delete post?</h4>
            <p className="text-sm text-muted-foreground">
              This can't be undone and post will be removed from your profile.
            </p>
          </div>
          
          <div className="flex gap-5">
            <button onClick={handleDelete} className="bg-black text-white p-1 rounded-3xl">delete</button>
          </div>
        </div>
      </PopoverContent>
  )
}

export default Pop