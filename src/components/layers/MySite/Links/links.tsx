import { ChevronDown, ChevronRight, Link } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBiositeContext } from "../../../../context/BiositeContext";
import { useState } from "react";
import LinksEditor from './LinksEditor';

const Links = () => {
    const { links } = useBiositeContext();
    const navigate = useNavigate();
    const [showEditor, setShowEditor] = useState(false);

    const handleLinksClick = () => {
        // Toggle the links editor instead of navigating
        setShowEditor(!showEditor);
    };

    return (
        <>
            <div
                className="bg-[#2a2a2a] rounded-lg p-4 mb-4 flex items-center justify-between cursor-pointer hover:bg-[#323232] transition-colors"
                onClick={handleLinksClick}
            >
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Link size={16} className="text-white" />
                    </div>
                    <span className="text-white font-medium">Links</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-white bg-[#404040] px-2 py-1 rounded text-sm">{links.length}</span>
                    {showEditor ? (
                        <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                        <ChevronRight size={16} className="text-gray-400" />
                    )}
                </div>
            </div>
            
            {/* Embedded Links Editor */}
            {showEditor && <LinksEditor />}
        </>
    );
}

export default Links;
