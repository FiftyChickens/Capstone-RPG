"use client";

import React from "react";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Add at least one custom prop to make the interface meaningful
  variant?: "default" | "outlined";
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseClasses =
      "text-black p-2 border rounded-lg mb-4 focus:outline-none";
    const variantClasses =
      variant === "outlined"
        ? "border-gray-300 focus:border-gray-600"
        : "border-transparent shadow-sm";

    return (
      <input
        {...props}
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${className}`}
      />
    );
  }
);

CustomInput.displayName = "CustomInput";

export default CustomInput;
