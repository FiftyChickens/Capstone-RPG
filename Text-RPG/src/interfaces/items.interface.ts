export interface IItem {
  _id: string;
  quantity: number;
  slot: number;
  itemId: IItemId;
}

export interface IItemId {
  _id: string;
  name: string;
  effect: string;
  type: string;
  value: number;
}
