import { ObjectId } from "mongoose";
import { IItemId } from "./items.interface";

export interface IItemForSale {
  _id: string;
  itemId: IItemId;
  price: number;
}

export interface IMerchant {
  _id: ObjectId;
  name: string;
  location: string;
  itemsForSale: IItemForSale[];
}
