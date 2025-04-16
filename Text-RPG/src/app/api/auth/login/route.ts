import { DBconnect } from "@/lib/dbConfig";
import { UserModel } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

DBconnect();

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const reqBody: LoginRequest = await request.json();
    const { email, password } = reqBody;

    const normalizedEmail = email.toLowerCase();

    //check if user exists
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 400 }
      );
    }

    //check if password is correct
    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 400 }
      );
    }

    //create token data
    const tokenData = {
      id: user._id,
      username: user.username,
      email: user.email,
    };
    //create token
    const token = jwt.sign(tokenData, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    const response = NextResponse.json({
      message: "Login successful",
      success: true,
      token,
    });

    response.cookies.set("token", token, {
      httpOnly: true, // Makes it inaccessible to JavaScript
      secure: process.env.NODE_ENV === "production", // Secure only in production
      sameSite: "strict",
      path: "/",
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day expiry
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}
