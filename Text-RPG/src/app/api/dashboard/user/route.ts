import { NextRequest, NextResponse } from "next/server";
import { DBconnect } from "@/lib/dbConfig";
import "@/models/quest.model";
import "@/models/location.model";
import "@/models/item.model";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { UserModel } from "@/models/user.model";
import { IUser } from "@/interfaces/user.interface";
import QuestModel from "@/models/quest.model";
import { IQuest } from "@/interfaces/quest.interface";
import { IItem, IItemId } from "@/interfaces/items.interface";
import { Document } from "mongoose";
import calculateXPAndLevel from "@/helpers/calculateXPAndLevel";

DBconnect();

export async function GET(request: NextRequest) {
  try {
    const userId = getDataFromToken(request);

    const user = await UserModel.findOne({ _id: userId })
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

      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User found", user });
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

export async function PATCH(request: NextRequest) {
  try {
    const userId = getDataFromToken(request);
    const {
      maxHealthIncrease,
      damageIncrease,
      healAmount,
      updateHealth,
      updateGold,
      increaseXP,
      questProgressIncrease,
      questId,
    } = await request.json();
    const user = await UserModel.findOne({ _id: userId }).select(
      "-password -email"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { updateFields, setFields } = updateUserStats(user, {
      maxHealthIncrease,
      damageIncrease,
      healAmount,
      updateHealth,
      updateGold,
      increaseXP,
    });

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      {
        ...(Object.keys(updateFields).length > 0 && { $inc: updateFields }),
        ...(Object.keys(setFields).length > 0 && { $set: setFields }),
        activeQuests: user.activeQuests,
        completedQuests: user.completedQuests,
        inventory: user.inventory,
      },
      { new: true, select: "-password -email" }
    );

    let responseMessage = { message: "Stats updated" };

    if (questId && questProgressIncrease !== undefined) {
      const questResponse = await updateQuestProgress(
        user,
        questId,
        questProgressIncrease
      );
      responseMessage = { ...responseMessage, ...questResponse };
    }

    return NextResponse.json({ ...responseMessage, user: updatedUser });
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

function updateUserStats(
  user: IUser & Document,
  {
    maxHealthIncrease,
    damageIncrease,
    healAmount,
    updateHealth,
    updateGold,
    increaseXP,
  }: {
    maxHealthIncrease: number;
    damageIncrease: number;
    healAmount: number;
    updateHealth: number;
    updateGold: number;
    increaseXP: number;
  }
) {
  const updateFields: Record<string, number> = {};
  const setFields: Record<string, number> = {};

  if (maxHealthIncrease) {
    updateFields["stats.maxHealth"] = maxHealthIncrease;
    updateFields["stats.health"] = maxHealthIncrease;
  }
  if (damageIncrease) updateFields["stats.damage"] = damageIncrease;
  if (updateGold) updateFields["stats.gold"] = updateGold;

  if (healAmount !== undefined) {
    const healAmountValue = Math.min(
      user.stats.health + healAmount,
      user.stats.maxHealth
    );
    setFields["stats.health"] = healAmountValue;
  }
  if (updateHealth) setFields["stats.health"] = updateHealth;

  if (increaseXP) {
    const { newXP, newLevel } = calculateXPAndLevel(
      user.stats.XP,
      user.stats.level,
      increaseXP
    );

    setFields["stats.XP"] = newXP;
    setFields["stats.level"] = newLevel;
  }

  return { updateFields, setFields };
}

async function updateQuestProgress(
  user: IUser & Document,
  questId: string,
  questProgressIncrease: number
) {
  console.log(
    `Received update for quest ${questId} with progress increase ${questProgressIncrease}`
  );

  const activeQuest = user.activeQuests.find(
    (q) => q.questId.toString() === questId
  );

  if (!activeQuest) {
    console.log("Quest not found in activeQuests array.");
    return { message: "Quest not found in active quests" };
  }

  activeQuest.progress += questProgressIncrease;

  const quest = await QuestModel.findById(questId).lean<IQuest>();
  if (!quest) {
    console.log("Quest not found in database.");
    return { message: "Quest not found" };
  }

  if (!quest.objectives || quest.objectives.quantity === undefined) {
    console.log("No valid objectives found for this quest.");
    return { message: "No valid objectives" };
  }

  const totalRequired = quest.objectives.quantity;

  // Ensure progress doesn't exceed the required amount
  activeQuest.progress = Math.min(activeQuest.progress, totalRequired);

  // Mark the user document as modified
  user.markModified("activeQuests");

  // Check if quest is completed
  if (activeQuest.progress >= totalRequired) {
    console.log("Quest completed! Moving to completedQuests.");

    // Complete the quest and get rewards
    const rewards = await completeQuest(user, quest);

    // Save the user after completing the quest
    await user.save();

    return { message: "Quest completed!", rewards };
  } else {
    // Just update progress if not completed
    await user.save();
    return { message: "Quest progress updated" };
  }
}

async function completeQuest(user: IUser & Document, quest: IQuest) {
  if (!quest || !quest._id) {
    throw new Error("Invalid quest data");
  }

  // Remove from active quests
  user.activeQuests = user.activeQuests.filter(
    (q) => q.questId.toString() !== quest._id.toString()
  );
  console.log(
    "User activeQuests:",
    user.activeQuests.map((q) => ({
      questId: q.questId?.toString(),
      progress: q.progress,
    }))
  );

  // Add to completed Quest
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
      // Ensure items are populated
      const populatedItems = await QuestModel.findById(quest._id)
        .populate<{ rewards: { items: IItemId[] } }>("rewards.items")
        .lean<IQuest>();

      populatedItems?.rewards?.items.forEach((item: IItemId) => {
        const existingItem = user.inventory.find(
          (i) => i.itemId.toString() === item._id.toString()
        );

        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          user.inventory.push({
            itemId: new Object(), // Ensure it's the correct type
            quantity: 1,
            slot: user.inventory.length + 1,
          } as IItem); // Type assertion if needed
        }
      });
    }
  }
  await user.save();
  return rewards;
}

export async function POST(request: NextRequest) {
  try {
    const userId = getDataFromToken(request);

    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.stats = {
      level: 1,
      XP: 0,
      health: 100,
      maxHealth: 100,
      damage: 1,
      gold: 0,
      location: "67ae4e221f7be1d2e20f48ef",
      totalPlaytime: 0,
    };

    user.completedQuests = [];
    user.completedActions = [];
    user.inventory = [];
    user.activeQuests = [];

    await user.save();

    return NextResponse.json({
      message: "User data reset successfully",
      user,
    });
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
