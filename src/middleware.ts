import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

function clerkEnvMissing(): boolean {
  return (
    !process.env.CLERK_SECRET_KEY?.trim() ||
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()
  );
}

export default clerkMiddleware(async (auth, req) => {
  // Avoid hard Edge failures when Vercel env is incomplete (common on first deploy).
  if (clerkEnvMissing()) {
    console.error(
      "[middleware] Missing CLERK_SECRET_KEY or NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY — set them in Vercel (see VERCEL.md)",
    );
    if (isProtectedRoute(req)) {
      const url = new URL(req.url);
      url.pathname = "/login";
      url.searchParams.set("configuration_error", "clerk_env");
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
