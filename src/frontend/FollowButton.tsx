"use client"

import { toggleFollow } from '@/actions/userInfo';
import { Button } from '@/components/ui/button';
import { Loader2Icon } from 'lucide-react';
import React, { useState } from 'react'
import { toast } from 'sonner';

const FollowButton = ({ userId }: { userId: string }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      await toggleFollow(userId);
      toast.success("User Followed successfully!!")
    } catch (err) {
      console.log("Failed to follow : " + err)
      toast.error("Error following user!!")
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <Button
      size='sm'
      variant='secondary'
      onClick={handleFollow}
      disabled={isLoading}
      className='w-20'
    >
      { isLoading ? <Loader2Icon className='size-4 animate-spin'/> : "Follow" }
    </Button>
  )
}

export default FollowButton
