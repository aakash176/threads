
import ThreadCard from "@/components/cards/ThreadCard";
import { fetchPosts } from "@/lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs";
export default async function Home() {
  const user = await currentUser()
  const result = await fetchPosts(1, 30)
  console.log('result',result)
  return (
    <div>
      <h1 className="head-text text-left">Home</h1>
      <section className="mt-9 flex flex-col gap-10">
        {
          result.posts.length == 0? (
            <p className="no-result">No thread found</p>
          ):
          (
            <>
              {
                result.posts.map((post) => (
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
                ))
              }
            </>
          )
        }
      </section>
    </div>
  )
}