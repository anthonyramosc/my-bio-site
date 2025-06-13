import React from 'react';
import { Share } from 'lucide-react';

const UrlDisplay = () => {
    const bioSiteUrl = "bio.site/alexxcalle";

    return (
        <div className="flex justify-between items-center mb-4 p-4">
            <div className="text-white text-xl font-bold">My Site</div>
            <div className="flex items-center">
                <span className="text-gray-400 mr-2">URL:</span>
                <span className="text-white">{bioSiteUrl}</span>
                <button className="ml-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white font-medium py-2 px-4 rounded transition duration-200 flex items-center">
                    <Share size={16} className="mr-2" />
                    SHARE
                </button>
            </div>
        </div>
    );
};

export default UrlDisplay;
