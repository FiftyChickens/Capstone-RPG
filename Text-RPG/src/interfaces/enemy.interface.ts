import { ObjectId } from "mongoose";
import { IItemId } from "./items.interface";

export interface IDrop {
  itemId: IItemId;
  quantity: number;
}

export interface IEnemy {
  _id: ObjectId;
  name: string;
  level: number;
  health: number;
  damage: number;
  drop: IDrop[];
}
