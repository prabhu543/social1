'use server';

import prisma from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';

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
