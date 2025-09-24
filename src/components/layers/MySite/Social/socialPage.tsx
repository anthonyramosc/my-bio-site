import { useState, useEffect } from "react";
import { ChevronLeft, X, Edit2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePreview } from "../../../../context/PreviewContext.tsx";
import { socialMediaPlatforms } from "../../../../media/socialPlataforms.ts";
import BackButton from "../../../shared/BackButton.tsx";

interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
}

const SocialPage = () => {
  const {
    socialLinks,
    addSocialLink,
    removeSocialLink,
    updateSocialLink,
    loading,
    error,
    clearError,
  } = usePreview();

  const [editingPlatform, setEditingPlatform] = useState<SocialPlatform | null>(
    null
  );
  const [urlInput, setUrlInput] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [showUrlForm, setShowUrlForm] = useState(false);

  const formatWhatsAppUrl = (url: string): string => {
    if (url.includes("wa.me/")) {
      return url;
    }

    let phoneNumber = "";

    if (/^\+?\d+$/.test(url.replace(/[\s\-\(\)]/g, ""))) {
      phoneNumber = url.replace(/[\s\-\(\)]/g, "");
    } else if (url.includes("whatsapp.com")) {
      const match = url.match(/phone=(\d+)/);
      if (match) {
        phoneNumber = match[1];
      }
    } else {
      phoneNumber = url.replace(/\D/g, "");
    }
    if (
      phoneNumber &&
      !phoneNumber.startsWith("1") &&
      !phoneNumber.startsWith("5") &&
      phoneNumber.length >= 10
    ) {
      if (phoneNumber.length === 9 || phoneNumber.length === 10) {
        phoneNumber = "593" + phoneNumber;
      }
    }

    return phoneNumber ? `https://wa.me/${phoneNumber}` : url;
  };

  const isWhatsAppPlatform = (platform: SocialPlatform): boolean => {
    return (
      platform.id === "whatsapp" ||
      platform.name.toLowerCase().includes("whatsapp") ||
      platform.icon.includes("whatsapp")
    );
  };

  const activeSocialLinks = socialLinks.filter((link) => {
    if (!link.isActive) return false;

    const labelLower = link.label.toLowerCase();
    const urlLower = link.url.toLowerCase();

    if (urlLower.includes("api.whatsapp.com")) return false;

    const excludedKeywords = [
      "open.spotify.com/embed",
      "music",
      "apple music",
      "soundcloud",
      "audio",
      "youtube.com/watch",
      "video",
      "vimeo",
      "tiktok video",
      "post",
      "publicacion",
      "contenido",
      "api.whatsapp.com",
      "music embed",
      "video embed",
      "social post",
    ];

    const isExcluded = excludedKeywords.some(
      (keyword) => labelLower.includes(keyword) || urlLower.includes(keyword)
    );

    if (isExcluded) return false;

    const platform = socialMediaPlatforms.find((p) => {
      const platformNameLower = p.name.toLowerCase();
      const platformIdLower = p.id.toLowerCase();

      return (
        labelLower === platformNameLower ||
        labelLower === platformIdLower ||
        (platformIdLower.length > 2 && labelLower.includes(platformIdLower)) ||
        link.icon === p.icon ||
        labelLower.replace(/[^a-z0-9]/g, "") ===
          platformNameLower.replace(/[^a-z0-9]/g, "") ||
        (platformNameLower.includes("/") &&
          platformNameLower
            .split("/")
            .some((name) => name.trim().toLowerCase() === labelLower)) ||
        (labelLower.includes("/") &&
          labelLower
            .split("/")
            .some((name) => name.trim().toLowerCase() === platformNameLower))
      );
    });

    return platform !== undefined;
  });

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, []);

  const handleDeleteLink = async (linkId: string, platformName: string) => {
    try {
      setIsSubmitting(true);
      console.log("Attempting to remove link with ID:", linkId);
      await removeSocialLink(linkId);
      console.log(`Successfully removed ${platformName} link`);
    } catch (error) {
      console.error(`Error removing ${platformName} link:`, error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Error al eliminar el enlace de ${platformName}`;
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlatformSelect = async (platform: SocialPlatform) => {
    const existingLink = activeSocialLinks.find((link) => {
      const linkLabelLower = link.label.toLowerCase();
      const platformNameLower = platform.name.toLowerCase();
      const platformIdLower = platform.id.toLowerCase();

      return (
        linkLabelLower === platformNameLower ||
        linkLabelLower === platformIdLower ||
        (platformIdLower.length > 2 &&
          linkLabelLower.includes(platformIdLower)) ||
        link.icon === platform.icon ||
        linkLabelLower.replace(/[^a-z0-9]/g, "") ===
          platformNameLower.replace(/[^a-z0-9]/g, "") ||
        (platformNameLower.includes("/") &&
          platformNameLower
            .split("/")
            .some((name) => name.trim().toLowerCase() === linkLabelLower)) ||
        (linkLabelLower.includes("/") &&
          linkLabelLower
            .split("/")
            .some((name) => name.trim().toLowerCase() === platformNameLower))
      );
    });

    if (existingLink) {
      await handleDeleteLink(existingLink.id, platform.name);
    } else {
      setEditingPlatform(platform);
      setLabelInput(platform.name);
      setUrlInput("");
      setShowUrlForm(true);
    }
  };

  const handleSaveLink = async () => {
    if (!editingPlatform || !urlInput.trim()) return;

    try {
      setIsSubmitting(true);

      let processedUrl = urlInput.trim();
      if (isWhatsAppPlatform(editingPlatform)) {
        processedUrl = formatWhatsAppUrl(processedUrl);
      }

      const existingLink = activeSocialLinks.find(
        (link) => link.id === editingLink
      );

      if (existingLink) {
        await updateSocialLink(existingLink.id, {
          label: labelInput.trim() || editingPlatform.name,
          url: processedUrl,
          icon: editingPlatform.icon,
          color: editingPlatform.color,
          isActive: editingPlatform.isActive,
        });
        console.log(`Updated ${editingPlatform.name} link`);
      } else {
        const newSocialLink = {
          id: `temp-${Date.now()}`,
          name: editingPlatform.name,
          label: labelInput.trim() || editingPlatform.name,
          url: processedUrl,
          icon: editingPlatform.icon,
          color: editingPlatform.color,
          isActive: editingPlatform.isActive,
        };

        await addSocialLink(newSocialLink);
        console.log(`Added ${editingPlatform.name} link`);
      }

      handleCancelEdit();
    } catch (error) {
      console.error(`Error saving ${editingPlatform.name} link:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLink = (link: any) => {
    const platform = socialMediaPlatforms.find(
      (p) =>
        p.name.toLowerCase() === link.label.toLowerCase() ||
        link.label.toLowerCase().includes(p.id.toLowerCase()) ||
        p.id.toLowerCase() === link.label.toLowerCase()
    );

    if (platform) {
      setEditingPlatform(platform);
      setEditingLink(link.id);
      setLabelInput(link.label);
      setUrlInput(link.url);
      setShowUrlForm(true);
    }
  };

  const handleCancelEdit = () => {
    setEditingPlatform(null);
    setEditingLink(null);
    setUrlInput("");
    setLabelInput("");
    setShowUrlForm(false);
  };

  const getPlaceholderText = (platformName: string): string => {
    const placeholders: { [key: string]: string } = {
      Instagram: "https://instagram.com/username",
      TikTok: "https://tiktok.com/@username",
      "Twitter/X": "https://x.com/username",
      Facebook: "https://facebook.com/username",
      Twitch: "https://twitch.tv/username",
      LinkedIn: "https://linkedin.com/in/username",
      Snapchat: "https://snapchat.com/add/username",
      Threads: "https://threads.net/@username",
      Email: "your@email.com",
      Pinterest: "https://pinterest.com/username",
      Spotify: "https://open.spotify.com/user/username",
      YouTube: "https://youtube.com/@username",
      Discord: "https://discord.gg/servername",
      Tumblr: "https://username.tumblr.com",
      WhatsApp: "+593987654321 o 0987654321",
      Telegram: "https://t.me/username",
      Amazon: "https://amazon.com/dp/productid",
      OnlyFans: "https://onlyfans.com/username",
    };
    return placeholders[platformName] || "https://example.com";
  };

  const isPlatformActive = (platform: SocialPlatform) => {
    return activeSocialLinks.some((link) => {
      const linkLabelLower = link.label.toLowerCase();
      const platformNameLower = platform.name.toLowerCase();
      const platformIdLower = platform.id.toLowerCase();

      return (
        linkLabelLower === platformNameLower ||
        linkLabelLower === platformIdLower ||
        (platformIdLower.length > 2 &&
          linkLabelLower.includes(platformIdLower)) ||
        link.icon === platform.icon ||
        linkLabelLower.replace(/[^a-z0-9]/g, "") ===
          platformNameLower.replace(/[^a-z0-9]/g, "") ||
        (platformNameLower.includes("/") &&
          platformNameLower
            .split("/")
            .some((name) => name.trim().toLowerCase() === linkLabelLower)) ||
        (linkLabelLower.includes("/") &&
          linkLabelLower
            .split("/")
            .some((name) => name.trim().toLowerCase() === platformNameLower))
      );
    });
  };

  const validateUrl = (url: string) => {
    if (!url.trim()) return false;

    if (editingPlatform?.id === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(url) || url.startsWith("mailto:");
    }

    if (editingPlatform && isWhatsAppPlatform(editingPlatform)) {
      const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
      if (phoneRegex.test(url)) {
        return true;
      }
      if (url.includes("wa.me/") || url.includes("whatsapp.com")) {
        return true;
      }
      return false;
    }

    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  if (loading && activeSocialLinks.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-4 text-white flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">Cargando redes sociales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full mt-0 lg:mt-20 mb-10 max-w-md mx-auto rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700">
        <BackButton text={"Redes Sociales"} />
      </div>

      {/* Main Content */}
      <div className="p-4">
        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Inline URL Form */}
        {showUrlForm && editingPlatform && (
          <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: editingPlatform.color }}
              >
                <img
                  src={editingPlatform.icon}
                  alt={editingPlatform.name}
                  className="w-4 h-4 filter invert brightness-0 contrast-100"
                />
              </div>

              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                placeholder={getPlaceholderText(editingPlatform.name)}
                disabled={isSubmitting}
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveLink}
                  disabled={!validateUrl(urlInput) || isSubmitting}
                  className="w-8 h-8  cursor-pointer text-green-600 rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="w-8 h-8  text-red-600 rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Social Links */}
        {activeSocialLinks.length > 0 && (
          <div className="mb-6 space-y-2">
            {activeSocialLinks.map((link) => {
              const platform = socialMediaPlatforms.find(
                (p) =>
                  p.name.toLowerCase() === link.label.toLowerCase() ||
                  link.label.toLowerCase().includes(p.id.toLowerCase()) ||
                  p.id.toLowerCase() === link.label.toLowerCase()
              );

              return (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3 bg-[#FAFFF6] rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: platform?.color || "#6B7280" }}
                    >
                      <img
                        src={platform?.icon || "🔗"}
                        alt={link.label}
                        className="w-4 h-4 filter invert brightness-0 contrast-100"
                      />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-black">
                        {link.label}
                      </span>
                      <p className="text-xs text-gray-400 truncate max-w-48">
                        {link.url}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditLink(link)}
                      className="text-gray-400 hover:text-blue-400 cursor-pointer transition-colors p-1"
                      disabled={isSubmitting}
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteLink(link.id, link.label)}
                      className="text-gray-400 hover:text-red-400 cursor-pointer transition-colors p-1"
                      title="Eliminar"
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Social Links Footer */}
        <div className="border-t border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-4">
            <span
              className="text-sm text-gray-600"
              style={{ fontSize: "11px" }}
            >
              AÑADE LINKS SOCIALES {activeSocialLinks.length} / 8
            </span>
          </div>

          {/* Social Media Platforms Grid */}
          <div className="grid grid-cols-6 gap-1  rounded-lg">
            {socialMediaPlatforms.slice(0, 30).map((platform) => {
              const isActive = isPlatformActive(platform);
              return (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformSelect(platform)}
                  disabled={isSubmitting}
                  className={`
                                        relative p-5 rounded-lg transition-all duration-200 
                                        ${isActive ? "" : " hover:bg-gray-700"}
                                        ${
                                          isSubmitting
                                            ? "opacity-50 cursor-not-allowed"
                                            : "cursor-pointer"
                                        }
                                    `}
                >
                  {isActive && (
                    <div className="absolute top-2 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <X className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-lg flex bg-[#FFFFFF]  items-center justify-center">
                      <img
                        src={platform.icon}
                        alt={platform.name}
                        className="w-4 h-4 filter     "
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialPage;
