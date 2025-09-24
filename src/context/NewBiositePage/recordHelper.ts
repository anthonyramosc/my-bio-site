import type { BiositeLink } from "../../interfaces/Biosite";
import type { Section } from "../../interfaces/sections";
import type { Section_type } from "./BiositeSection";
import type { SocialLink } from "../../interfaces/PreviewContext.ts";
import { socialMediaPlatforms } from "../../media/socialPlataforms.ts";
import { useNavigate } from "react-router-dom";

/**
 * Link type constants for categorizing links - Synchronized with useLinkProcessing
 */
export const LINK_TYPES = {
  SOCIAL: "social",
  REGULAR: "regular",
  APP: "app",
  WHATSAPP: "whatsapp",
  MUSIC: "music",
  VIDEO: "video",
  SOCIAL_POST: "social-post",
} as const;

/**
 * Link category constants for backward compatibility
 */
export const LINK_CATEGORIES = {
  MUSIC: "MUSIC",
  VIDEO: "VIDEO",
  SOCIAL_POST: "SOCIAL_POST",
} as const;

/**
 * Gets the order index for a section by its title
 */
export const getSectionOrderIndex = (
  sectionTitle: string,
  sections: Section[]
): number => {
  const section = sections.find((s) => s.titulo === sectionTitle);
  return section?.orderIndex || 999;
};

/**
 * Enhanced icon identifier detection - synchronized with useLinkProcessing
 */
const getIconIdentifier = (iconPath: string): string => {
  const iconMap: { [key: string]: string } = {
    "/assets/icons/instagram.svg": "instagram",
    "/assets/icons/tiktok.svg": "tiktok",
    "/assets/icons/X.svg": "twitter",
    "/assets/icons/facebook.svg": "facebook",
    "/assets/icons/twitch.svg": "twitch",
    "/assets/icons/linkdl.svg": "linkedin",
    "/assets/icons/snapchat.svg": "snapchat",
    "/assets/icons/threads.svg": "threads",
    "/assets/icons/gmail.svg": "email",
    "/assets/icons/pinterest.svg": "pinterest",
    "/assets/icons/spottufy.svg": "spotify",
    "/assets/icons/music.svg": "apple-music",
    "/assets/icons/discord.svg": "discord",
    "/assets/icons/tumblr.svg": "tumblr",
    "/assets/icons/whatsapp.svg": "whatsapp",
    "/assets/icons/telegram.svg": "telegram",
    "/assets/icons/amazon.svg": "amazon",
    "/assets/icons/onlyfans.svg": "onlyfans",
    "/assets/icons/appstore.svg": "appstore",
    "/assets/icons/googleplay.svg": "googleplay",
  };

  if (iconPath === "link") return "link";
  if (iconPath === "social-post") return "social-post";
  if (iconPath === "music-embed") return "music-embed";
  if (iconPath === "video-embed") return "video-embed";
  if (iconPath === "whatsapp") return "whatsapp";
  if (iconPath === "appstore") return "appstore";
  if (iconPath === "googleplay") return "googleplay";

  if (iconPath === "svg%3e" || iconPath.includes("%")) {
    return "link";
  }

  const fullPath = Object.keys(iconMap).find((path) => path.includes(iconPath));
  if (fullPath) return iconMap[fullPath];

  const fileName = iconPath.split("/").pop()?.replace(".svg", "") || "link";
  return fileName.toLowerCase();
};

/**
 * Enhanced link type detection - synchronized with useLinkProcessing
 */
