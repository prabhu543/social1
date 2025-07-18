"use client"

import { createComment, deletePost, getPosts, toggleLike } from '@/actions/post.action'
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SignInButton, useUser } from '@clerk/nextjs'
import { HeartIcon, MessageCircleIcon, SendIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react'
import { toast } from 'sonner';

type Posts = Awaited<ReturnType<typeof getPosts>>;
type Post = Posts[number];

const PostCard = ({ post, dbUserId }: { post: Post, dbUserId: string | null }) => {
  const { user } = useUser();
  const [newComment, setNewComment] = useState(""); // comments
  const [isCommenting, setIsCommenting] = useState(false);// comment loading
  const [isLiking, setIsLiking] = useState(false);// like loading
  const [isDeleting, setIsDeleting] = useState(false); // delete loader
  const [hasLiked, setHasLiked] = useState(post.likes.some((like) => like.userId === dbUserId));// already liked ? or not
  const [optimisticLikes, setOptimisticLikes] = useState(post._count.likes);// to get likes value => fast response

  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;

    try {
      setIsLiking(true);
      setHasLiked(prev => !prev)
      setOptimisticLikes(prev => prev + (hasLiked ? -1 : 1))

      await toggleLike(post.id)
    } catch (err) {
      setOptimisticLikes(post._count.likes)
      setHasLiked(post.likes.some(like => like.userId === dbUserId))
    } finally {
      setIsLiking(false)
    }
  }
  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return;
    try {
      setIsCommenting(true);
      const result = await createComment(post.id, newComment);
      if (result?.success) {
        toast.success("Comment Posted successfully");
        setNewComment("")
      }
    }
    catch (err) {
      toast.error("Failed to Add comment");
      console.log("Failed to Add comment, error : " + err);
    } finally {
      setNewComment("")
      setIsCommenting(false);
    }
  }
  const handleDeletePost = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const result = await deletePost(post.id);
      if (result.success) toast.success("Post deleted successfully");
      else throw new Error(result.error);
    } catch (err) {
      console.log("Failed to Add comment" + err);
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(true)
    }
  }
  return (
    <Card className="overflow-hidden">
      <CardContent>
        <div className='space-y-4'>
          <div className='flex gap-4'>
            <Link href={`/profile/${post.author.username}`}>
              <Avatar className="size-8 sm:w-10 sm:h-10">
                <AvatarImage src={post.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>
            <div>
              <Link href={`/profile/${post.author.username}`} className='text-gray-400 text-[12px]'>{`@${post.author.username}`}</Link>
              {/* <div></div> */}
            </div>
              {/* 3 dot icon  */}
          </div>
          <div className='space-y-2'>
            <h2 className='text-[15px]'>{post.content}</h2>
            {/* <div>{ images }</div> */}
            <div className='flex gap-4'>
              {user ? 
                <>
                  <Button variant='ghost' size="sm"
                    className={`text-muted-foreground gap-2 ${
                      hasLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-500"
                    }`}
                    onClick={handleLike}>
                    {hasLiked ? (
                      <HeartIcon className="size-5 fill-current" />
                    ) : (
                      <HeartIcon className="size-5" />
                    )}
                    <span>{optimisticLikes}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground gap-2 hover:text-blue-500"
                    onClick={() => setShowComments((prev) => !prev)}
                  >
                  <MessageCircleIcon
                    className={`size-5 ${showComments ? "fill-blue-500 text-blue-500" : ""}`}
                  />
                  <span>{post.comments.length}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground gap-2 hover:text-yellow-500"
                    // onClick={() => setShowComments((prev) => !prev)}
                  >
                    <SendIcon
                      className={`size-5 ${showComments ? "fill-blue-500 text-yellow-500" : ""}`}
                    />
                    <span>{post.comments.length}</span>
                  </Button>
                </>
              : <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
                    <HeartIcon className="size-5" />
                    <span>{optimisticLikes}</span>
                  </Button>
                </SignInButton>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PostCard
