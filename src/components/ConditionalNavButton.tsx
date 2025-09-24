import { ChevronRight } from "lucide-react";
import React from "react";
import biositeLogo from "../assets/icons/visitaecuador_com.svg";

interface ConditionalNavButtonProps {
  themeConfig: {
    colors: {
      background: string;
      text: string;
      accent?: string;
    };
    fonts: {
      primary: string;
    };
  };
}

const ConditionalNavButton: React.FC<ConditionalNavButtonProps> = ({
  themeConfig,
}) => {
  const handleClick = () => {
    window.location.href = "https://visitaecuador.com/vesite";
  };

  return (
    <div className="px-3  rounded-xl sm:px-4">
      <button
        onClick={handleClick}
        className="w-full gap-x-5 flex items-center cursor-pointer justify-center  py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
        style={{
          backgroundColor: "transparent",
          color: themeConfig.colors.text,
          fontFamily: themeConfig.fonts.primary,
        }}
      >
        <img src={biositeLogo} />
        <span className="font-medium text-md sm:text-md">
          {"Actualizar mis datos"}
        </span>
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default ConditionalNavButton;
