import { ObjectId } from "mongoose";

export interface IAction {
  _id: string;
  actionType: string;
  items?: { itemId: ObjectId }[];
  destination?: string;
  quest?: string;
  possibleEncounters?: { enemyId: ObjectId; chance: number }[];
  condition?: { level: number; items: ObjectId[] };
}

export interface ILocation {
  _id: string;
  name: string;
  description: string;
  actions: IAction[];
}
