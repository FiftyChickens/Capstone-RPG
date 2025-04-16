import { IEnemy } from "@/interfaces/enemy.interface";
import { ObjectId } from "mongoose";

export const selectEnemyBasedOnChance = (
  possibleEncounters: { enemyId: ObjectId; chance: number }[],
  enemies: IEnemy[]
): IEnemy | null => {
  const totalChance = possibleEncounters.reduce(
    (sum, encouter) => sum + encouter.chance,
    0
  );

  const randomValue = Math.random() * totalChance;

  let cumulativeChance = 0;
  for (let i = 0; i < possibleEncounters.length; i++) {
    cumulativeChance += possibleEncounters[i].chance;
    if (randomValue <= cumulativeChance) {
      const selectedEnemy = enemies.find(
        (enemy) =>
          enemy._id.toString() === possibleEncounters[i].enemyId.toString()
      );
      return selectedEnemy || null;
    }
  }
  return null;
};
