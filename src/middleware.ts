import { NextResponse, type NextRequest } from "next/server";

const isProtectedRoute = (pathname: string) => pathname.startsWith("/dashboard");

function clerkEnvMissing(): boolean {
  return (
    !process.env.CLERK_SECRET_KEY?.trim() ||
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()
  );
}

async function withClerk(req: NextRequest) {
  const { clerkMiddleware, createRouteMatcher } = await import(
    "@clerk/nextjs/server"
  );
  const matcher = createRouteMatcher(["/dashboard(.*)"]);
  return clerkMiddleware(async (auth, r) => {
    if (matcher(r)) await auth.protect();
  })(req, {} as never);
}

export default async function middleware(req: NextRequest) {
  if (clerkEnvMissing()) {
    if (isProtectedRoute(req.nextUrl.pathname)) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("configuration_error", "clerk_env");
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
  return withClerk(req);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
