import { GripVertical, Edit2, X } from "lucide-react";
import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";

interface LinkCardProps {
    id: string;
    title: string;
    url: string;
    image: string;
    onEdit: () => void;
    onRemove: () => void;
    isSubmitting: boolean;
    dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
    getSafeImageUrl: (imageUrl: string) => string;
}

const LinkCard = ({
                      title,
                      url,
                      image,
                      onEdit,
                      onRemove,
                      isSubmitting,
                      dragHandleProps,
                      getSafeImageUrl,
                  }: LinkCardProps) => {
    return (
        <div className="flex items-center justify-between p-3 bg-[#FAFFF6] rounded-lg border border-gray-200  transition-colors hover:bg-[#F0F9E8]">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div {...dragHandleProps} className="text-gray-400 flex-shrink-0 cursor-grab">
                    <GripVertical size={16} />
                </div>

                <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                    <img
                        src={getSafeImageUrl(image)}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-black block truncate">{title}</span>
                    <p className="text-xs text-gray-400 truncate max-w-48">{url}</p>
                </div>
            </div>

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
        </div>
    );
};

export default LinkCard;