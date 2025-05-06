import { NextRequest, NextResponse } from "next/server";
import { DBconnect } from "@/lib/dbConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { UserModel } from "@/models/user.model";
import { IUser } from "@/interfaces/user.interface";
import { Document } from "mongoose";
import calculateXPAndLevel from "@/helpers/calculateXPAndLevel";

DBconnect();

export async function PATCH(request: NextRequest) {
  try {
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();

    const user = await UserModel.findOne({ _id: userId }).select(
      "-password -email"
    );
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const updateFields: Record<string, number> = {};
    const setFields: Record<string, number> = {};

    if ("maxHealthIncrease" in payload) {
      updateFields["stats.maxHealth"] = payload.maxHealthIncrease;
      updateFields["stats.health"] = payload.maxHealthIncrease;
    }

    if ("damageIncrease" in payload) {
      updateFields["stats.damage"] = payload.damageIncrease;
    }

    if ("updateGold" in payload) {
      updateFields["stats.gold"] = payload.updateGold;
    }

    if ("updateHealth" in payload) {
      setFields["stats.health"] = Math.max(
        0,
        Math.min(Number(payload.updateHealth), user.stats.maxHealth)
      );
    }

    if ("healAmount" in payload) {
      setFields["stats.health"] = Math.min(
        user.stats.health + payload.healAmount,
        user.stats.maxHealth
      );
    }

    if ("increaseXP" in payload) {
      const { newXP, newLevel } = calculateXPAndLevel(
        user.stats.XP,
        user.stats.level,
        payload.increaseXP
      );
      setFields["stats.XP"] = newXP;
      setFields["stats.level"] = newLevel;
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      {
        ...(Object.keys(updateFields).length > 0 && { $inc: updateFields }),
        ...(Object.keys(setFields).length > 0 && { $set: setFields }),
      },
      { new: true, select: "-password -email" }
    );

    return NextResponse.json(updatedUser?.stats);
  } catch (error) {
    console.error("Error in PATCH /stats:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed" },
      { status: 500 }
    );
  }
}
// /users/stats
