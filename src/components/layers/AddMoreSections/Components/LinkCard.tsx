import { Edit2, Shield, X } from "lucide-react";
import type { Link, UpdateLinkDto } from "../../../../interfaces/Links";
import { useState } from "react";
import { useFetchLinks } from "../../../../hooks/useFetchLinks";

export default function LinkCard({ link }: { link?: Link }) {
  const { updateLink, loading, error, deleteLink } = useFetchLinks();

  const [editLink, setEditLink] = useState(link);

  const onSave = async () => {
    try {
      const updateData: UpdateLinkDto = {
        label: editLink.label,
        url: editLink.url,
        description: editLink.description,
        image: editLink.image, // Fix: use editLink.image instead of undefined
        orderIndex: editLink.orderIndex,
        isActive: editLink.isActive,
      };

      const result = await updateLink(editLink.id, updateData);
      if (result) {
        // Update the editLink state with the result to ensure sync
        setEditLink(result);
      } else {
      }
    } catch (error: any) {
      console.error("Error updating editLink:", error);
    }
  };

  const onRemove = async () => {
    deleteLink(link.id);
  };

  return (
    <>
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
          <img
            src={link.image}
            alt={link.image}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-black block truncate">
              {link.label}
            </span>
            {link.isSelected && (
              <Shield size={14} className="text-blue-600 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-400 truncate max-w-48">{link.url}</p>
          {link.isSelected && (
            <p className="text-xs text-blue-600 mt-1">
              Enlace asignado por administrador - No editable
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0">
        <button
          onClick={onSave}
          className="text-gray-400 cursor-pointer hover:text-blue-400 transition-colors p-1"
          disabled={loading}
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRemove}
          disabled={loading}
          className="text-gray-400 cursor-pointer hover:text-red-400 transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}
