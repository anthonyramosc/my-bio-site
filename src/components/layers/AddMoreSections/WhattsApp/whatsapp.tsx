import { useNavigate } from 'react-router-dom';
import { ChevronRight } from "lucide-react";
import {WhatsAppOutlined} from "@ant-design/icons";
import {usePreview} from "../../../../context/PreviewContext.tsx";

const WhatsApp = () => {
    const navigate = useNavigate();
    const {whatsAppLinks} = usePreview()

    const handleClick = () => {
        navigate('/whatsApp');
    };

    const getActiveApiWhatsAppLinks = () => {
        return whatsAppLinks.filter(link =>
            link.isActive &&
            link.phone &&
            link.message &&
            link.phone.trim() !== '' &&
            link.message.trim() !== ''
        );
    };

    const activeApiLinks = getActiveApiWhatsAppLinks();

    return (
        <>
            <div
                onClick={handleClick}
                className="bg-[#FAFFF6] rounded-lg p-4  flex items-center justify-between cursor-pointer  transition-colors"
            >
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <WhatsAppOutlined size={16} className="text-white" style={{color:'white'}} />
                    </div>
                    <div>
                        <div className="text-black font-medium">Contactame</div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {activeApiLinks.length > 0 && (
                        <span className="text-sm text-black" style={{fontSize:"11px"}}>
                            {activeApiLinks.length}
                        </span>
                    )}
                    <ChevronRight size={16} className="text-black"/>
                </div>
            </div>
        </>
    );
}

export default WhatsApp;