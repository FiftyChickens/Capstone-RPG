import { ILocation } from "./location.interface";
import { IQuest } from "./quest.interface";
import { IItem } from "./items.interface";

export interface IStats {
  level: number;
  XP: number;
  health: number;
  maxHealth: number;
  damage: number;
  gold: number;
  location: ILocation;
  totalPlaytime?: number;
}

export interface IUser {
  save(): unknown;
  username: string;
  email?: string;
  password?: string;
  stats: IStats;
  activeQuests: IActiveQuest[];
  completedQuests: IQuest[];
  completedActions: string[];
  inventory: IItem[];
  isVerified?: boolean;
  forgotPasswordToken?: string;
  forgotPasswordTokenExpiry?: Date;
  verifyToken?: string;
  verifyTokenExpiry?: Date;
}

export interface IActiveQuest {
  questId: IQuest;
  progress: number;
}
