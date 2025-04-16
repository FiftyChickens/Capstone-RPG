import { NextRequest, NextResponse } from "next/server";
import { DBconnect } from "@/lib/dbConfig";
import { EnemyModel } from "@/models/enemy.model";

DBconnect();

export async function POST(request: NextRequest) {
  try {
    const { enemyIds } = await request.json();

    if (!enemyIds || !Array.isArray(enemyIds)) {
      return NextResponse.json(
        { error: "Enemy IDs are required and must be an array" },
        { status: 400 }
      );
    }

    const enemies = await EnemyModel.find({ _id: { $in: enemyIds } }).populate({
      path: "drop.itemId",
      model: "Item",
    });

    if (!enemies.length) {
      return NextResponse.json(
        {
          message: "No enemies found by ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(enemies, { status: 200 });
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
