import {  Edit2, X, Shield } from "lucide-react";

interface AdminLinkCardProps {
    id: string;
    title: string;
    url: string;
    image: string;
    onEdit: () => void;
    onRemove: () => void;
    isSubmitting: boolean;
    getSafeImageUrl: (imageUrl: string) => string;
    isSelected?: boolean;
    showAdminControls: boolean;
}

const AdminLinkCard = ({
                           title,
                           url,
                           image,
                           onEdit,
                           onRemove,
                           isSubmitting,
                           getSafeImageUrl,
                           isSelected = false,
                           showAdminControls,
                       }: AdminLinkCardProps) => {
    return (
        <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
            isSelected
                ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                : 'bg-[#FAFFF6] border-gray-200 hover:bg-[#F0F9E8]'
        }`}>
            <div className="flex items-center space-x-3 flex-1 min-w-0">

                <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                    <img
                        src={getSafeImageUrl(image)}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-black block truncate">{title}</span>
                        {isSelected && (
                            <Shield size={14} className="text-blue-600 flex-shrink-0" />
                        )}
                    </div>
                    <p className="text-xs text-gray-400 truncate max-w-48">{url}</p>
                    {isSelected && (
                        <p className="text-xs text-blue-600 mt-1">
                            Enlace asignado por administrador - No editable
                        </p>
                    )}
                </div>
            </div>

            {showAdminControls && (
                <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                        onClick={onEdit}
                        className="text-gray-400 cursor-pointer hover:text-blue-400 transition-colors p-1"
                        disabled={isSubmitting}
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onRemove}
                        disabled={isSubmitting}
                        className="text-gray-400 cursor-pointer hover:text-red-400 transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminLinkCard;