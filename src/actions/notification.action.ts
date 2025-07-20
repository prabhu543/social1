'use server';

import prisma from '@/lib/prisma';
import { getDbUserId } from './userInfo';

// get notifications from here 👇
export async function getNotifications() {
	try {
		const userId = await getDbUserId();
		if (!userId) return [];

		const notifications = await prisma.notification.findMany({
			where: {
				userId,
			},
			include: {
				creator: {
					select: {
						id: true,
						name: true,
						username: true,
						image: true,
					},
				},
				post: {
					select: {
						id: true,
						content: true,
						image: true,
					},
				},
				comment: {
					select: {
						id: true,
						content: true,
						createdAt: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		return notifications;
	} catch (err) {
		console.error('Error fetching notifications:', err);
		throw new Error('Failed to fetch notifications');
	}
}

// message read true 👇
export async function markNotificationsAsRead(notificationIds: string[]) {
	try {
		await prisma.notification.updateMany({
			where: {
				id: {
					in: notificationIds,
				},
			},
			data: {
				read: true,
			},
		});

		return { success: true };
	} catch (err) {
		console.error('Error marking notifications as read:', err);
		return { success: false };
	}
}
