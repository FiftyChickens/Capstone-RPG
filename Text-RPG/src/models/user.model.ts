import mongoose, { Schema, model, Types } from "mongoose";
import { IUser } from "../interfaces/user.interface";

const StatsSchema = new Schema({
  level: { type: Number, default: 1 },
  XP: { type: Number, default: 0 },
  health: { type: Number, default: 100 },
  maxHealth: { type: Number, default: 100 },
  damage: { type: Number, default: 1 },
  gold: { type: Number, default: 0 },
  location: {
    type: Schema.Types.ObjectId,
    ref: "Location",
    required: true,
    default: new Types.ObjectId("67ae4e221f7be1d2e20f48ef"),
  },
  totalPlaytime: { type: Number, default: 0 },
});

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verifyToken: { type: String },
  verifyTokenExpiry: { type: Date },
  forgotPasswordToken: { type: String },
  forgotPasswordTokenExpiry: { type: Date },
  stats: StatsSchema,
  inventory: [
    {
      itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
      quantity: { type: Number, required: true },
      slot: { type: Number, required: true },
    },
  ],
  activeQuests: [
    {
      questId: { type: mongoose.Schema.Types.ObjectId, ref: "Quest" },
      progress: { type: Number },
    },
  ],
  completedQuests: [{ type: Schema.Types.ObjectId, ref: "Quest" }],
  completedActions: [{ type: Schema.Types.ObjectId, ref: "Action" }],
});

export const UserModel =
  mongoose.models.User || model<IUser>("User", UserSchema);
