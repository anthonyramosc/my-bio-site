import { useState, useEffect } from "react";
import type { BiositeLink } from "../../interfaces/Biosite";
import Loading from "../../components/shared/Loading";

interface VideoEmbedProps {
  link: BiositeLink;
  onClick: () => void;
}

export default function VideoEmbed({ link, onClick }: VideoEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [embedUrl, setEmbedUrl] = useState<string>("");

  const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    return null;
  };

  useEffect(() => {
    if (link.url) {
      const embed = getYouTubeEmbedUrl(link.url);
      if (embed) {
        setEmbedUrl(embed);
      }
    }
  }, [link.url]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleOnClick = () => {
    if (onClick) {
      onClick();
    }
  };
  return (
    <div
      onClick={handleOnClick}
      className="rounded-lg shadow-lg transition-all flex items-center duration-200 hover:shadow-md cursor-pointer "
    >
      {/* Contenedor del embed */}
      <div className="relative w-full rounded-lg overflow-hidden shadow-lg">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <Loading />
          </div>
        )}

        <iframe
          src={embedUrl}
          width="100%"
          height="200"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          onLoad={handleIframeLoad}
          className="rounded-lg"
          style={{
            opacity: isLoading ? 0 : 1,
            transition: "opacity 0.3s ease-in-out",
            pointerEvents: onClick ? "none" : "auto",
          }}
        />
      </div>
    </div>
  );
}
