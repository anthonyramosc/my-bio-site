import React from "react";
import type { LucideIcon } from "lucide-react";

export default function Cardbase({
  themeConfig,
  title,
  id,
  icon,
  image,
  url,
  onClick,
  onTrack,
  children,
}: {
  themeConfig: any;
  title?: string;
  id?: string;
  icon?: string | LucideIcon;
  image?: string;
  url?: string;
  onClick?: () => void;
  onTrack?: (id: string) => void;
  children?: any;
}) {
  const commonClasses =
    "w-full p-1 h-[55px] rounded-lg shadow-lg transition-all flex items-center duration-200 hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]";
  const commonStyles = {
    backgroundColor: themeConfig.colors.accent,
    background: themeConfig.colors.accent,
  };

  const cardContent = (
    <>
      {image && (
        <div className="flex-shrink-0 w-12 h-12 mr-3 rounded-lg overflow-hidden bg-white flex items-center justify-center">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Título al centro */}
      <div className="flex-1 text-left">
        <span
          className="text-sm font-semibold line-clamp-2"
          style={{
            color: themeConfig.colors.text,
            fontFamily:
              themeConfig.fonts.secondary || themeConfig.fonts.primary,
          }}
        >
          {title}
        </span>
      </div>

      {/* Icono a la derecha */}
      {icon && (
        <div className="flex-shrink-0 w-12 h-12 ml-3 flex items-center justify-center">
          {typeof icon === "string" ? (
            <img
              src={icon}
              alt={title}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            React.createElement(icon, {
              size: 24,
              color: themeConfig.colors.text,
              className: "transition-colors duration-200",
            })
          )}
        </div>
      )}
    </>
  );

  // Si no hay ni URL ni onClick, renderizar como div simple
  return (
    <div
      onClick={() => {
        onClick?.();
        onTrack?.(id);
      }}
      className="p-0 m-0"
    >
      <a
        key={id}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={commonClasses}
        style={commonStyles}
      >
        {cardContent}
      </a>
    </div>
  );
}
