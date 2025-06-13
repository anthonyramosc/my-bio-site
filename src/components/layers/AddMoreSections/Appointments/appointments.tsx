import {Calendar} from "lucide-react";

const Appointments = () => {
    return (
        <div className="bg-[#2a2a2a] rounded-lg p-4 mb-4 flex items-center justify-between cursor-pointer hover:bg-[#323232] transition-colors">
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <Calendar size={16} className="text-white" />
                </div>
                <div>
                    <div className="text-white font-medium">1:1 Appointments</div>
                    <div className="text-gray-400 text-sm">Monetize your knowledge with paid appointments</div>
                </div>
            </div>
            <div className="flex items-center justify-center">
                <div className="bg-gray-800 text-xs text-white px-2 py-1 rounded">BETA</div>
                <div className="w-6 h-6 border border-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-green-600 hover:border-green-600 transition-colors ml-2">
                    <span className="text-white text-sm">+</span>
                </div>
            </div>
        </div>
    );
}

export default Appointments;
