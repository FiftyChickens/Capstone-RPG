import { NextRequest, NextResponse } from "next/server";
import { DBconnect } from "@/lib/dbConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { UserModel } from "@/models/user.model";
import { IUser } from "@/interfaces/user.interface";
import QuestModel from "@/models/quest.model";
import { IQuest } from "@/interfaces/quest.interface";
import { Document } from "mongoose";
import calculateXPAndLevel from "@/helpers/calculateXPAndLevel";

DBconnect();

export async function PATCH(request: NextRequest) {
  try {
    const userId = getDataFromToken(request);
    const { questId, progressIncrease } = await request.json();

    const user = await UserModel.findOne({ _id: userId }).select(
      "-password -email"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const response = await handleQuestProgress(user, questId, progressIncrease);
    return NextResponse.json(response);
  } catch (error) {
    return handleError(error);
  }
}

async function handleQuestProgress(
  user: IUser & Document,
  questId: string,
  progressIncrease: number
) {
  const activeQuest = user.activeQuests.find(
    (q) => q.questId.toString() === questId
  );

  if (!activeQuest) {
    return { error: "Quest not found in active quests" };
  }

  const quest = await QuestModel.findById(questId).lean<IQuest>();
  if (!quest) {
    return { error: "Quest not found" };
  }

  if (!quest.objectives || quest.objectives.quantity === undefined) {
    return { error: "No valid objectives" };
  }

  activeQuest.progress += progressIncrease;
  const totalRequired = quest.objectives.quantity;
  activeQuest.progress = Math.min(activeQuest.progress, totalRequired);

  user.markModified("activeQuests");

  if (activeQuest.progress >= totalRequired) {
    const rewards = await completeQuest(user, quest);
    await user.save();
    return {
      message: "Quest completed",
      rewards,
      activeQuests: user.activeQuests,
      completedQuests: user.completedQuests,
    };
  }

  await user.save();
  return {
    message: "Quest progress updated",
    progress: activeQuest.progress,
    totalRequired,
  };
}

async function completeQuest(user: IUser & Document, quest: IQuest) {
  if (!quest || !quest._id) {
    throw new Error("Invalid quest data");
  }

  user.activeQuests = user.activeQuests.filter(
    (q) => q.questId.toString() !== quest._id.toString()
  );

  if (
    !user.completedQuests.some((q) => q.toString() === quest._id.toString())
  ) {
    user.completedQuests.push(quest);
  }

  const rewards = {
    XP: quest.rewards?.XP || 0,
    gold: quest.rewards?.gold || 0,
    items: quest.rewards?.items || [],
  };

  if (quest.rewards) {
    if (quest.rewards.XP) {
      const { newXP, newLevel } = calculateXPAndLevel(
        user.stats.XP,
        user.stats.level,
        quest.rewards.XP
      );
      user.stats.XP = newXP;
      user.stats.level = newLevel;
    }
    if (quest.rewards.gold) {
      user.stats.gold += quest.rewards.gold;
    }
    if (quest.rewards.items && quest.rewards.items.length > 0) {
      const populatedItems = await QuestModel.findById(quest._id)
        .populate("rewards.items")
        .lean<IQuest>();

      populatedItems?.rewards?.items.forEach((item) => {
        const existingItem = user.inventory.find(
          (i) => i.itemId.toString() === item._id.toString()
        );

        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          user.inventory.push({
            _id: "",
            itemId: item,
            quantity: 1,
            slot: user.inventory.length + 1,
          });
        }
      });
    }
  }

  return rewards;
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
// /users/quests
