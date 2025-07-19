import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// modify these for security reasons 👇
// const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

// export default clerkMiddleware(async (auth, req) => {
// 	if (!(await auth()).userId && isProtectedRoute(req)) {
// 		return auth.protect();
// 	}
// });
export default clerkMiddleware();

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
		// Always run for API routes
		'/(api|trpc)(.*)',
	],
};
