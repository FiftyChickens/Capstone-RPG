import { NextRequest, NextResponse } from "next/server";
import { DBconnect } from "@/lib/dbConfig";
import "@/models/quest.model";
import "@/models/location.model";
import "@/models/item.model";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { UserModel } from "@/models/user.model";
import { IUser } from "@/interfaces/user.interface";
import { Types } from "mongoose";

DBconnect();

export async function GET(request: NextRequest) {
  try {
    const userId = getDataFromToken(request);

    const user = await getUserWithFullDetails(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "User found",
      user,
    });
  } catch (error) {
    return handleError(error);
  }
}

async function getUserWithFullDetails(userId: string | Types.ObjectId) {
  return await UserModel.findOne({ _id: userId })
    .select(
      "-password -email -isVerified -forgotPasswordToken -forgotPasswordTokenExpiry -verifyToken -verifyTokenExpiry"
    )
    .populate("stats.location")
    .populate({
      path: "activeQuests.questId",
      model: "Quest",
      populate: {
        path: "rewards.items",
        model: "Item",
      },
    })
    .populate({
      path: "activeQuests.questId.objectives",
    })
    .populate({
      path: "inventory.itemId",
      model: "Item",
    })
    .populate({
      path: "completedQuests",
      model: "Quest",
      populate: {
        path: "rewards.items",
        model: "Item",
      },
    })
    .lean<IUser>();
}

function handleError(error: unknown) {
  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(
    { error: "Unknown error occurred" },
    { status: 500 }
  );
}
// /users