const detectLinkType = (link: BiositeLink): string => {
  // First check if link_type is explicitly set
  if (link.link_type && link.link_type !== null) {
    return link.link_type;
  }

  const iconIdentifier = getIconIdentifier(link.icon || "");
  const labelLower = link.label?.toLowerCase() || "";
  const urlLower = link.url?.toLowerCase() || "";

  // WhatsApp detection
  if (iconIdentifier === "whatsapp" || urlLower.includes("api.whatsapp.com")) {
    return LINK_TYPES.WHATSAPP;
  }

  // App store detection
  if (
    iconIdentifier === "appstore" ||
    iconIdentifier === "googleplay" ||
    labelLower.includes("app store") ||
    labelLower.includes("google play") ||
    urlLower.includes("apps.apple.com") ||
    urlLower.includes("play.google.com")
  ) {
    return LINK_TYPES.APP;
  }

  // Music detection
  if (
    iconIdentifier === "music-embed" ||
    labelLower.includes("music") ||
    labelLower.includes("podcast") ||
    urlLower.includes("spotify.com/track/") ||
    urlLower.includes("open.spotify.com") ||
    urlLower.includes("music.apple.com") ||
    urlLower.includes("soundcloud.com") ||
    urlLower.includes("deezer.com") ||
    urlLower.includes("tidal.com")
  ) {
    return LINK_TYPES.MUSIC;
  }

  // Video detection
  if (
    iconIdentifier === "video-embed" ||
    labelLower.includes("video") ||
    urlLower.includes("youtube.com/watch") ||
    urlLower.includes("youtu.be/") ||
    urlLower.includes("vimeo.com")
  ) {
    return LINK_TYPES.VIDEO;
  }

  if (
      iconIdentifier === "social-post" ||
      labelLower.includes("social post") ||
      labelLower.includes("post") ||
      labelLower.includes("publicacion") ||
      labelLower.includes("contenido") ||
      // Instagram posts and reels
      (urlLower.includes("instagram.com") &&
          (urlLower.includes("/p/") || urlLower.includes("/reel/"))) ||
      // TikTok videos - ADDED
      urlLower.includes("vm.tiktok.com") ||
      urlLower.includes("tiktok.com/t/") ||
      (urlLower.includes("tiktok.com") && urlLower.includes("/video/")) ||
      urlLower.includes("tiktok.com/@") ||
      // General TikTok video patterns
      (urlLower.includes("tiktok.com") && !urlLower.match(/tiktok\.com\/?$/))
  ) {
    return LINK_TYPES.SOCIAL_POST;
  }

  // Social media detection
  const socialPlatforms = [
    "instagram",
    "tiktok",
    "x",
    "twitter",
    "facebook",
    "twitch",
    "linkedin",
    "snapchat",
    "threads",
    "pinterest",
    "discord",
    "tumblr",
    "telegram",
    "onlyfans",
    "amazon",
    "gmail",
    "spotify",
    "youtube",
  ];

  const isSocialIcon = socialPlatforms.includes(iconIdentifier);
  const isSocialDomain = socialPlatforms.some(
    (platform) =>
      urlLower.includes(`${platform}.com`) ||
      urlLower.includes(`${platform}.net`) ||
      urlLower.includes(`${platform}.tv`)
  );
  const isSocialLabel = socialPlatforms.some(
    (platform) => labelLower === platform || labelLower.includes(platform)
  );

  if (isSocialIcon || isSocialDomain || isSocialLabel) {
    // Special case for YouTube channels vs videos
    if (
      urlLower.includes("youtube.com/@") ||
      (urlLower.includes("youtube.com") && !urlLower.includes("/watch"))
    ) {
      return LINK_TYPES.SOCIAL;
    }
    if (urlLower.includes("tiktok.com")) {
      // If it's already detected as social post above, don't override
      if (
          urlLower.includes("vm.tiktok.com") ||
          urlLower.includes("tiktok.com/t/") ||
          urlLower.includes("/video/") ||
          (!urlLower.match(/tiktok\.com\/?$/) && !urlLower.includes("/@"))
      ) {
        return LINK_TYPES.SOCIAL_POST;
      }
    }
    return LINK_TYPES.SOCIAL;
  }

  return LINK_TYPES.REGULAR;
};

/**
 * Enhanced helper functions using improved detection logic
 */
const isSocialLink = (link: BiositeLink): boolean => {
  return detectLinkType(link) === LINK_TYPES.SOCIAL;
};

const isRegularLink = (link: BiositeLink): boolean => {
  const linkType = detectLinkType(link);
  return linkType === LINK_TYPES.REGULAR;
};

const isWhatsAppLink = (link: BiositeLink): boolean => {
  return detectLinkType(link) === LINK_TYPES.WHATSAPP;
};

const isMusicLink = (link: BiositeLink): boolean => {
  return detectLinkType(link) === LINK_TYPES.MUSIC;
};

const isVideoLink = (link: BiositeLink): boolean => {
  return detectLinkType(link) === LINK_TYPES.VIDEO;
};

