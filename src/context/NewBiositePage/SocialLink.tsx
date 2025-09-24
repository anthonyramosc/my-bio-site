import type { BiositeLink } from "../../interfaces/Biosite";
import { socialMediaPlatforms } from "../../media/socialPlataforms";

interface SocialLinksProps {
  links: BiositeLink[];
  themeConfig: any;
  onTrack?: (id: string) => void;
}

const findPlatformForLink = (link: BiositeLink) => {
  return socialMediaPlatforms.find((platform) => {
    const linkLabelLower = link.label.toLowerCase();
    const platformNameLower = platform.name.toLowerCase();
    const platformIdLower = platform.id.toLowerCase();

    return (
      linkLabelLower === platformNameLower ||
      linkLabelLower.includes(platformIdLower) ||
      link.icon === platform.icon ||
      linkLabelLower.replace(/[^a-z0-9]/g, "") ===
        platformNameLower.replace(/[^a-z0-9]/g, "")
    );
  });
};

export default function SocialLinks({
  links,
  themeConfig,
  onTrack,
}: SocialLinksProps) {
  const isDarkTheme = () => {
    const backgroundColor = themeConfig.colors.background;

    if (backgroundColor.includes("gradient")) {
      return false;
    }

    const hex = backgroundColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance < 0.5;
  };

  const getIconClassName = () => {
    return isDarkTheme()
      ? "w-6 h-6 invert brightness-0 contrast-100"
      : "w-6 h-6";
  };

  return (
    <div className="flex justify-center items-center space-x-4 ">
      {links.map((link) => {
        const platform = findPlatformForLink(link);
        return (
          <div
            onClick={() => {
              onTrack(link.id);
              link.onClick();
            }}
          >
            <a
              key={link.orderIndex}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-[1.20] active:scale-[0.98]"
            >
              <img
                src={platform?.icon || link.icon}
                alt={link.label}
                className={getIconClassName()}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </a>
          </div>
        );
      })}
    </div>
  );
}
