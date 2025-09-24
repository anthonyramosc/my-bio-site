import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ text }: { text: string }) {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("../");
  };

  return (
    <button
      onClick={handleBackClick}
      className="flex items-center cursor-pointer text-gray-800 hover:text-white transition-colors group"
    >
      <ChevronLeft className="w-5 h-5 mr-1 group-hover:text-white" />
      <h1 className="text-md font-bold text-gray-800 uppercase tracking-wide text-start group-hover:text-white">
        {text}
      </h1>
    </button>
  );
}
