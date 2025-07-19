"use client"

import { createComment, deletePost, getPosts, toggleLike } from '@/actions/post.action'
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SignInButton, useUser } from '@clerk/nextjs'
import { HeartIcon, Loader2Icon, LogInIcon, MessageCircleIcon, SendIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react'
import { toast } from 'sonner';

import { formatDistanceToNow } from "date-fns";
import { DeleteAlertDialog } from './DeleteAlertDialog';
import Image from 'next/image';

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

  const [showComments, setShowComments] = useState(false); // to show comments on onClick

  // to like on post
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
  // to comment on post
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
  // to delete post 
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
          <div className="flex space-x-3 sm:space-x-4">
            <Link href={`/profile/${post.author.username}`}>
              <Avatar className="size-8 sm:w-10 sm:h-10">
                <AvatarImage src={post.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>

            {/* POST HEADER & TEXT CONTENT */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
                  <Link
                    href={`/profile/${post.author.username}`}
                    className="font-semibold truncate"
                  >
                    {post.author.name}
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Link href={`/profile/${post.author.username}`}>@{post.author.username}</Link>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                  </div>
                </div>
                {/* Check if current user is the post author */}
                {dbUserId === post.author.id && (
                  <DeleteAlertDialog isDeleting={isDeleting} onDelete={handleDeletePost} />
                )}
              </div>
              <p className="mt-2 text-sm text-foreground break-words">{post.content}</p>
            </div>
          </div>
           {/* POST IMAGE */}
          {post.image && (
            <div className="rounded-lg overflow-hidden">
              <Image src={post.image} alt="Post content" className="w-full h-auto object-cover" />
            </div>
          )}
          <div className='space-y-2'>
            <div className='flex gap-4'>
              {user ? <Button variant='ghost' size="sm"
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
                </Button> : <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
                    <HeartIcon className="size-5" />
                    <span>{optimisticLikes}</span>
                  </Button>
                </SignInButton>}
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
              {/* share button is here.. */}
              <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground gap-2 hover:text-green-500"
                    // onClick={() => setShowComments((prev) => !prev)}
                  >
                    <SendIcon
                      className={`size-5 `}
                    />
                    <span>0</span>
              </Button>
            </div>
              {/* comments here 👇 */}
              {showComments &&
                <div className={` space-y-4 pt-4 ${user ? "border-t" : ""} `}>
                {user ?
                  (<div className='flex gap-3 items-center justify-between py-3'>
                    <Avatar className="size-8 flex-shrink-0">
                      <AvatarImage src={user?.imageUrl || "/avatar.png"} />
                    </Avatar>
                    <div className='px-2 w-full flex gap-2 items-center'>
                      <Input placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        className="flex items-center bg-yellow-300 hover:bg-yellow-200"
                        disabled={!newComment.trim() || isCommenting}
                      >
                        {isCommenting ? (
                          <>
                            <Loader2Icon className="size-4 mr-2 animate-spin" />
                            Commenting...
                          </>
                          ) : (
                          <>
                            <SendIcon className="size-4 mr-2" />
                            Send
                          </>
                          )}
                      </Button>
                    </div>
                  </div>)
                  :
                  (<div className="flex justify-center p-4 border rounded-lg bg-muted/50">
                    <SignInButton mode="modal">
                      <Button variant="outline" className="gap-2">
                        <LogInIcon className="size-4" />
                        Sign in to comment
                      </Button>
                    </SignInButton>
                  </div>
                  )}
                  <div className="space-y-4">
                    {/* DISPLAY COMMENTS */}
                    {post.comments.length >0 ? post.comments.map(comment => (
                      <div key={comment.id} className="flex space-x-3">
                        <Avatar className="size-8 flex-shrink-0">
                          <AvatarImage src={comment.author.image ?? "/avatar.png"} />
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="font-medium text-sm">{comment.author.name}</span>
                            <span className="text-sm text-muted-foreground">
                              @{comment.author.username}
                            </span>
                            <span className="text-sm text-muted-foreground">·</span>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.createdAt))} ago
                            </span>
                          </div>
                          <p className="text-sm break-words">{comment.content}</p>
                        </div>
                      </div>
                      )) :
                      <p className='text-gray-400 text-[13px] text-center'>
                        No comments. Be the First to Comment.
                      </p>
                    }
                  </div>
                </div>
              }
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PostCard
