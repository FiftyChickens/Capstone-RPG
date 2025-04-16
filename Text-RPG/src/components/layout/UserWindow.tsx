import React from "react";
import { IUser } from "@/interfaces/user.interface";

interface UserWindowProps {
  userInfo: IUser;
}

const UserWindow = ({ userInfo }: UserWindowProps) => {
  const userDamage = Math.floor(
    100 * (userInfo.stats.level / 90) + userInfo.stats.damage
  );

  return (
    <div className="flex flex-col items-center p-4 border-2 border-[#754e1a] rounded-lg ">
      <h2 className="text-2xl font-bold">{userInfo.username}</h2>

      <div className="flex space-x-4 text-center">
        <p>Level: {userInfo.stats.level}</p>
        <p>
          XP: {userInfo.stats.XP}/{100 * (userInfo.stats.level / 10) + 90}
        </p>
      </div>

      <p>
        Health: {userInfo.stats.health}/{userInfo.stats.maxHealth}
      </p>

      <p>
        Damage: {userDamage - 1}-{userDamage + 3}
      </p>

      <p className=" font-bold">Gold: {userInfo.stats.gold}</p>
    </div>
  );
};

export default UserWindow;
