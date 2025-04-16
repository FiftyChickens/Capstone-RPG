import { getDataFromToken } from "@/helpers/getDataFromToken";
import QuestModel from "@/models/quest.model";
import { UserModel } from "@/models/user.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const userId = getDataFromToken(request);
    const { questId } = await request.json();

    if (!questId) {
      return NextResponse.json(
        { error: "No quest ID provided" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(questId)) {
      return NextResponse.json(
        { error: "Invalid quest ID format" },
        { status: 400 }
      );
    }

    const questIdObject = questId;

    const user = await UserModel.findById(userId).select("-password -email");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const quest = await QuestModel.findById(questIdObject);
    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    // Add the quest to the user's activeQuests
    user.activeQuests.push({
      questId: questIdObject, // Ensure questId is an ObjectId
      progress: 0, // Initialize progress to 0
    });

    await user.save();

    return NextResponse.json(
      { message: "Quest added to active quests", user },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error in quest assignment:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
