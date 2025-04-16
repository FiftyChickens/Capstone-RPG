import { ObjectId } from "mongoose";
import { IItemId } from "./items.interface";

export interface IObjective {
  _id: ObjectId;
  type: string;
  target: ObjectId;
  quantity?: number;
  threshold?: number;
  destination?: string;
  times?: number;
  options?: string[];
}

interface IRewards {
  _id: ObjectId;
  XP: number;
  gold: number;
  items: IItemId[];
}

export interface IQuest {
  _id: ObjectId;
  name: string;
  description: string;
  objectives: IObjective;
  rewards: IRewards;
}
