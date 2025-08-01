import { auth, currentUser  } from '@clerk/nextjs/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Avatar, AvatarImage } from '@/components/ui/avatar'


// import { LinkIcon, MapPinIcon } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { getUserByClerkId } from '@/actions/userInfo';

export default async function Profile() {
  const authUser = await currentUser();
  if (!authUser) {
    console.log('User is not authenticated');
  }

  return <>{!authUser ? <Unauthenticated /> : <Authenticated />}</>;
}

// if user is not log-in / sign-in / sign-up
const Unauthenticated = () => {
  return (
    <div className='sticky '>
      <Card>
        <CardHeader>
          <CardTitle className='text-center text-xl font-semibold'>
            Welcome Back!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-center text-muted-foreground mb-4'>
            Login to access your profile and connect with others.
          </p>
          <SignInButton mode='modal'>
            <Button
              className='w-full'
              variant='outline'>
              Login
            </Button>
          </SignInButton>
          <SignUpButton mode='modal'>
            <Button
              className='w-full mt-2'
              variant='default'>
              Sign Up
            </Button>
          </SignUpButton>
        </CardContent>
      </Card>
    </div>
  );
};

// if user is log-in / sign-in / sign-up 
const Authenticated = async () =>{
  const { userId} = await auth();
  if (!userId) { }
  const user = await getUserByClerkId();
  return (
    <div>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <Link
              href={`/profile/${user?.username}`}
              className="flex flex-col items-center justify-center"
            >
              <Avatar className="w-20 h-20 border-2 ">
                <AvatarImage src={user?.image || "/avatar.png"} />
              </Avatar>

              <div className="mt-4 space-y-1">
                <h3 className="font-semibold">{user?.name}</h3>
                <p className="text-sm text-muted-foreground">{user?.username}</p>
              </div>
            </Link>

            {user?.bio && <p className="mt-3 text-sm text-muted-foreground">{user.bio}</p>}

            <div className="w-full">
              <Separator className="my-4" />
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{user?._count.following}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
                <Separator orientation="vertical" />
                <div>
                  <p className="font-medium">{user?._count.followers}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
              </div>
              <Separator className="my-4" />
            </div>

            <div className="w-full space-y-2 text-sm">
              {/* <div className="flex items-center text-muted-foreground">
                <MapPinIcon className="w-4 h-4 mr-2" />
                {user?.location || "No location"}
              </div>
              <div className="flex items-center text-muted-foreground">
                <LinkIcon className="w-4 h-4 mr-2 shrink-0" />
                {user?.website ? (
                  <a href={`${user?.website}`} className="hover:underline truncate" target="_blank">
                    {user?.website}
                  </a>
                ) : (
                  "No website"
                )}
              </div> */}
              <Button variant='outline' className='w-full'>My Profile</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}