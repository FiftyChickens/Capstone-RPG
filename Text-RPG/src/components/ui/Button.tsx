import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/features/store";

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  addedClass?: string;
}

export default function Button({
  onClick,
  children,
  disabled,
  addedClass,
}: ButtonProps) {
  const isDisabled = useSelector((state: RootState) => state.button.isDisabled);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleClick = () => {
    if (isDisabled || isButtonDisabled) return;
    onClick();

    setIsButtonDisabled(true);
    setTimeout(() => {
      setIsButtonDisabled(false);
    }, 500);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isButtonDisabled}
      className={`text-black flex p-2 border border-black rounded-lg mb-4 focus:outline-none focus:border-gray-600 ${
        disabled || isButtonDisabled
          ? "bg-[#78877d] cursor-not-allowed"
          : "bg-[#B6CBBD] hover:bg-[#9ab0a6] hover:shadow-md"
      } ${addedClass}`}
    >
      {children}
    </button>
  );
}
