import { NextRequest, NextResponse } from "next/server";
import { DBconnect } from "@/lib/dbConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { UserModel } from "@/models/user.model";
import { IStats, IUser } from "@/interfaces/user.interface";

DBconnect();

export async function POST(request: NextRequest) {
  try {
    const userId = getDataFromToken(request);
    const user = await UserModel.findOne({ _id: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await resetUserData(user);

    return NextResponse.json({ message: "User data reset successfully" });
  } catch (error) {
    return handleError(error);
  }
}

async function resetUserData(user: IUser) {
  user.stats = {
    level: 1,
    XP: 0,
    health: 100,
    maxHealth: 100,
    damage: 1,
    gold: 0,
    location: {
      _id: "67ae4e221f7be1d2e20f48ef",
      name: "",
      description: "",
      actions: [],
    },
    totalPlaytime: 0,
  };

  user.completedQuests = [];
  user.completedActions = [];
  user.inventory = [];
  user.activeQuests = [];

  await user.save();
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
// /users/reset
