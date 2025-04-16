import React from "react";
import Button from "./Button";

interface ItemBoxProps {
  name: string;
  effect: string;
  price?: number | "";
  handleClick: () => void;
  buttonText: string;
  quantity?: number;
}

const ItemBox = ({
  name,
  effect,
  price,
  handleClick,
  buttonText,
}: ItemBoxProps) => {
  return (
    <div className="bg-[#cba35c] text-black flex flex-col items-center p-2 border border-black rounded-lg flex-1 min-w-[200px]">
      <h1 className="font-semibold">{name}</h1>
      <h2>{effect}</h2>
      {price && <p className="text-center py-2">Price: {price}</p>}
      {buttonText !== "" && (
        <Button onClick={handleClick} addedClass="justify-center w-18">
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default ItemBox;
