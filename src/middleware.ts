import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/verify(.*)",
]);

export default clerkMiddleware(async(auth, req) => {
  const { userId } = await auth();

  // If route is protected and user not logged in → redirect
  if (isProtectedRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  }
  if (userId && (req.nextUrl.pathname.startsWith("/auth/sign-in") || req.nextUrl.pathname.startsWith("/auth/sign-up"))) {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Otherwise continue
  return NextResponse.next();
}
);
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

