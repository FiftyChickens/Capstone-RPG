import { getDataFromToken } from "@/helpers/getDataFromToken";
import { UserModel } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const userId = getDataFromToken(request);

    const { actionId } = await request.json();
    if (!actionId || actionId.length <= 0) {
      return NextResponse.json(
        { error: "No action ID provided" },
        { status: 400 }
      );
    }

    const user = await UserModel.findById(userId).select("-password -email");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add the action ID to completedActions if it doesn't already exist
    if (!user.completedActions.includes(actionId)) {
      user.completedActions.push(actionId);
      await user.save();
    }

    return NextResponse.json(
      { message: "Action completed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Post /actions error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
