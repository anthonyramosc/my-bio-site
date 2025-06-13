import { ChevronDown, ChevronRight, Palette } from "lucide-react";
import { useBiositeContext } from "../../../../context/BiositeContext";
import StyleEditor from "./StyleEditor";

const Style = () => {
    const { showStyleEditor, setShowStyleEditor } = useBiositeContext();

    const handleStyleClick = () => {
        setShowStyleEditor(!showStyleEditor);
    };

    return (
        <>
            <div
                className="bg-[#2a2a2a] rounded-lg p-4 mb-4 flex items-center justify-between cursor-pointer hover:bg-[#323232] transition-colors"
                onClick={handleStyleClick}
            >
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Palette size={16} className="text-white" />
                    </div>
                    <span className="text-white font-medium">Style</span>
                </div>
                {showStyleEditor ? (
                    <ChevronDown size={16} className="text-gray-400" />
                ) : (
                    <ChevronRight size={16} className="text-gray-400" />
                )}
            </div>
            
            {showStyleEditor && <StyleEditor />}
        </>
    );
};

export default Style;
