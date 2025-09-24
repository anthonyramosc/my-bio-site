import {ChevronRight} from "lucide-react";
import { useNavigate } from "react-router-dom";

const V_Card = () => {


    const navigate = useNavigate();

    const handleProfileClick = () => {
        navigate('/VCard');
    };

    return (
        <div
            className="bg-[#FAFFF6] rounded-lg p-4   flex items-center justify-between cursor-pointer transition-colors"
            onClick={handleProfileClick}
        >
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white border border-black rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><g fill="none" fillRule="evenodd"><path fill="currentColor" d="M13 14h1v1h-1v-1Zm1 1h1v1h-1v-1Zm0 1h1v1h-1v-1Zm2 0h1v1h-1v-1Zm0 1h1v1h-1v-1Zm-3-1h1v1h-1v-1Zm2 0h1v1h-1v-1Zm0 1h1v1h-1v-1Zm3-1h1v1h-1v-1Zm0-1h1v1h-1v-1Zm1-1h1v1h-1v-1Zm-2 2h1v1h-1v-1Zm0 1h1v1h-1v-1Zm-1 1h1v1h-1v-1Zm-1 0h1v1h-1v-1Zm2 0h1v1h-1v-1Zm1 0h1v1h-1v-1Zm-2 1h1v1h-1v-1Zm-2 0h1v1h-1v-1Zm1 0h1v1h-1v-1Zm-2 0h1v1h-1v-1Zm0 1h1v1h-1v-1Zm1 1h1v1h-1v-1Zm1 0h1v1h-1v-1Zm2 0h1v1h-1v-1Zm1 0h1v1h-1v-1Zm-1-2h1v1h-1v-1Zm1 0h1v1h-1v-1Zm1-1h1v1h-1v-1Zm0-1h1v1h-1v-1Zm0 3h1v1h-1v-1Zm0-1h1v1h-1v-1Zm1-1h1v1h-1v-1Zm0-1h1v1h-1v-1Zm1 3h1v1h-1v-1Zm0-2h1v1h-1v-1Zm0 1h1v1h-1v-1Zm-2-3h1v1h-1v-1Zm-6 1h1v1h-1v-1Zm-1 0h1v1h-1v-1Zm0 1h1v1h-1v-1Zm2 0h1v1h-1v-1Zm-3 0h1v1h-1v-1Zm2 0h1v1h-1v-1Zm-2 1h1v1h-1v-1Zm0 1h1v1h-1v-1Zm0-19h1v1h-1V1Zm1 1h1v1h-1V2Zm-1 2h1v1h-1V4Zm1 1h1v1h-1V5Zm-1 1h1v1h-1V6Zm1 0h1v1h-1V6Zm0 1h1v1h-1V7Zm0 1h1v1h-1V8Zm-1 1h1v1h-1V9Zm1 0h1v1h-1V9Zm-1 1h1v1h-1v-1ZM1 11h1v1H1v-1Zm1 1h1v1H2v-1Zm2-1h1v1H4v-1Zm0 1h1v1H4v-1Zm1-1h1v1H5v-1Zm1 1h1v1H6v-1Zm1-1h1v1H7v-1Zm1 1h1v1H8v-1Zm0-1h1v1H8v-1Zm1 0h1v1H9v-1Zm1 0h1v1h-1v-1Zm1 1h1v1h-1v-1Zm2 0h1v1h-1v-1Zm1-1h1v1h-1v-1Zm1 0h1v1h-1v-1Zm1 0h1v1h-1v-1Zm-1 2h1v1h-1v-1Zm-2 9h1v1h-1v-1Zm-1 0h1v1h-1v-1Zm0-9h1v1h-1v-1Zm-1 0h1v1h-1v-1Zm0 1h1v1h-1v-1Zm0 1h1v1h-1v-1Zm11-1h1v1h-1v-1Zm-1 1h1v1h-1v-1Zm1 2h1v1h-1v-1Zm-5-4h1v1h-1v-1Zm1-1h1v1h-1v-1Zm4 0h1v1h-1v-1Zm0 1h1v1h-1v-1Zm-1 0h1v1h-1v-1Zm1 8h1v1h-1v-1Zm-1 1h1v1h-1v-1Zm-2 0h1v1h-1v-1Zm3 0h1v1h-1v-1Z"/><path stroke="currentColor" strokeWidth="2" d="M15 2h7v7h-7V2ZM2 2h7v7H2V2Zm0 13h7v7H2v-7ZM18 5h1v1h-1V5ZM5 5h1v1H5V5Zm0 13h1v1H5v-1Z"/></g></svg>
                </div>
                <span className="text-black font-medium">VCard</span>
            </div>
            <ChevronRight size={16} className="text-black"/>
        </div>
    );
};

export default V_Card;
