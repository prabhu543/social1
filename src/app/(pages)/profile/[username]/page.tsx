import { getProfileByUsername, getUserLikedPosts, getUserPosts, isFollowing } from "@/actions/profile.action";
import ProfilePageClient from "@/frontend/profile/ProfilePageClient";
import NotFound from "./not-found";

interface PageProps {
  params: {
    username: string;
  };
}

// Separate async logic into a named component
async function ProfilePageServer({ params }: PageProps) {
  const user = await getProfileByUsername(params.username);
  if (!user) return NotFound();

  const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
  ]);

  return (
    <ProfilePageClient
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      isFollowing={isCurrentUserFollowing}
    />
  );
}

// Default export is now synchronous for type-safety
export default function Page(props: PageProps) {
  return <ProfilePageServer {...props} />;
}
