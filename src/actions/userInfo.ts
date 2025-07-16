"use server"

import prisma from "@/lib/prisma";

export async function getUserByClerkId(clerkId: string) {
	return prisma.user.findUnique({
		where: {
			clerkId,
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
