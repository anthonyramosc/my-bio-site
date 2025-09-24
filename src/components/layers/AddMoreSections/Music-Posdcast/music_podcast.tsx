import {
    ChevronRight,
    Music,
} from 'lucide-react';
import {useNavigate} from "react-router-dom";

const Musics =() =>{
    const navigate = useNavigate();

    const handleSocialClick = () => {
        navigate('/music');
    };
    return (
        <div
            onClick={handleSocialClick}
            className="bg-[#FAFFF6] rounded-lg p-4  flex items-center justify-between cursor-pointer  transition-colors">
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Music size={16} className="text-white" />
                </div>
                <div>
                    <div className="text-black font-medium">Music / Podcast</div>
                </div>
            </div>
            <ChevronRight size={16} className="text-black"/>
        </div>
    );
}

export default Musics;
