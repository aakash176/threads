
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { deleteThread } from "@/lib/actions/thread.actions"
import Pop from "../shared/Pop"


interface Props{
  threadId:string,
  author:{
    name:string,
    id:string,
    image:string
  },

}
export function PopoverDemo({threadId, author}:Props) {



  
  return (
    <Popover>
      <PopoverTrigger asChild className="">
        <Button variant="outline" className="w-[80px] text-small-regular h-[23px]">Delete Post</Button>
      </PopoverTrigger>
      <Pop threadId={threadId} authorId={author.id} />
    </Popover>
  )
}
