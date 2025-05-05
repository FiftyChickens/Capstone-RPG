import { DBconnect } from "@/lib/dbConfig";
import { UserModel } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendEmail } from "@/helpers/mailer";
import bcryptjs from "bcryptjs";

DBconnect();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { error: "User with this email does not exist." },
        { status: 400 }
      );
    }

    // Generate plain text token (don't hash yet)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token before storing
    const hashedToken = await bcryptjs.hash(resetToken, 10);

    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordTokenExpiry = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    // Send email
    await sendEmail({
      email: normalizedEmail,
      emailType: "RESET",
      userId: user._id,
      resetToken,
    }).catch(console.error);

    return NextResponse.json({
      message: "Reset email sent successfully, if email exists",
    });
  } catch (error: unknown) {
    console.error("Password reset request error:", error);

    let errorMessage = "Error while sending the reset email.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
