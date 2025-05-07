import { NextResponse, NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get("token")?.value;

  // Define public routes (excluding reset-password)
  const isPublicRoute = [
    "/login",
    "/register",
    "/verifyemail",
    "/reset-password",
  ].some((route) => path.startsWith(route));

  // Redirect unauthenticated users from protected routes
  if (!isPublicRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  // Redirect authenticated users from public routes
  if (isPublicRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/verifyemail",
    "/dashboard",
    "/gameover",
    "/reset-password/:path*",
  ],
};
