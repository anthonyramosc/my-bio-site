import {ChevronRight} from "lucide-react";
import {useNavigate} from "react-router-dom";


const Post =() =>{
    const navigate = useNavigate();

    const handleSocialClick = () => {
        navigate('/post');
    };
    return (
        <div
            onClick={handleSocialClick}
            className="bg-[#FAFFF6] rounded-lg p-4  flex items-center justify-between cursor-pointer  transition-colors">
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
                    <svg width="25" height="25" viewBox="0 0 134 119" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.3333 99.1667V19.8333H111.667V99.1667H22.3333ZM101.784 82.5761H32.2158V91.5407H101.784V82.5761ZM32.2158 78.1879H101.784V69.2282H32.2158V78.1879ZM32.2158 63.6947H101.784V28.6096H32.2158V63.6997V63.6947ZM32.2158 63.6947V28.6096V63.6997V63.6947Z" fill="white"/>
                    </svg>

                </div>
                <div>
                    <div className="text-black font-medium">Social Post</div>
                </div>
            </div>
            <ChevronRight size={16} className="text-black"/>
        </div>
    );
}

export default Post;