const isSocialPostLink = (link: BiositeLink): boolean => {
  return detectLinkType(link) === LINK_TYPES.SOCIAL_POST;
};

const isAppLink = (link: BiositeLink): boolean => {
  return detectLinkType(link) === LINK_TYPES.APP;
};

/**
 * Finds music-related links using enhanced detection
 */
export const getMusicLinks = (
  links: BiositeLink[],
  LINK_TYPES_PARAM?: any
): BiositeLink[] => {
  if (!links || !Array.isArray(links)) return [];

  return links.filter((link) => link.isActive && isMusicLink(link));
};

/**
 * Finds social post links using enhanced detection
 */
export const getSocialPostLinks = (
  links: BiositeLink[],
  LINK_TYPES_PARAM?: any
): BiositeLink[] => {
  if (!links || !Array.isArray(links)) return [];

  return links.filter((link) => link.isActive && isSocialPostLink(link));
};

/**
 * Finds video-related links using enhanced detection
 */
export const getVideoLinks = (
  links: BiositeLink[],
  LINK_TYPES_PARAM?: any
): BiositeLink[] => {
  if (!links || !Array.isArray(links)) return [];

  return links.filter((link) => link.isActive && isVideoLink(link));
};

/**
 * Enhanced link validation - filters out links that shouldn't be treated as regular links
 */
const isValidRegularLink = (link: BiositeLink): boolean => {
  if (!link.isActive) return false;

  const labelLower = link.label?.toLowerCase() || "";
  const urlLower = link.url?.toLowerCase() || "";

  const excludedPatterns = [
    () => urlLower.includes("api.whatsapp.com"),

    () =>
      labelLower.includes("app store") ||
      labelLower.includes("appstore") ||
      urlLower.includes("apps.apple.com"),
    () =>
      labelLower.includes("google play") ||
      labelLower.includes("googleplay") ||
      urlLower.includes("play.google.com"),

    () =>
      labelLower.includes("music") ||
      labelLower.includes("soundcloud") ||
      urlLower.includes("open.spotify.com"),
    () =>
      urlLower.includes("music.apple.com") ||
      urlLower.includes("soundcloud.com"),
    () =>
      labelLower.includes("apple music") ||
      labelLower.includes("audio") ||
      labelLower.includes("music embed"),

    () => labelLower.includes("video") || labelLower.includes("vimeo"),
    () =>
      urlLower.includes("youtube.com/watch") ||
      urlLower.includes("youtu.be") ||
      urlLower.includes("vimeo.com"),
    () => labelLower.includes("tiktok video"),

    () =>
      labelLower.includes("post") ||
      labelLower.includes("publicacion") ||
      labelLower.includes("contenido"),
    () =>
      labelLower.includes("social post") ||
      urlLower.includes("instagram.com/p/"),
    () =>
      urlLower.includes("instagram.com") &&
      (urlLower.includes("/p/") || urlLower.includes("/reel/")),
  ];

  return !excludedPatterns.some((check) => check());
};

/**
 * Groups active links by section title with enhanced matching logic
 * Respects the order of sections passed as parameter
 */
export const groupLinksBySection = (
  links: BiositeLink[],
  sections: Section[]
): Map<string, BiositeLink[]> => {
  const grouped = new Map<string, BiositeLink[]>();

  // Initialize groups preserving the order from sections array
  sections.forEach((section) => {
    grouped.set(section.titulo, []);
  });

  // Group active links by matching section titles with strict priority matching
  links
    .filter((link) => link.isActive)
    .forEach((link) => {
      const linkType = detectLinkType(link);
      const sectionTitle = getSectionTitle(linkType as keyof typeof LINK_TYPES);

      if (sectionTitle && grouped.has(sectionTitle)) {
        grouped.get(sectionTitle)?.push(link);
      }
    });

  return grouped;
};

function getSectionTitle(linkType: string): string {
  switch (linkType) {
    case "social":
      return "Social";
    case "regular":
      return "Links";
    case "app":
      return "Link de mi App";
    case "whatsapp":
      return "Contactame";
    case "music":
      return "Music / Podcast";
    case "video":
      return "Video";
    case "social_post":
      return "Social Post";
    default:
      return "Links";
  }
}

