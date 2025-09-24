import { usePreview } from "../../../context/PreviewContext.tsx";
import { useSectionsContext } from "../../../context/SectionsContext.tsx";
import { useNavigate } from "react-router-dom";
import { VideoCameraOutlined } from "@ant-design/icons";
import {  Music } from "lucide-react";

const Add = () => {
  const {
    socialLinks,
    regularLinks,
    appLinks,
    whatsAppLinks,
    getVideoLinks,
    getMusicLinks,
    getSocialPostLinks,
  } = usePreview();
  const { getVisibleSections } = useSectionsContext();
  const navigate = useNavigate();

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
    return !isExcluded;
  });

  const activeRegularLinks = regularLinks.filter((link) => link.isActive);
  const activeAppLinks = appLinks.filter((link) => link.isActive);
  const activeWhatsAppLinks = whatsAppLinks.filter(
    (link) =>
      link.isActive &&
      link.phone &&
      link.message &&
      link.phone.trim() !== "" &&
      link.message.trim() !== ""
  );

  // Get active links from context
  const activeVideoLinks = getVideoLinks();
  const activeMusicLinks = getMusicLinks();
  const activeSocialPostLinks = getSocialPostLinks();

  const visibleSections = getVisibleSections(
    activeSocialLinks,
    activeRegularLinks,
    activeAppLinks,
    activeWhatsAppLinks,
    activeVideoLinks,
    activeMusicLinks,
    activeSocialPostLinks
  );

  // Check which sections are visible in MySite
  const isSocialVisible = visibleSections.some(
    (section) => section.titulo === "Social"
  );

  return (
    <div className="w-full ">
      <div className="space-y-5">
        {/* Show Social component only when NOT visible in MySite */}
        <h3 className="text-xs font-bold text-gray-800 mb-5 uppercase tracking-wide text-start">
          Contenido
        </h3>
        {!isSocialVisible && (
          <div
            className="bg-[#FAFFF6] rounded-lg p-4  flex items-center justify-between cursor-pointer transition-colors"
            onClick={() => navigate("/social")}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#0EBBAA] rounded-lg flex items-center justify-center">
                <svg
                  width="200"
                  height="200"
                  viewBox="0 0 50 51"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.5714 28.9285C19.9916 28.9285 21.1429 27.7772 21.1429 26.3571C21.1429 24.9369 19.9916 23.7856 18.5714 23.7856C17.1513 23.7856 16 24.9369 16 26.3571C16 27.7772 17.1513 28.9285 18.5714 28.9285Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M30.1428 23.1429C31.563 23.1429 32.7143 21.9916 32.7143 20.5714C32.7143 19.1513 31.563 18 30.1428 18C28.7227 18 27.5714 19.1513 27.5714 20.5714C27.5714 21.9916 28.7227 23.1429 30.1428 23.1429Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M30.1428 34.7144C31.563 34.7144 32.7143 33.5631 32.7143 32.143C32.7143 30.7228 31.563 29.5715 30.1428 29.5715C28.7227 29.5715 27.5714 30.7228 27.5714 32.143C27.5714 33.5631 28.7227 34.7144 30.1428 34.7144Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20.1272 24.3128L27.6486 21.1885M20.1272 28.4013L27.6486 31.5256"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <div className="text-black font-medium">Social</div>
                <div className="text-gray-400 text-sm">
                  Add your social media
                </div>
              </div>
            </div>
            <div className="w-6 h-6 border border-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-[#0EBBAA] hover:border-[#0EBBAA] transition-colors">
              <span className="text-black text-sm hover:text-white">+</span>
            </div>
          </div>
        )}

        <div
          className="bg-[#FAFFF6] rounded-lg p-4  flex items-center justify-between cursor-pointer transition-colors"
          onClick={() => navigate("/links")}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#6F4FC1] rounded-lg flex items-center justify-center">
              <svg
                width="200"
                height="200"
                viewBox="0 0 50 51"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M25.6207 22.702L26.7409 23.8214C27.2556 24.336 27.6638 24.9469 27.9424 25.6193C28.2209 26.2917 28.3643 27.0124 28.3643 27.7402C28.3643 28.4679 28.2209 29.1886 27.9424 29.861C27.6638 30.5334 27.2556 31.1443 26.7409 31.6589L26.4607 31.9384C25.9461 32.453 25.3351 32.8612 24.6628 33.1397C23.9904 33.4182 23.2697 33.5616 22.5419 33.5616C21.8142 33.5616 21.0935 33.4182 20.4211 33.1397C19.7488 32.8612 19.1378 32.453 18.6232 31.9384C18.1086 31.4237 17.7004 30.8128 17.4219 30.1404C17.1433 29.468 17 28.7474 17 28.0196C17 27.2918 17.1433 26.5712 17.4219 25.8988C17.7004 25.2264 18.1086 24.6155 18.6232 24.1009L19.7434 25.2211C19.3732 25.5881 19.0791 26.0245 18.8781 26.5055C18.677 26.9864 18.5729 27.5023 18.5718 28.0236C18.5706 28.5449 18.6725 29.0612 18.8714 29.5431C19.0704 30.0249 19.3625 30.4626 19.7311 30.8312C20.0997 31.1998 20.5375 31.492 21.0193 31.6909C21.5011 31.8899 22.0175 31.9917 22.5388 31.9906C23.06 31.9895 23.5759 31.8854 24.0569 31.6843C24.5378 31.4832 24.9743 31.1892 25.3413 30.8189L25.6215 30.5387C26.3636 29.7964 26.7805 28.7898 26.7805 27.7402C26.7805 26.6905 26.3636 25.6839 25.6215 24.9416L24.5013 23.8214L25.6207 22.702ZM30.9392 27.4599L29.8197 26.3405C30.5465 25.595 30.9503 24.5932 30.9436 23.5521C30.9369 22.511 30.5203 21.5144 29.7841 20.7783C29.0479 20.0421 28.0512 19.6257 27.0101 19.6192C25.969 19.6126 24.9673 20.0166 24.2219 20.7434L23.9416 21.0229C23.1995 21.7652 22.7827 22.7718 22.7827 23.8214C22.7827 24.871 23.1995 25.8777 23.9416 26.6199L25.0618 27.7402L23.9416 28.8596L22.8222 27.7402C22.3075 27.2256 21.8993 26.6146 21.6208 25.9422C21.3422 25.2699 21.1989 24.5492 21.1989 23.8214C21.1989 23.0936 21.3422 22.373 21.6208 21.7006C21.8993 21.0282 22.3075 20.4173 22.8222 19.9027L23.1024 19.6232C23.6171 19.1086 24.228 18.7004 24.9004 18.4219C25.5728 18.1433 26.2934 18 27.0212 18C27.749 18 28.4696 18.1433 29.142 18.4219C29.8144 18.7004 30.4253 19.1086 30.9399 19.6232C31.4546 20.1378 31.8628 20.7488 32.1413 21.4211C32.4198 22.0935 32.5631 22.8142 32.5631 23.5419C32.5631 24.2697 32.4198 24.9904 32.1413 25.6628C31.8628 26.3351 31.4546 26.9461 30.9399 27.4607"
                  fill="white"
                />
              </svg>
            </div>
            <div>
              <div className="text-black font-medium">Links</div>
              <div className="text-gray-400 text-sm">Links Diversos</div>
            </div>
          </div>
          <div className="w-6 h-6 border border-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-[#6F4FC1] hover:border-[#6F4FC1] transition-colors">
            <span className="text-black text-sm hover:text-white">+</span>
          </div>
        </div>

        <div
          className="bg-[#FAFFF6] rounded-lg p-4  flex items-center justify-between cursor-pointer transition-colors"
          onClick={() => navigate("/whatsApp")}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488" />
              </svg>
            </div>
            <div>
              <div className="text-black font-medium">Contactame</div>
              <div className="text-gray-400 text-sm">WhatsApp</div>
            </div>
          </div>
          <div className="w-6 h-6 border border-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-[#0EBBAA] hover:border-[#0EBBAA] transition-colors">
            <span className="text-black text-sm hover:text-white">+</span>
          </div>
        </div>

        <div
          className="bg-[#FAFFF6] rounded-lg p-4  flex items-center justify-between cursor-pointer transition-colors"
          onClick={() => navigate("/app")}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 14 14"
              >
                <g
                  fill="none"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2.5 13.5h-1a1 1 0 0 1-1-1v-8h13v8a1 1 0 0 1-1 1h-1" />
                  <path d="M4.5 11L7 13.5L9.5 11M7 13.5v-6M11.29 1a1 1 0 0 0-.84-.5h-6.9a1 1 0 0 0-.84.5L.5 4.5h13zM7 .5v4" />
                </g>
              </svg>
            </div>
            <div>
              <div className="text-black font-medium">Link de mi App</div>
              <div className="text-gray-400 text-sm">Links de App</div>
            </div>
          </div>
          <div className="w-6 h-6 border border-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-green-600 hover:border-green-600 transition-colors">
            <span className="text-black text-sm hover:text-white">+</span>
          </div>
        </div>

        <div
          onClick={() => navigate("/videos")}
          className="bg-[#FAFFF6] rounded-lg p-4  flex items-center justify-between cursor-pointer  transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <VideoCameraOutlined style={{ color: "white" }} />
            </div>
            <div>
              <div className="text-black font-medium">Video</div>
              <div className="text-gray-400 text-sm">
                Añade un video de Youtube que quieras mostrar{" "}
              </div>
            </div>
          </div>
          <div className="w-6 h-6 border border-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-green-600 hover:border-green-600 transition-colors">
            <span className="text-black text-sm hover:text-white">+</span>
          </div>
        </div>

        <div
          onClick={() => navigate("/music")}
          className="bg-[#FAFFF6] rounded-lg p-4  flex items-center justify-between cursor-pointer  transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Music size={16} className="text-white" />
            </div>
            <div>
              <div className="text-black font-medium">Music / Podcast</div>
              <div className="text-gray-400 text-sm">Añade Musica </div>
            </div>
          </div>
          <div className="w-6 h-6 border border-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-purple-600 hover:border-purple-600 transition-colors">
            <span className="text-black text-sm hover:text-white">+</span>
          </div>
        </div>

        <div
          onClick={() => navigate("/post")}
          className="bg-[#FAFFF6] rounded-lg p-4  flex items-center justify-between cursor-pointer  transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
              <svg width="25" height="25" viewBox="0 0 134 119" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.3333 99.1667V19.8333H111.667V99.1667H22.3333ZM101.784 82.5761H32.2158V91.5407H101.784V82.5761ZM32.2158 78.1879H101.784V69.2282H32.2158V78.1879ZM32.2158 63.6947H101.784V28.6096H32.2158V63.6997V63.6947ZM32.2158 63.6947V28.6096V63.6997V63.6947Z" fill="white"/>
              </svg>
            </div>
            <div>
              <div className="text-black font-medium">Social Post</div>
              <div className="text-gray-400 text-sm">
                Publicaciones de Instagram
              </div>
            </div>
          </div>
          <div className="w-6 h-6 border border-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-pink-600 hover:border-pink-600 transition-colors">
            <span className="text-black text-sm hover:text-white">+</span>
          </div>
        </div>
      </div>
      <div className="h-20"></div>
    </div>
  );
};

export default Add;
