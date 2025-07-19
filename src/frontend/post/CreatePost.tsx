"use client"

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@clerk/nextjs' //  for client side 
import React, { useState } from 'react'

import { ImageIcon, Video, BarChart2, Calendar ,  Loader2Icon, SendIcon } from 'lucide-react'; // ← icons here
import { Button } from '@/components/ui/button';
import { createPost } from '@/actions/post.action';
import { toast } from 'sonner';

const Media = [
  { id: 1, label: 'Photo', icon: ImageIcon, color: 'text-blue-500' },
  // in future lets add these --->
  // { id: 2, label: 'Video', icon: Video, color: 'text-red-500' },
  // { id: 3, label: 'Poll', icon: BarChart2, color: 'text-yellow-500' },
  // { id: 4, label: 'Schedule', icon: Calendar, color: 'text-green-500' },
];


const CreatePost = () => {
  const { user } = useUser();
  if (!user) { }

  const [content, setContent] = useState(""); // for text content of post
  const [imageUrl, setImageUrl] = useState(""); // for image 
  const [isPosting, setIsPosting] = useState(false); // for loading
  const [showImageUpload, setShowImageUpload] = useState(false); // for dropdown to select image

  const handleSubmit = async () => {
    try {
      if (!content.trim() && !imageUrl) return; // if nothing to post => return 
      setIsPosting(true); // loading is started => loading true => phase of posting

      const result = await createPost(content, imageUrl);

      if (result?.success) {
        // reset the form here 👇
        setContent("")
        setImageUrl("")
        setShowImageUpload(false)

        toast.success("Post created successfully!!!") // toast => popup
      }

    } catch (err) {
      // reset the form here 👇
      setContent("")
      setImageUrl("")
      setShowImageUpload(false)
      
      console.error("Failed to create post:", err);
      toast.error("Failed to create post"); // toast => popup
    } finally {
      setIsPosting(false); // loading is ended => loading false => post 👍
    }
  }
  
  return (
    <Card className='mb-6'>
      <CardContent className='flex gap-8'>
        <Avatar className="w-15 h-15 border-2 ">
          <AvatarImage src={ user?.imageUrl || "/avatar.png"} />
        </Avatar>
        <div className='space-x-4 space-y-4 w-full'>
          <Textarea
            placeholder="Tell your friends about your thoughts here..."
            className='resize-none w-122'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPosting}
            />
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex space-x-2" >
              {Media.map(({id, label, icon: Icon, color }) => (
                  <Button
                    key={id}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => setShowImageUpload(!showImageUpload)}
                    disabled={isPosting}
                  >
                    <Icon className={`w-5 h-5 ${color}`} />
                    <span className="text-sm">{label}</span>
                  </Button>
                // use can use "Tooltip" of shad_cn ui
              ))}
            </div>
            <Button
              className="flex items-center"
              onClick={handleSubmit}
              disabled={(!content.trim() && !imageUrl) || isPosting} // if no content and no image  => button disabled
            >
              {isPosting ? (
                <>
                  <Loader2Icon className="size-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <SendIcon className="size-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card >
  )
}

export default CreatePost
