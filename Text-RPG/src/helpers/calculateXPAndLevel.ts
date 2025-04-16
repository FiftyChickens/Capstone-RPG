export default function calculateXPAndLevel(
  currentXP: number,
  currentLevel: number,
  increaseXP: number
) {
  let newXP = currentXP + increaseXP;
  let newLevel = currentLevel;

  let xpThreshold = 100 * (newLevel / 10) + 90;

  while (newXP >= xpThreshold) {
    newXP -= xpThreshold;
    newLevel++;
    xpThreshold = 100 * (newLevel / 10) + 90;
  }

  return {
    newXP,
    newLevel,
  };
}
