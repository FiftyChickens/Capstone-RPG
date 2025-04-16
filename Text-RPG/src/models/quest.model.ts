import { IQuest } from "@/interfaces/quest.interface";
import mongoose, { model, Schema } from "mongoose";

const ObjectiveSchema = new Schema({
  type: { type: String, required: true },
  target: { type: Schema.Types.Mixed, required: true }, // Can be string or ObjectId
  quantity: { type: Number, required: false },
  threshold: { type: Number, required: false },
  destination: { type: String, required: false },
  times: { type: Number, required: false },
  options: { type: [String], required: false },
});

const RewardsSchema = new Schema({
  XP: { type: Number, required: true },
  gold: { type: Number, required: true },
  items: [{ type: Schema.Types.ObjectId, required: true }],
});

const QuestSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  objectives: { type: ObjectiveSchema, ref: "Objective", required: true },
  rewards: { type: RewardsSchema, required: true },
  nextQuest: { type: String, required: false },
});

const QuestModel = mongoose.models.Quest || model<IQuest>("Quest", QuestSchema);
export default QuestModel;
