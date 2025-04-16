import { IItem } from "@/interfaces/items.interface";
import mongoose, { model, Schema } from "mongoose";

const ItemSchema = new Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  value: { type: Number, required: true },
  effect: { type: String, required: true },
});

// Create and export the Item model
const ItemModel = mongoose.models.Item || model<IItem>("Item", ItemSchema);
export default ItemModel;
