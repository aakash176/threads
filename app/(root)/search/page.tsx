import UserCard from "@/components/cards/UserCard"
import PostThread from "@/components/forms/PostThread"
import ProfileHeader from "@/components/shared/ProfileHeader"
import Searchbar from "@/components/shared/Searchbar"

import { profileTabs } from "@/constants"
import { fetchUser, fetchUserPosts, fetchUsers } from "@/lib/actions/user.actions"
import { currentUser } from "@clerk/nextjs"
import Image from "next/image"
import { redirect } from "next/navigation"
async function Page() {
    const user = await currentUser()
    if (!user) return null
    const userInfo = await fetchUser(user.id)
    if (!userInfo?.onboarded) redirect('/onboarding')

     const users = await fetchUsers({userId:user.id, searchString:'', pageNumber:1,pageSize:25})

  return (
    <>
        <div className="head-text mb-5">Search</div>
        <Searchbar routeType='search' />
        
        <div className="mt-14 flex flex-col gap-9">
          {
            users.users.length==0?(<p className="no-result">No Users</p>):(
              <>
                {
                  users.users.map((u) => (
                    <UserCard
                      key={u.id}
                      id={u.id}
                      name={u.name}
                      username={u.username}
                      imgUrl={u.image}
                      userType="user"

                    />
                  ))
                }
              </>
            )
          }
        </div>
    </>

  )
}

export default Page