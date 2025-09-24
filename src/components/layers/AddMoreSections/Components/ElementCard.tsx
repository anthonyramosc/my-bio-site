import { Edit2, X } from "lucide-react";
import type {LucideIcon} from "lucide-react";
import React from "react";

interface ElementCardProps {
    icon?: LucideIcon | string ;
    image?: string;
    title: string;
    subtitle: string;
    onEdit: () => void;
    onRemove: () => void;
    isSubmitting: boolean;
    isDeleting: boolean;
    iconBgColor?: string;
}

const ElementCard = ({
                         icon,
                         image,
                         title,
                         subtitle,
                         onEdit,
                         onRemove,
                         isSubmitting,
                         isDeleting,
                         iconBgColor = "bg-gray-100",
                     }: ElementCardProps) => {
    return (
        <div className="flex items-center justify-between p-3 bg-[#FAFFF6] rounded-lg border border-gray-200 hover:bg-[#F0F9E8] transition-colors">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-md overflow-hidden flex-shrink-0 border border-gray-200 flex items-center justify-center ${iconBgColor}`}>
                    {image ? (
                        <img src={image} alt={title} className="w-full h-full object-cover" />
                    ) :typeof icon === "string"? (
                        <img
                            src={icon}
                            alt={title}
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    ) : icon? (
                        React.createElement(icon, {
                            size: 16,
                            color: 'gray',
                            className: "transition-colors duration-200 text-gray",
                        })
                    ): null}
                </div>

                <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-black block truncate">
            {title}
          </span>
                    <p className="text-xs text-gray-400 truncate max-w-48">
                        {subtitle}
                    </p>
                </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                    onClick={onEdit}
                    className="text-gray-400 cursor-pointer hover:text-blue-400 transition-colors p-1"
                    disabled={isSubmitting || isDeleting}
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={onRemove}
                    disabled={isSubmitting || isDeleting}
                    className="text-gray-400 cursor-pointer hover:text-red-400 transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isDeleting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    ) : (
                        <X className="w-4 h-4" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default ElementCard;