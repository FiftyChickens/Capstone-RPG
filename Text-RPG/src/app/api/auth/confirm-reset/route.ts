import { DBconnect } from "@/lib/dbConfig";
import { UserModel } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";

DBconnect();

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json(
        { error: "Invalid request. Token and password are required." },
        { status: 400 }
      );
    }

    // Find user by the token
    const user = await UserModel.findOne({
      forgotPasswordTokenExpiry: { $gt: Date.now() }, // Ensure token hasn't expired
    });

    if (!user) {
      return NextResponse.json(
        { error: "No user found or token expired." },
        { status: 400 }
      );
    }

    // Compare the provided token with the stored hashed token
    const isTokenValid = await bcryptjs.compare(
      token,
      user.forgotPasswordToken
    );
    if (!isTokenValid) {
      return NextResponse.json(
        { error: "Token is invalid or expired." },
        { status: 400 }
      );
    }

    user.password = await bcryptjs.hash(password, 10);
    user.forgotPasswordToken = null; // Remove the reset token
    user.forgotPasswordTokenExpiry = null; // Remove expiry
    await user.save();

    return NextResponse.json({
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error: unknown) {
    let errorMessage = "Error restting password.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Password reset error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
