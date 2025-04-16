import { NextRequest, NextResponse } from "next/server";
import LocationModel from "@/models/location.model";
import { DBconnect } from "@/lib/dbConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { UserModel } from "@/models/user.model";

DBconnect();

export async function POST(request: NextRequest) {
  try {
    const userId = getDataFromToken(request);
    const { locationId } = await request.json();
    if (!locationId || locationId.length === 0) {
      return NextResponse.json(
        { error: "No location ID provided" },
        { status: 400 }
      );
    }

    const user = await UserModel.findById(userId).select("-password -email");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const location = await LocationModel.findById(locationId);
    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    user.stats.location = locationId;
    await user.save();
    return NextResponse.json(
      { message: "Location changed successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
