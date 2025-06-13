import {ChevronRight, Share} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Social = () => {
    const navigate = useNavigate();

    const handleSocialClick = () => {
        navigate('/social');
    };

    return (
        <div
            className="bg-[#2a2a2a] rounded-lg p-4 mb-4 flex items-center justify-between cursor-pointer hover:bg-[#323232] transition-colors"
            onClick={handleSocialClick}
        >
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Share size={16} className="text-white" />
                </div>
                <span className="text-white font-medium">Social</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-white bg-[#404040] px-2 py-1 rounded text-sm">5</span>
                <ChevronRight size={16} className="text-gray-400" />
            </div>
        </div>
    );
}

export default Social;