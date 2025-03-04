import React from "react";

export const Card = ({ children, className }) => {
  return (
    <div className="flex justify-center items-center">
      <div className={`bg-white p-6 rounded-lg shadow-md w-[32rem] mx-auto ${className}`}>
        {children}
      </div>
    </div>
  );
};
