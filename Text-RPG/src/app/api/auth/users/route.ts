import { DBconnect } from "@/lib/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "@/helpers/mailer";
import { UserModel } from "@/models/user.model";

DBconnect();

interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

function hasSpecialCharacter(password: string) {
  const specialCharRegex = /[^a-zA-Z0-9]/;
  return specialCharRegex.test(password);
}

function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateUserInput(user: SignupRequest) {
  const errors: string[] = [];

  if (user.username.length < 3) {
    errors.push("Username must be at least 3 characters long");
  }
  if (!isValidEmail(user.email)) {
    errors.push("Please enter a valid email address");
  }
  if (user.password.length < 5) {
    errors.push("Password must be at least 5 characters long");
  }
  if (!hasSpecialCharacter(user.password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function POST(request: NextRequest) {
  try {
    const reqBody: SignupRequest = await request.json();
    const { username, email, password } = reqBody;

    const validation = validateUserInput(reqBody);
    if (!validation.isValid) {
      return NextResponse.json(
        { message: "Validation failed", errors: validation.errors },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    //check if user exists
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (user) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      );
    }

    //hash the password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Generate verification token
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    const newUser = new UserModel({
      username,
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: false,
      verifyToken: verifyToken || null,
      verifyTokenExpiry: verifyTokenExpiry || null,
      stats: {},
    });

    const savedUser = await newUser.save();
    console.log("Saved user:" + savedUser);

    // send verification email
    await sendEmail({
      email: normalizedEmail,
      emailType: "VERIFY",
      userId: savedUser.id,
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        success: true,
        savedUser,
      },
      { status: 201 }
    );
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
