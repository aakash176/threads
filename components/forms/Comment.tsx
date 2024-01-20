'use client'
import { Input } from "../ui/input";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form";
  import * as z from 'zod';
import {useForm} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CommentValidation } from '@/lib/validations/threads';
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { addCommentToThread, createThread } from "@/lib/actions/thread.actions";
import Image from "next/image";
interface Props {
    threadId:string,
    currentUserImg:string,
    currentUserId:string
}
const Comment = ({threadId, currentUserImg, currentUserId}:Props) => {
    const router = useRouter()
    const pathname = usePathname()
   
  
    const onSubmit = async(values: z.infer<typeof CommentValidation>) => {
        await addCommentToThread(threadId,JSON.parse(currentUserId), values.thread, pathname)
        form.reset()
        
    }
  
    const form = useForm({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            thread: '',
            accountId: currentUserId
        }
    })
    return (
        <Form {...form}>
          <form
          onSubmit={form.handleSubmit(onSubmit)}
            className='comment-form'
            
          >
             <FormField
              control={form.control}
              name='thread'
              render={({ field }) => (
                <FormItem className='flex w-full item-center gap-3'>
                  <FormLabel>
                    <Image src={currentUserImg} alt="profile pic" width={48} height={48} className="rounded-full object-cover" />
                  </FormLabel>
                  <FormControl className="border-none bg-transparent ">
                    <Input
                     type="text"
                     placeholder="Comment..."
                     className="no-focus text-light-1 outline-none"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type='submit' className='comment-form_btn'>
              Reply
            </Button>
            </form>
        </Form>
    )
}

export default Comment