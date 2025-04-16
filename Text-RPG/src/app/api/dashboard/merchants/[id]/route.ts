import { NextResponse } from "next/server";
import MerchantModel from "@/models/merchant.model";
import { DBconnect } from "@/lib/dbConfig";
import type { NextRequest } from "next/server";

DBconnect();

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const merchantId = (await params).id;

  try {
    const merchant = await MerchantModel.findById(merchantId).populate(
      "itemsForSale.itemId"
    );

    if (!merchant) {
      return NextResponse.json(
        { error: "Merchant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(merchant);
  } catch (error) {
    console.error("Error fetching merchant data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
