'use server';

import prisma from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

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
