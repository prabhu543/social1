// import { getProfileByUsername } from "@/actions/profile.action";

import { getProfileByUsername, getUserLikedPosts, getUserPosts, isFollowing } from "@/actions/profile.action";
import ProfilePageClient from "@/frontend/profile/ProfilePageClient";
import NotFound from "./not-found";

// meta data 👇
// export async function generateMetadata({ params }: { params: { username: string } }) {
//   const user = await getProfileByUsername(params.username);
//   if (!user) return;

//   return {
//     title: `${user.name ?? user.username}`,
//     description: user.bio || `Check out ${user.username}'s profile.`,
//   };
// }

const ProfilePageServer = async ({ params }: { params: { username: string } }) => {
	const user = await getProfileByUsername(params.username);
	if (!user) return NotFound();

	const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
		getUserPosts(user.id),
		getUserLikedPosts(user.id),
		isFollowing(user.id),
	]);

	return <ProfilePageClient
		user={user}
		posts={posts}
		likedPosts={likedPosts}
		isFollowing={isCurrentUserFollowing}
	/>;
};

export default ProfilePageServer;
