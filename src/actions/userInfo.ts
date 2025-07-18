'use server';

import prisma from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function getUserByClerkId() {
	const user = await currentUser();
	if (!user) {
	}
	return prisma.user.findUnique({
		where: {
			clerkId: user?.id,
		},
		include: {
			_count: {
				select: {
					followers: true,
					following: true,
					posts: true,
				},
			},
		},
	});
}

export async function getDbUserId() {
	const { userId: clerkId } = await auth();
	if (!clerkId) {
		throw new Error('Unauthorized');
	}

	const user = await getUserByClerkId();
	if (!user) {
		throw new Error('User not found');
	}

	return user.id;
}

// for whomToFollow page
export async function getRandomUser() {
	try {
		const userId = await getDbUserId();

		// get random 3 users to follow where exclude yourself and those you follow already
		const randomUser = await prisma.user.findMany({
			where: {
				AND: [
					{ NOT: { id: userId } },
					{ NOT: { followers: { some: { followerId: userId } } } },
				],
			},
			select: {
				id: true,
				username: true,
				name: true,
				image: true,
				_count: {
					select: {
						followers: true,
					},
				},
			},
			take: 3,
		});

		return randomUser;
	} catch (err) {
		console.log('Error in fetching random users!!', err);
		return [];
	}
}

export async function toggleFollow(targetUserId: string) {
	try {
		const userId = await getDbUserId();

		if (userId === targetUserId) throw new Error('You cannot follow yourself!');

		const existingFollow = await prisma.follows.findUnique({
			where: {
				followerId_followingId: {
					followerId: userId,
					followingId: targetUserId,
				},
			},
		});

		if (existingFollow) {
			// to unfollow
			await prisma.follows.delete({
				where: {
					followerId_followingId: {
						followerId: userId,
						followingId: targetUserId,
					},
				},
			});
		} else {
			// to follow using transaction to create many workspaces when we follow someone 
			await prisma.$transaction([
				prisma.follows.create({
					data: {
						followerId: userId,
						followingId: targetUserId,
					},
				}),

				prisma.notification.create({
					data: {
						type: "FOLLOW",
						userId: targetUserId, // to whom we follow
						creatorId : userId , // user following
					}
				})
			]);
			
		}

		revalidatePath("/")
		return { success: true };
	} catch (err) {
		console.log('follow error : ' + err);
		return { success: false ,error :  " Error toggling mode" }
	}
}
