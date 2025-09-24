import type { BiositeLink } from "../interfaces/Biosite";
import type { Section } from "../interfaces/sections";

/**
 * Utility functions for organizing biosite links into sections
 */

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
 * Link type constants for categorizing links
 */
export const LINK_CATEGORIES = {
  MUSIC: "MUSIC",
  VIDEO: "VIDEO",
  SOCIAL_POST: "SOCIAL_POST",
} as const;

/**
 * Finds music-related links from biosite links
 */
export const getMusicLinks = (
  links: BiositeLink[],
  LINK_TYPES: any
): BiositeLink[] => {
  if (!links || !Array.isArray(links)) return [];

  // First try to find by link_type
  const musicByType = links.filter(
    (link) => link.link_type === LINK_TYPES.MUSIC && link.isActive
  );
  if (musicByType.length > 0) return musicByType;

  // Fallback to existing logic for backward compatibility
  const musicLinks = links.filter((link) => {
    const labelLower = link.label?.toLowerCase() || "";
    const urlLower = link.url?.toLowerCase() || "";

    return (
      link.isActive &&
      (labelLower.includes("music") ||
        labelLower.includes("spotify") ||
        urlLower.includes("spotify.com/track/") ||
        urlLower.includes("open.spotify.com"))
    );
  });

  return musicLinks;
};

/**
 * Finds social post links from biosite links
 */
export const getSocialPostLinks = (
  links: BiositeLink[],
  LINK_TYPES: any
): BiositeLink[] => {
  if (!links || !Array.isArray(links)) return [];

  // First try to find by link_type
  const socialPostByType = links.filter(
    (link) => link.link_type === LINK_TYPES.SOCIAL_POST && link.isActive
  );
  if (socialPostByType.length > 0) return socialPostByType;

  // Fallback to existing logic for backward compatibility
  const socialPostLinks = links.filter((link) => {
    const labelLower = link.label?.toLowerCase() || "";
    const urlLower = link.url?.toLowerCase() || "";

    return (
      link.isActive &&
      (labelLower.includes("post") ||
        labelLower.includes("instagram") ||
        urlLower.includes("instagram.com/p/") ||
        urlLower.includes("instagram.com/reel/"))
    );
  });

  return socialPostLinks;
};

/**
 * Finds video-related links from biosite links
 */
export const getVideoLinks = (
  links: BiositeLink[],
  LINK_TYPES: any
): BiositeLink[] => {
  if (!links || !Array.isArray(links)) return [];

  // First try to find by link_type
  const videoByType = links.filter(
    (link) => link.link_type === LINK_TYPES.VIDEO && link.isActive
  );
  if (videoByType.length > 0) return videoByType;

  // Fallback to existing logic for backward compatibility
  const videoLinks = links.filter((link) => {
    const labelLower = link.label?.toLowerCase() || "";
    const urlLower = link.url?.toLowerCase() || "";

    return (
      link.isActive &&
      (labelLower.includes("video") ||
        labelLower.includes("youtube") ||
        urlLower.includes("youtube.com/watch") ||
        urlLower.includes("youtu.be/"))
    );
  });

  return videoLinks;
};

/**
 * Groups active links by section title
 */
export const groupLinksBySection = (
  links: BiositeLink[],
  sections: Section[]
): Record<string, BiositeLink[]> => {
  const grouped: Record<string, BiositeLink[]> = {};

  // Initialize groups for all sections
  sections.forEach((section) => {
    grouped[section.titulo] = [];
  });

  // Group active links by matching section titles
  links
    .filter((link) => link.isActive)
    .forEach((link) => {
      // You can customize this logic based on how you want to match links to sections
      // For now, we'll try to match by label similarity or you can extend this
      const matchingSection = sections.find((section) => {
        const sectionTitle = section.titulo.toLowerCase();
        const linkLabel = link.label?.toLowerCase() || "";

        // Basic matching - you can enhance this logic
        return (
          sectionTitle.includes(linkLabel) ||
          linkLabel.includes(sectionTitle) ||
          (sectionTitle === "social" && isSocialLink(link)) ||
          (sectionTitle === "links" && isRegularLink(link)) ||
          (sectionTitle === "contactame" && isWhatsAppLink(link))
        );
      });

      if (matchingSection) {
        grouped[matchingSection.titulo].push(link);
      }
    });

  return grouped;
};

/**
 * Creates an ordered sections record with active links
 */
export const createOrderedSectionsRecord = (
  links: BiositeLink[],
  sections: Section[]
): Record<string, BiositeLink[]> => {
  // Remove duplicates and sort by orderIndex
  const uniqueSections = sections
    .filter((v, i, a) => a.findIndex((t) => t.titulo === v.titulo) === i)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  // Group links by section
  const grouped = groupLinksBySection(links, uniqueSections);

  // Create final ordered record
  const orderedSections: Record<string, BiositeLink[]> = {};
  uniqueSections.forEach((section) => {
    orderedSections[section.titulo] = grouped[section.titulo] || [];
  });

  return orderedSections;
};

/**
 * Helper functions to identify link types
 */
const isSocialLink = (link: BiositeLink): boolean => {
  const url = link.url?.toLowerCase() || "";
  const socialPlatforms = [
    "facebook.com",
    "instagram.com",
    "twitter.com",
    "linkedin.com",
    "tiktok.com",
    "youtube.com",
  ];
  return socialPlatforms.some((platform) => url.includes(platform));
};

const isRegularLink = (link: BiositeLink): boolean => {
  // Links that are not social, whatsapp, music, video, etc.
  return !isSocialLink(link) && !isWhatsAppLink(link);
};

const isWhatsAppLink = (link: BiositeLink): boolean => {
  const url = link.url?.toLowerCase() || "";
  const label = link.label?.toLowerCase() || "";
  return url.includes("whatsapp") || label.includes("whatsapp");
};