export const findPlatformForLink = (link: SocialLink) => {
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

/**
 * Helper function to find the best section match for a link
 */
const findBestSectionMatch = (
  link: BiositeLink,
  linkType: string,
  sections: Section[]
): string | null => {
  const linkLabel = link.label?.toLowerCase() || "";

  // PRIORITY 1: Explicit link_type matching with strict rules
  if (link.link_type) {
    switch (link.link_type) {
      case "whatsapp":
        return (
          sections.find(
            (s) =>
              s.titulo.toLowerCase().includes("contactame") ||
              s.titulo.toLowerCase().includes("contacto") ||
              s.titulo.toLowerCase().includes("whatsapp")
          )?.titulo || null
        );

      case "social_post":
        return (
          sections.find(
            (s) =>
              s.titulo.toLowerCase().includes("Social Post") ||
              s.titulo.toLowerCase().includes("social_post") ||
              s.titulo === "Social Post"
          )?.titulo || null
        );

      case "music":
        return (
          sections.find(
            (s) =>
              s.titulo.toLowerCase().includes("music") ||
              s.titulo.toLowerCase().includes("música") ||
              s.titulo.toLowerCase().includes("podcast")
          )?.titulo || null
        );

      case "video":
        return (
          sections.find(
            (s) =>
              s.titulo.toLowerCase().includes("video") ||
              s.titulo.toLowerCase().includes("vídeo")
          )?.titulo || null
        );

      case "social":
        // Only match social section if it's NOT a WhatsApp link
        if (!isWhatsAppLink(link) && !isSocialPostLink(link)) {
          return (
            sections.find(
              (s) =>
                s.titulo.toLowerCase().includes("social") ||
                s.titulo.toLowerCase().includes("redes")
            )?.titulo || null
          );
        }
        break;

      case "regular":
        if (isValidRegularLink(link)) {
          return (
            sections.find(
              (s) =>
                s.titulo.toLowerCase().includes("links") ||
                s.titulo.toLowerCase().includes("enlaces")
            )?.titulo || null
          );
        }
        break;
    }
  }

  // PRIORITY 2: Direct label matching
  const exactMatch = sections.find((s) => s.titulo.toLowerCase() === linkLabel);
  if (exactMatch) return exactMatch.titulo;

  // PRIORITY 3: Type-based matching with strict hierarchy
  switch (linkType) {
    case LINK_TYPES.WHATSAPP:
      return (
        sections.find(
          (s) =>
            s.titulo.toLowerCase().includes("contactame") ||
            s.titulo.toLowerCase().includes("contacto") ||
            s.titulo.toLowerCase().includes("whatsapp")
        )?.titulo || null
      );

    case LINK_TYPES.SOCIAL_POST:
      return (
        sections.find((s) => s.titulo.toLowerCase().includes("Social Post"))
          ?.titulo || null
      );

    case LINK_TYPES.MUSIC:
      return (
        sections.find(
          (s) =>
            s.titulo.toLowerCase().includes("music") ||
            s.titulo.toLowerCase().includes("música") ||
            s.titulo.toLowerCase().includes("podcast")
        )?.titulo || null
      );

    case LINK_TYPES.VIDEO:
      return (
        sections.find(
          (s) =>
            s.titulo.toLowerCase().includes("video") ||
            s.titulo.toLowerCase().includes("vídeo")
        )?.titulo || null
      );

    case LINK_TYPES.SOCIAL:
      return (
        sections.find(
          (s) =>
            s.titulo.toLowerCase().includes("social") ||
            s.titulo.toLowerCase().includes("redes")
        )?.titulo || null
      );

    case LINK_TYPES.APP:
      return (
        sections.find(
          (s) =>
            s.titulo.toLowerCase().includes("app") ||
            s.titulo.toLowerCase().includes("aplicación") ||
            s.titulo.toLowerCase().includes("aplicacion")
        )?.titulo || null
      );

    case LINK_TYPES.REGULAR:
      if (isValidRegularLink(link)) {
        return (
          sections.find(
            (s) =>
              s.titulo.toLowerCase().includes("links") ||
              s.titulo.toLowerCase().includes("enlaces")
          )?.titulo || null
        );
      }
      break;
  }

  // PRIORITY 4: Partial matching fallback (only for regular links)
  if (linkType === LINK_TYPES.REGULAR && isValidRegularLink(link)) {
    const partialMatch = sections.find((s) => {
      const sectionTitle = s.titulo.toLowerCase();
      return (
        sectionTitle.includes(linkLabel) || linkLabel.includes(sectionTitle)
      );
    });

    if (partialMatch) return partialMatch.titulo;

    // Final fallback to Links section
    return (
      sections.find(
        (s) =>
          s.titulo.toLowerCase().includes("links") ||
          s.titulo.toLowerCase().includes("enlaces")
      )?.titulo || null
    );
  }

  return null;
};

/**
 * Enhanced section determination with improved link type detection
 */
const determineLinkSection = (
  link: BiositeLink,
  sectionsInfo: { titulo: string; orderIndex: number }[],
  LINK_TYPES_PARAM?: any
): { titulo: string; orderIndex: number } | null => {
  const linkLabel = link.label?.toLowerCase() || "";
  const linkType = detectLinkType(link);

  // Try exact match first
  let matchingSection = sectionsInfo.find(
    (s) => s.titulo.toLowerCase() === linkLabel
  );
  if (matchingSection) return matchingSection;

  // Enhanced type-based matching using improved detection
  switch (linkType) {
    case LINK_TYPES.MUSIC:
      matchingSection = sectionsInfo.find(
        (s) =>
          s.titulo.toLowerCase().includes("music") ||
          s.titulo.toLowerCase().includes("música") ||
          s.titulo.toLowerCase().includes("podcast")
      );
      break;

    case LINK_TYPES.VIDEO:
      matchingSection = sectionsInfo.find(
        (s) =>
          s.titulo.toLowerCase().includes("video") ||
          s.titulo.toLowerCase().includes("vídeo")
      );
      break;

    case LINK_TYPES.SOCIAL_POST:
      matchingSection = sectionsInfo.find(
        (s) =>
          s.titulo.toLowerCase().includes("social") ||
          s.titulo.toLowerCase().includes("post") ||
          s.titulo.toLowerCase().includes("publicacion")
      );
      break;

    case LINK_TYPES.SOCIAL:
      matchingSection = sectionsInfo.find(
        (s) =>
          s.titulo.toLowerCase().includes("social") ||
          s.titulo.toLowerCase().includes("redes")
      );
      break;

    case LINK_TYPES.WHATSAPP:
      matchingSection = sectionsInfo.find(
        (s) =>
          s.titulo.toLowerCase().includes("contactame") ||
          s.titulo.toLowerCase().includes("contacto") ||
          s.titulo.toLowerCase().includes("whatsapp")
      );
      break;

    case LINK_TYPES.APP:
      matchingSection = sectionsInfo.find(
        (s) =>
          s.titulo.toLowerCase().includes("app") ||
          s.titulo.toLowerCase().includes("aplicación") ||
          s.titulo.toLowerCase().includes("aplicacion")
      );
      break;

    case LINK_TYPES.REGULAR:
      // For regular links, only include if they pass validation
      if (isValidRegularLink(link)) {
        matchingSection = sectionsInfo.find(
          (s) =>
            s.titulo.toLowerCase().includes("links") ||
            s.titulo.toLowerCase().includes("enlaces")
        );
      }
      break;
  }

  if (matchingSection) return matchingSection;

  // Partial matching fallback
  matchingSection = sectionsInfo.find((s) => {
    const sectionTitle = s.titulo.toLowerCase();
    return sectionTitle.includes(linkLabel) || linkLabel.includes(sectionTitle);
  });
  if (matchingSection) return matchingSection;

  // Default to "Links" section if exists for valid regular links, otherwise return null
  if (linkType === LINK_TYPES.REGULAR && isValidRegularLink(link)) {
    return (
      sectionsInfo.find(
        (s) =>
          s.titulo.toLowerCase().includes("links") ||
          s.titulo.toLowerCase().includes("enlaces")
      ) || null
    );
  }

  return null;
};

/**
 * Enhanced getSectionsRecord function with intelligent section assignment and validation
 */
export function getSectionsRecord(
  links: BiositeLink[],
  sectionsInfo: { titulo: string; orderIndex: number }[],
  LINK_TYPES_PARAM?: any
) {
  // Group active and valid links by section title
  const grouped: Record<string, BiositeLink[]> = {};
  for (const section of sectionsInfo) {
    grouped[section.titulo] = [];
  }

  for (const link of links) {
    if (link.isActive) {
      const matchingSection = determineLinkSection(
        link,
        sectionsInfo,
        LINK_TYPES_PARAM
      );

      if (matchingSection) {
        grouped[matchingSection.titulo].push(link);
      }
    }
  }

  // Sort sections by orderIndex and remove duplicate titles
  const orderedSections = sectionsInfo
    .filter((v, i, a) => a.findIndex((t) => t.titulo === v.titulo) === i)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  // Build final record
  const sections: Record<string, BiositeLink[]> = {};
  for (const section of orderedSections) {
    sections[section.titulo] = grouped[section.titulo] || [];
  }
  return sections;
}

/**
 * Creates an ordered sections record with active links using Section interface
 * Enhanced with improved validation and filtering
 */
export const createOrderedSectionsRecord = (
  links: BiositeLink[],
  sections: Section[],
  isPreview: boolean = false,
  navigate: (route: string) => void
): Map<Section_type, BiositeLink[]> => {
  // Remove duplicates and sort by orderIndex
  const uniqueSections = sections
    .reduce((acc, current) => {
      const existing = acc.find((section) => section.titulo === current.titulo);
      if (!existing) {
        acc.push(current);
      } else {
        // Check if current has more recent update
        const currentDate =
          current.updatedAt || current.updatedAt || new Date(0);
        const existingDate =
          existing.updatedAt || existing.updatedAt || new Date(0);

        if (
          new Date(currentDate).getTime() > new Date(existingDate).getTime()
        ) {
          const index = acc.findIndex(
            (section) => section.titulo === current.titulo
          );
          acc[index] = current;
        }
      }
      return acc;
    }, [] as Section[])
    .sort((a, b) => a.orderIndex - b.orderIndex);

  // Group links by section with enhanced validation
  const grouped = groupLinksBySection(links, uniqueSections);

  // Create final ordered Map - PRESERVE THE ORDER from uniqueSections
  const orderedMap = new Map<Section_type, BiositeLink[]>();

  // Remove empty sections while preserving order
  uniqueSections.forEach((section) => {
    const sectionLinks = grouped.get(section.titulo) || [];

    // Keep sections with links or if it's a vCard/Profile section
    const isVCardSection =
      section.titulo.toLowerCase().includes("vcard") ||
      section.titulo.toLowerCase().includes("profile");

    if (sectionLinks.length > 0 || isVCardSection) {
      orderedMap.set(section.titulo as Section_type, sectionLinks);
    }
  });

  orderedMap.forEach((sectionLinks, sectionType) => {
    if (sectionType === "Link de mi App") {
      sectionLinks.forEach((link) => {
        link.tag = link.url;
      });
    }
  });

  if (isPreview) {
    return new Map(
      Array.from(orderedMap.entries()).map(([sectionType, sectionLinks]) => {
        const modifiedLinks = sectionLinks.map((link) => {
          switch (sectionType) {
            case "Links":
              return {
                ...link,
                url: undefined,
                id: undefined,
                onClick: () => navigate("/links"),
              };
            case "Social":
              return {
                ...link,
                url: undefined,
                id: undefined,
                onClick: () => navigate("/social"),
              };
            case "Social Post":
              return {
                ...link,
                id: undefined,
                onClick: () => navigate("/post"),
              };
            case "Contactame":
              return {
                ...link,
                url: undefined,
                id: undefined,
                onClick: () => navigate("/whatsApp"),
              };
            case "VCard":
              return {
                ...link,
                url: undefined,
                id: undefined,
                onClick: () => navigate("/VCard"),
              };
            case "Link de mi App":
              return {
                ...link,
                tag: link.url,
                url: undefined,
                id: undefined,
                onClick: () => navigate("/app"),
              };
            case "Music / Podcast":
              return {
                ...link,
                id: undefined,
                onClick: () => navigate("/music"),
              };
            case "Video":
              return {
                ...link,
                id: undefined,
                onClick: () => navigate("/videos"),
              };

            default:
              return {
                ...link,
                url: link.url.startsWith("/") ? link.url : `/${link.url}`,
              };
          }
        });

        return [sectionType, modifiedLinks];
      })
    );
  }

  return orderedMap;
};
