'use server';

import prisma from '@/lib/prisma';
import { getDbUserId } from './userInfo';
import { revalidatePath } from 'next/cache';

export async function createPost(content: string, image: string) {
	try {
		const userId = await getDbUserId();

		if (!userId) return;

		const post = await prisma.post.create({
			data: {
				content,
				image,
				authorId: userId,
			},
		});

		revalidatePath('/');
		return { success: true, post };
	} catch (error) {
		console.error('Failed to create post:', error);
		return { success: false, error: 'Failed to Create Post!' };
	}
}

export async function getPosts() {
	try {
		const posts = await prisma.post.findMany({
			orderBy: {
				createdAt: 'desc',
			},
			include: {
				author: {
					select: {
						name: true,
						image: true,
						username: true,
					},
				},
				comments: {
					include: {
						author: {
							select: {
								id: true,
								name: true,
								username: true,
								image: true,
							},
						},
					},
					orderBy: {
						createdAt: 'asc',
					},
				},
				likes: {
					select: {
						userId: true,
					},
				},
				_count: {
					select: {
						likes: true,
						comments: true,
					},
				},
			},
		});
		return posts;
	} catch (err) {
		console.log('Error in fetching posts : ' + err);
		throw new Error('Error in fetching posts');
	}
}

// Like toggle on a post
export async function toggleLike(postId: string) {
	try {
		const userId = await getDbUserId();
		if (!userId) return;

		// check if like exists
		const existingLike = await prisma.like.findUnique({
			where: {
				userId_postId: {
					userId,
					postId,
				},
			},
		});

		const post = await prisma.post.findUnique({
			where: { id: postId },
			select: { authorId: true },
		});

		if (!post) throw new Error('Post not found');
		
		if (existingLike) {
			// unlike
			await prisma.like.delete({
				where: {
					userId_postId: {
						userId,
						postId,
					},
				},
			});

		} else {
			// like and create notification (only if liking someone else's post , not self post)
			await prisma.$transaction([
				prisma.like.create({
					data: {
						userId,
						postId,
					},
				}),
				...(post.authorId !== userId
					? [
							prisma.notification.create({
								data: {
									type: 'LIKE',
									userId: post.authorId, // recipient (post author)
									creatorId: userId, // person who liked
									postId,
								},
							}),
						]
					: []),
			]);
		}


		revalidatePath('/'); // we can able to refresh the page using this.
		return { success: true };
	} catch (err) {
		console.error('Failed to toggle like:', err);
		return { success: false, error: 'Failed to toggle like' };
	}
}

// creation of comment on a post
export async function createComment(postId: string, content: string) {
	try {
		const userId = await getDbUserId();

		if (!userId) return;
		if (!content) throw new Error('Content is required');

		// find post via postId
		const post = await prisma.post.findUnique({
			where: { id: postId },
			select: { authorId: true },
		});

		if (!post) throw new Error('Post not found');

		// Create comment and notification in a transaction
		const [comment] = await prisma.$transaction(async (tx) => {
			// Create comment first
			const newComment = await tx.comment.create({
				data: {
					content,
					authorId: userId,
					postId,
				},
			});

			// notify that comment is being done to author of post
			// Create notification if commenting on someone else's post
			if (post.authorId !== userId) {
				await tx.notification.create({
					data: {
						type: 'COMMENT',
						userId: post.authorId,
						creatorId: userId,
						postId,
						commentId: newComment.id,
					},
				});
			}

			return [newComment];
		});

		revalidatePath(`/`);
		return { success: true, comment };
	} catch (error) {
		console.error('Failed to create comment:', error);
		return { success: false, error: 'Failed to create comment' };
	}
}

// delete post 
export async function deletePost(postId: string) {
	try {
		const userId = await getDbUserId();

		// find the post to delete
		const post = await prisma.post.findUnique({
			where: { id: postId },
			select: { authorId: true },
		});

		if (!post) throw new Error('Post not found');
		if (post.authorId !== userId)
			throw new Error('Unauthorized - no delete permission');

		// delete operation on a post
		await prisma.post.delete({
			where: { id: postId },
		});

		revalidatePath('/'); // purge the cache
		return { success: true };
	} catch (error) {
		console.error('Failed to delete post:', error);
		return { success: false, error: 'Failed to delete post' };
	}
}