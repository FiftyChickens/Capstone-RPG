// src/app/api/cron/route.ts
import { DBconnect } from "@/lib/dbConfig";
import { UserModel } from "@/models/user.model";
import { NextResponse } from "next/server";

DBconnect();

export async function GET() {
  // Changed from DELETE to GET
  try {
    const now = new Date();
    const result = await UserModel.deleteMany({
      isVerified: false,
      verifyTokenExpiry: { $lt: now },
    });

    return NextResponse.json({
      message: `${result.deletedCount} unverified users removed`,
      success: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Cleanup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
