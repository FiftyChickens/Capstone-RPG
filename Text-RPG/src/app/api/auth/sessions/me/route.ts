import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ isLoggedIn: false });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.json({ isLoggedIn: true });
  } catch (error: unknown) {
    // Log the error for debugging purposes
    if (error instanceof Error) {
      console.error("JWT verification error:", error.message);
    } else {
      console.error("Unknown JWT verification error occurred");
    }

    return NextResponse.json({ isLoggedIn: false }, { status: 401 });
  }
}
