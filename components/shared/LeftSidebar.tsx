'use client'
import Link from 'next/link'
import {sidebarLinks} from '../../constants/index'
import { usePathname, useRouter } from "next/navigation";
import Image from 'next/image'
import { SignOutButton, SignedIn, useAuth } from '@clerk/nextjs';
function LeftSidebar(){
    const {userId} = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    return (
        <section className='custom-scrollbar leftsidebar'>
             <div className='w-full flex flex-1 flex-col gap-6 px-6'>
                {
                    sidebarLinks.map((link) => {
                        const isActive = (link.route.length >1 && pathname.includes(link.route)) || pathname === link.route
                        if(link.route=='/profile') link.route=`${link.route}/${userId}`
                        return (
                            <Link href={link.route} className={`leftsidebar_link ${isActive && 'bg-primary-500'}`}>
                                <Image src={link.imgURL} alt={link.label} width={24} height={24}/>
                                <p className='text-light-1 max-lg:hidden'>
                                    {link.label}
                                </p>
                            </Link>

                        )
                        
                    })
                }
             </div>
             <div className='mt-10 px-6'>
             <SignedIn>
            <SignOutButton signOutCallback={() => router.push('/sign-in')}>
              <div className='flex cursor-pointer gap-4 p-4'>
                <Image
                  src='/assets/logout.svg'
                  alt='logout'
                  width={24}
                  height={24}
                />
                <p className='text-light-2 max-lg:hidden'>
                    Logout
                </p>
              </div>
            </SignOutButton>
          </SignedIn>
             </div>
        </section>
    )
}

export default LeftSidebar