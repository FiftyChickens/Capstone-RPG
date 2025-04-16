import { DBconnect } from "@/lib/dbConfig";
import { UserModel } from "@/models/user.model";
import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";

DBconnect();

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Find user with unexpired verification token
    const user = await UserModel.findOne({
      verifyTokenExpiry: { $gt: Date.now() },
    });

    if (!user || !user.verifyToken) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Correctly compare the stored hashed token with the raw token
    const isValidToken = await bcryptjs.compare(token, user.verifyToken);

    if (!isValidToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // Update user verification status
    user.isVerified = true;
    user.verifyToken = null;
    user.verifyTokenExpiry = null;
    await user.save();

    return NextResponse.json({
      message: "Email verified successfully",
      success: true,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
