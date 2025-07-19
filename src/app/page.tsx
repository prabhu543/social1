import React from 'react'
import CreatePost from '@/frontend/post/CreatePost'
import { currentUser } from '@clerk/nextjs/server'
import WhoToFollow from '@/frontend/WhoToFollow';
import { getPosts } from '@/actions/post.action';
import PostCard from '@/frontend/post/PostCard';
import { getDbUserId } from '@/actions/userInfo';

export default async function Home() {
  const user = await currentUser();
  // 👇 commented just for testing purpose only ----------------------- >
  // if (!user) return; 

  const posts = await getPosts()
  const dbUserId = await getDbUserId();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-6">
        {/* to create post by user  */}
        {user ? <CreatePost /> : null}
        {/* to show posts  */}
        <div className='space-y-6'>
          {posts.map(post => (
            <PostCard key={post.id} post={post} dbUserId={dbUserId} />
          ))}
        </div>
      </div>
      {/* to follow new people here , random recommendation =>  */}
      <div className="hidden lg:block lg:col-span-4 sticky top-20">
        <WhoToFollow />
      </div>
    </div>
  )
}

