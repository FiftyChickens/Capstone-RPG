import { NextRequest, NextResponse } from "next/server";
import ItemModel from "@/models/item.model";
import { UserModel } from "@/models/user.model";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { DBconnect } from "@/lib/dbConfig";
import { IItem } from "@/interfaces/items.interface";

DBconnect();

export async function POST(request: NextRequest) {
  try {
    const userId = getDataFromToken(request);
    const body = await request.json();
    let { itemIds } = body;

    // If itemIds is not an array, try to convert it
    if (!Array.isArray(itemIds)) {
      if (typeof itemIds === "string") {
        itemIds = [itemIds];
      } else {
        return NextResponse.json(
          { error: "itemIds must be an array of a string" },
          { status: 401 }
        );
      }
    }

    if (!itemIds || itemIds.length === 0) {
      return NextResponse.json(
        { error: "No item IDs provided" },
        { status: 400 }
      );
    }

    const user = await UserModel.findById(userId).select("-password -email");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const item = await ItemModel.find({ _id: { $in: itemIds } });
    if (!item || item.length === 0) {
      return NextResponse.json(
        { error: "No valid items found" },
        { status: 404 }
      );
    }

    const addedItems: IItem[] = [];

    for (const itemId of itemIds) {
      const item = await ItemModel.findById(itemId);
      const existingItem = user.inventory.find(
        (invItem: IItem) => invItem.itemId.toString() === String(itemId)
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        user.inventory.push({
          itemId: itemId,
          quantity: 1,
          slot: user.inventory.length + 1, // Update slot if necessary
        });

        addedItems.push(item);
      }
    }

    await user.save();

    return NextResponse.json(
      { message: "Items added", addedItems, user },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = getDataFromToken(request);
    const { useItemId, sellItemIds, sellQuantity } = await request.json();

    if (!useItemId && !sellItemIds) {
      return NextResponse.json(
        { error: "No item ID provided" },
        { status: 400 }
      );
    }

    const user = await UserModel.findById(userId).select("-password -email");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Handle single item use
    if (useItemId) {
      const existingItemIndex = user.inventory.findIndex(
        (invItem: IItem) => invItem._id.toString() === useItemId.toString()
      );

      if (existingItemIndex === -1) {
        return NextResponse.json(
          { error: "Item not found in inventory" },
          { status: 400 }
        );
      }

      const existingItem = user.inventory[existingItemIndex];

      if (existingItem.quantity > 1) {
        existingItem.quantity -= 1;
      } else {
        user.inventory.splice(existingItemIndex, 1);
      }
    }
    // Handle bulk sale
    else if (sellItemIds && sellQuantity) {
      const existingItemIndex = user.inventory.findIndex(
        (invItem: IItem) => invItem._id.toString() === sellItemIds.toString()
      );

      if (existingItemIndex === -1) {
        return NextResponse.json(
          { error: "Item not found in inventory" },
          { status: 400 }
        );
      }

      const existingItem = user.inventory[existingItemIndex];

      if (existingItem.quantity < sellQuantity) {
        return NextResponse.json(
          { error: "Not enough items in inventory" },
          { status: 400 }
        );
      }

      if (existingItem.quantity > sellQuantity) {
        existingItem.quantity -= sellQuantity;
      } else {
        user.inventory.splice(existingItemIndex, 1);
      }
    }

    await user.save();
    return NextResponse.json(
      {
        message: sellItemIds ? "Items sold" : "Item used",
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
