import { IMerchant } from "@/interfaces/merchant.interface";
import mongoose, { model, Schema } from "mongoose";

const ItemForSaleSchema = new Schema({
  itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true }, // Ensure reference to Item model
  price: { type: Number, required: true },
});

const MerchantSchema = new Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  itemsForSale: { type: [ItemForSaleSchema], required: true },
});

const MerchantModel =
  mongoose.models.Merchant || model<IMerchant>("Merchant", MerchantSchema);

export default MerchantModel;
