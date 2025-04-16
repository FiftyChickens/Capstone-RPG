import { IDrop, IEnemy } from "@/interfaces/enemy.interface";
import mongoose, { Schema, model } from "mongoose";

const DropSchema = new Schema<IDrop>({
  itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
  quantity: { type: Number, required: true },
});

const EnemySchema = new Schema<IEnemy>({
  name: { type: String, required: true, unique: true },
  level: { type: Number, required: true },
  health: { type: Number, required: true },
  damage: { type: Number, required: true },
  drop: { type: [DropSchema], required: true },
});

export const EnemyModel =
  mongoose.models.Enemy || model<IEnemy>("Enemy", EnemySchema);
