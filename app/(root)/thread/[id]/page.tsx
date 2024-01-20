import ThreadCard from "@/components/cards/ThreadCard"
import Comment from "@/components/forms/Comment"
import { fetchThreadById } from "@/lib/actions/thread.actions"
import { fetchUser } from "@/lib/actions/user.actions"
import { currentUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"
const Page = async({params}:{params:{id:string}}) => {
    if(!params.id) return null
    const user  = await currentUser()
    if(!user) return null

    const userInfo = await fetchUser(user.id);
    
    if(!userInfo?.onboarded) redirect("/onboarding")

    const post = await fetchThreadById(params.id)
    console.log(post)

    return (

        <section className="relative">
            <div>
                <ThreadCard
                    key={post._id}
                    id={post.id}
                    currentUserId={user?.id || " "}
                    author={post.author}
                    content={post.text}
                    parentId={post.parentId}
                    community={post.community}
                    createdAt={post.createdAt}
                    comments={post.children}

                />
            </div>
            <div className="mt-7">
                <Comment threadId={params.id} currentUserId={JSON.stringify(userInfo._id)} currentUserImg={userInfo.image}/>
            </div>

            <div>
                {
                    post.children.map((post:any) => (
                        <ThreadCard
                            key={post._id}
                            id={post.id}
                            currentUserId={user?.id || " "}
                            author={post.author}
                            content={post.text}
                            parentId={post.parentId}
                            community={post.community}
                            createdAt={post.createdAt}
                            comments={post.children}
                            isComment

                        />
                    ))
                }
            </div>
        </section>
    )
}

export default Page