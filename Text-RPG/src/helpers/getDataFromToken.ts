import mongoose from "mongoose";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

interface DecodedToken {
  id: string;
}

export const getDataFromToken = (
  request: NextRequest
): mongoose.Types.ObjectId => {
  const token = request.cookies.get("token")?.value || "";

  if (!token) {
    throw new Error("No token found");
  }

  const decodedToken = jwt.verify(
    token,
    process.env.JWT_SECRET!
  ) as DecodedToken;

  if (!decodedToken || !decodedToken.id) {
    throw new Error("Invalid token");
  }

  return new mongoose.Types.ObjectId(decodedToken.id);
};
