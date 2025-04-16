import { ILocation } from "@/interfaces/location.interface";
import mongoose, { model, Schema } from "mongoose";

const ActionSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  actionType: { type: String, required: true },
  items: [
    {
      itemId: { type: Schema.Types.ObjectId, required: false },
    },
  ],
  destination: { type: String, required: false },
  quest: { type: String, required: false },
  possibleEncounters: [
    {
      enemyId: { type: Schema.Types.ObjectId, required: false },
      chance: { type: Number, required: false },
    },
  ],
  condition: {
    level: { type: Number, required: false },
    items: [{ type: Schema.Types.ObjectId, required: false }],
  },
});

const LocationSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  actions: { type: [ActionSchema], required: true },
});

const LocationModel =
  mongoose.models.Location || model<ILocation>("Location", LocationSchema);
export default LocationModel;
