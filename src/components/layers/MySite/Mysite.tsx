import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import Profile from "./Profile/profile";
import Social from "./Social/social";
import V_Card from "./V-Card/V-Card";
import Links from "../AddMoreSections/Links/links";
import AppD from "../AddMoreSections/App/app";
import WhatsApp from "../AddMoreSections/WhattsApp/whatsapp";
import Videos from "../AddMoreSections/Video/video";
import Musics from "../AddMoreSections/Music-Posdcast/music_podcast";
import Post from "../AddMoreSections/Socialpost/social_post";
import { usePreview } from "../../../context/PreviewContext.tsx";
import { useSectionsContext } from "../../../context/SectionsContext.tsx";
import { GripVertical, Menu, Minus, X, Check } from "lucide-react";
import Loading from "../../shared/Loading.tsx";

const MySite = () => {
  const {
    socialLinks,
    regularLinks,
    appLinks,
    whatsAppLinks,
    getVideoLinks,
    getMusicLinks,
    getSocialPostLinks,
  } = usePreview();
  const { reorderSections, getVisibleSections, loading } = useSectionsContext();

  // State for visual feedback during drag
  const [isDragging, setIsDragging] = useState(false);
  // State for mobile reorder mode
  const [isReorderMode, setIsReorderMode] = useState(false);

  // Filter active links
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

  // Get visible sections based on active links
  const visibleSections = getVisibleSections(
      activeSocialLinks,
      activeRegularLinks,
      activeAppLinks,
      activeWhatsAppLinks,
      activeVideoLinks,
      activeMusicLinks,
      activeSocialPostLinks
  );

  // Separate Profile section from draggable sections
  const profileSection = visibleSections.find(
      (section) => section.titulo === "Profile"
  );
  const draggableSections = visibleSections.filter(
      (section) => section.titulo !== "Profile"
  );

  // Component mapping
  const getSectionComponent = (sectionTitle: string) => {
    switch (sectionTitle) {
      case "Profile":
        return <Profile key="profile" />;
      case "Social":
        return <Social key="social" />;
      case "Links":
        return <Links key="links" />;
      case "Link de mi App":
        return <AppD key="app" />;
      case "Contactame":
        return <WhatsApp key="whatsapp" />;
      case "Music / Podcast":
        return <Musics key="music" />;
      case "Social Post":
        return <Post key="post" />;
      case "VCard":
        return <V_Card key="vcard" />;
      case "Video":
        return <Videos key="video" />;
      default:
        return null;
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false);

    const { destination, source } = result;

    if (!destination || destination.index === source.index) {
      return;
    }

    try {
      const newSections = Array.from(draggableSections);
      const [draggedSection] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, draggedSection);

      const reorderData = [
        ...(profileSection ? [{ id: profileSection.id, orderIndex: 0 }] : []),
        ...newSections.map((section, index) => ({
          id: section.id,
          orderIndex: index + 1,
        })),
      ];

      await reorderSections(reorderData);
    } catch (error) {
      console.error("Error reordering sections:", error);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Toggle reorder mode
  const toggleReorderMode = () => {
    setIsReorderMode(!isReorderMode);
  };

  // Get section color based on title
  const getSectionColor = (sectionTitle: string) => {
    switch (sectionTitle) {
      case "Profile":
        return "bg-blue-600";
      case "Social":
        return "bg-blue-600";
      case "Links":
        return "bg-purple-600";
      case "Link de mi App":
        return "bg-green-600";
      case "Contactame":
        return "bg-green-600";
      case "Music / Podcast":
        return "bg-pink-600";
      case "Social Post":
        return "bg-pink-600";
      case "VCard":
        return "bg-orange-600";
      case "Video":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  // Get section icon based on title
  const getSectionIcon = (sectionTitle: string) => {
    switch (sectionTitle) {
      case "Profile":
        return "👤";
      case "Social":
        return "📱";
      case "Links":
        return "🔗";
      case "Link de mi App":
        return "📲";
      case "Contactame":
        return "💬";
      case "Music / Podcast":
        return "🎵";
      case "Social Post":
        return "📄";
      case "VCard":
        return "📇";
      case "Video":
        return "🎥";
      default:
        return "📋";
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
      <div className="w-full">
        <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <Droppable droppableId="sections" direction="vertical">
            {(provided, snapshot) => (
                <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-5 ${
                        snapshot.isDraggingOver ? "bg-blue-50/30" : ""
                    }`}
                >
                  {/* Header with reorder button for mobile */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wide text-start">
                      My VeSite
                    </h3>
                    <div className="lg:hidden flex items-center space-x-2">
                      <button
                          onClick={toggleReorderMode}
                          className={`p-2 rounded-lg transition-colors ${
                              isReorderMode
                                  ? "bg-teal-600 text-white"
                                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          }`}
                          title={isReorderMode ? "Finalizar reordenamiento" : "Reordenar secciones"}
                      >
                        {isReorderMode ? <Check size={20} /> : <Menu size={20} />}
                      </button>
                      {isReorderMode && (
                          <button
                              onClick={toggleReorderMode}
                              className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                              title="Cancelar"
                          >
                            <X size={20} />
                          </button>
                      )}
                    </div>
                  </div>

                  {/* Profile section - always first, not draggable */}
                  {profileSection && (
                      <div className="transition-all duration-200">
                        {getSectionComponent(profileSection.titulo)}
                      </div>
                  )}

                  {/* Draggable sections */}
                  {draggableSections.map((section, index) => {
                    const component = getSectionComponent(section.titulo);
                    if (!component) return null;

                    return (
                        <Draggable
                            key={section.id}
                            draggableId={section.id.toString()}
                            index={index}
                            isDragDisabled={!isReorderMode && window.innerWidth < 1024}
                        >
                          {(provided, snapshot) => (
                              <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`
                          group relative
                          hover:shadow-sm
                          ${
                                      snapshot.isDragging
                                          ? "opacity-50 shadow-lg z-50  lg:-ml-30 -mt-50 lg:mt-0 "
                                          : ""
                                  }
                          ${
                                      snapshot.isDropAnimating
                                          ? "transition-transform duration-200"
                                          : ""
                                  }
                          ${
                                      isDragging && !snapshot.isDragging
                                          ? "opacity-75"
                                          : ""
                                  }
                        `}
                              >
                                {/* Desktop drag handle - Always visible on hover for desktop */}
                                {!isReorderMode && (
                                    <div
                                        {...provided.dragHandleProps}
                                        className={`
                              hidden lg:flex
                              absolute -left-10 top-1/2 transform -translate-y-1/2 z-50
                              w-8 h-8 items-center justify-center
                              bg-white shadow-md border border-gray-200 rounded-lg
                              ${
                                            snapshot.isDragging || isDragging
                                                ? "opacity-100"
                                                : "opacity-0 group-hover:opacity-100"
                                        }
                              transition-all duration-200
                              cursor-grab active:cursor-grabbing
                              hover:bg-gray-50 hover:shadow-lg
                            `}
                                        title="Arrastrar para reordenar"
                                    >
                                      <GripVertical size={16} className="text-gray-500" />
                                    </div>
                                )}

                                {/* Mobile/Desktop content */}
                                {isReorderMode ? (
                                    <div className="flex items-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg pr-1">
                                      <div className="transition-all duration-200 w-full">
                                        {component}
                                      </div>
                                      <div
                                          {...provided.dragHandleProps}
                                          className="p-2 bg-white border border-gray-300 rounded-lg cursor-grab active:cursor-grabbing hover:bg-gray-100 transition-colors z-50"
                                          title="Arrastrar"
                                      >
                                        <GripVertical size={16} className="text-gray-600" />
                                      </div>
                                    </div>
                                ) : (
                                    <div className="transition-all duration-200">
                                      {component}
                                    </div>
                                )}
                              </div>
                          )}
                        </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
  );
};

export default MySite;