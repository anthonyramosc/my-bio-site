import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  RefreshCw,
  BarChartHorizontalBig,
  Palette,
  GanttChart,
  Shield,
  Settings,
  ExternalLink,
  X, // Importar el icono X para cerrar
} from "lucide-react";

import imgP from "../../../public/img/img.png";
import imgP2 from "../../../public/img/fondo.svg";
import imgP6 from "../../../public/img/img_6.png";
import { useAuthContext } from "../../hooks/useAuthContext.ts";
import { usePreview } from "../../context/PreviewContext.tsx";
import { useChangeDetection } from "../../hooks/useChangeDetection.ts";
import { useUpdateShareActions } from "../../hooks/useUpdateShareActions.ts";

import PhonePreview from "../Preview/phonePreview.tsx";
import SettingsModal from "../global/Settings/SettingsModal.tsx";
import ShareButton from "../ShareButton.tsx";
import Cookie from "js-cookie";
import NewBiositePage from "../../context/NewBiositePage/NewBiositePage.tsx";
import LivePreviewContent from "../Preview/LivePreviewContent.tsx";

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  const role = Cookie.get("roleName");
  const userId = Cookie.get("userId");
  const hasAdminAccess =
      role === "SUPER_ADMIN" ||
      userId === "92784deb-3a8e-42a0-91ee-cd64fb3726f5" ||
      role === "ADMIN";
  const { biosite } = usePreview();
  const { hasChanges, markAsSaved, resetChangeDetection } =
      useChangeDetection();
  const { isUpdating, handleUpdate } = useUpdateShareActions();

  const [activeItem, setActiveItem] = useState<string>("layers");
  const [showPreview, setShowPreview] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(() => {
    const saved = localStorage.getItem("drawerOpen");
    return saved ? JSON.parse(saved) : false;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentDrawerHeight, setCurrentDrawerHeight] = useState(85);
  const drawerRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      const preventDefault = (e: TouchEvent) => {
        if (
            e.target &&
            drawerRef.current &&
            !drawerRef.current.contains(e.target as Node)
        ) {
          e.preventDefault();
        }
      };

      document.addEventListener("touchmove", preventDefault, {
        passive: false,
      });

      return () => {
        document.removeEventListener("touchmove", preventDefault);
      };
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isDrawerOpen]);

  // Persistir el estado del drawer en localStorage
  useEffect(() => {
    localStorage.setItem("drawerOpen", JSON.stringify(isDrawerOpen));
  }, [isDrawerOpen]);

  useEffect(() => {
    if (hasChanges && biosite) {
      markAsSaved();
    }
  }, [hasChanges, biosite?.id]);

  const handleDrawerSectionClick = (section: string) => {
    navigate(section);
    setSelectedSection(section);
    setIsDrawerOpen(true);
    setCurrentDrawerHeight(85);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedSection(null);
    navigate("../");
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);

    const startY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setDragStartY(startY);
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !drawerRef.current) return;

    const currentY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const deltaY = currentY - dragStartY;
    const newHeight = Math.max(
        0,
        Math.min(95, currentDrawerHeight - (deltaY / window.innerHeight) * 100)
    );

    setCurrentDrawerHeight(newHeight);
    setDragStartY(currentY);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (currentDrawerHeight < 40) {
      closeDrawer();
    } else {
      setCurrentDrawerHeight(85);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleDragMove);
      document.addEventListener("mouseup", handleDragEnd);
      document.addEventListener("touchmove", handleDragMove);
      document.addEventListener("touchend", handleDragEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
      document.removeEventListener("touchmove", handleDragMove);
      document.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging, dragStartY, currentDrawerHeight]);

  const handleExpoced = () => {
    if (biosite?.slug) {
      const url = `https://visitaecuador.com/vesite/${
          biosite?.slug || "your-slug"
      }`;
      window.open(url, "_blank");
    } else {
      console.warn("No hay slug disponible para la navegación");
    }
  };

  const handleUpdateShareAction = async () => {
    if (hasChanges) {
      await handleUpdate();
      markAsSaved();
    }
  };

  useEffect(() => {
    if (biosite) {
      resetChangeDetection();
    }
  }, [biosite?.id]);

  const baseSidebarItems = [
    {
      icon: GanttChart,
      label: "Secciones",
      id: "sections",
      to: "/sections",
      color: "green",
    },
    {
      icon: Palette,
      label: "Estilos",
      id: "droplet",
      to: "/droplet",
      color: "orange",
    },
    {
      icon: BarChartHorizontalBig,
      label: "Estadísticas",
      id: "analytics",
      to: "/analytics",
      color: "blue",
    },
  ];

  const sidebarItems = hasAdminAccess
      ? [
        ...baseSidebarItems,
        {
          icon: Shield,
          label: "Administración",
          id: "admin",
          to: "/admin",
          color: "red",
        },
      ]
      : baseSidebarItems;

  const getAvatarImage = () => {
    if (avatarError || !biosite?.avatarImage) {
      return imgP;
    }
    if (typeof biosite.avatarImage === "string" && biosite.avatarImage.trim()) {
      if (biosite.avatarImage.startsWith("data:")) {
        const dataUrlRegex = /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/]+=*$/;
        return dataUrlRegex.test(biosite.avatarImage)
            ? biosite.avatarImage
            : imgP;
      }
      try {
        new URL(biosite.avatarImage);
        return biosite.avatarImage;
      } catch {
        return imgP;
      }
    }
    return imgP;
  };

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  const handleOpenSettings = () => setIsSettingsModalOpen(true);

  const handleLogoutFromSettings = () => {
    setIsSettingsModalOpen(false);
    logout();
    navigate("/login");
  };

  const handleProfileSelect = (profile: any) => {
    console.log("Profile selected:", profile);
  };

  const handleCreateNewSite = () => {
    console.log("Create new site");
    navigate("/create-site");
  };

  useEffect(() => {
    if (location.pathname != "/sections" || isDrawerOpen == true) {
      setIsDrawerOpen(true);
      setCurrentDrawerHeight(85);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowPreview(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isAnalyticsRoute = location.pathname === "/analytics";
  const isAdminRoute = location.pathname === "/admin";

  useEffect(() => {
    setAvatarError(false);
  }, [biosite?.avatarImage]);

  const handleItemClick = (item: any) => {
    setActiveItem(item.id);
    navigate(item.to);
    setIsDrawerOpen(true);
  };

  const getItemStyles = (item: any) => {
    if (activeItem === item.id) {
      const colorClasses = {
        green: "text-[#98C022] border-l-4 border-[#98C022] lg:border-l-4",
        orange: "text-orange-600 border-l-4 border-orange-300 lg:border-l-4",
        blue: "text-blue-600 border-l-4 border-blue-300 lg:border-l-4",
        red: "text-red-600 border-l-4 border-red-300 lg:border-l-4",
      };
      return colorClasses[item.color as keyof typeof colorClasses] + " ";
    }
    return "text-gray-600 hover:text-gray-300 ";
  };

  const getButtonContent = () => {
    if (isUpdating)
      return {
        text: "Updating...",
        icon: <RefreshCw className="w-3 h-3 animate-spin" />,
        disabled: true,
      };
    if (hasChanges)
      return {
        text: "Update",
        icon: <RefreshCw className="w-3 h-3" />,
        disabled: false,
      };
    return {
      text: "Update",
      icon: <RefreshCw className="w-3 h-3" />,
      disabled: false,
    };
  };

  const buttonContent = getButtonContent();

  return (
      <>
        {/* --- VISTA DESKTOP --- */}
        <div className="hidden lg:flex flex-col lg:flex-row h-screen bg-[#E0EED5] p-2 sm:p-4 overflow-x-hidden md:overflow-y-hidden">
          <nav className="w-16 xl:w-14 bg-[#FAFFF6] shadow-lg mt-10 mb-4 flex-col items-center space-y-6 rounded-full mr-4 hidden lg:flex">
            <button className="p-2 text-gray-600 hover:text-green-600 transition-colors cursor-pointer">
              <img
                  src={getAvatarImage()}
                  onClick={handleOpenSettings}
                  className="rounded-full w-10 h-10 xl:w-10 xl:h-10 object-cover"
                  alt="perfil"
                  onError={handleAvatarError}
              />
            </button>
            <div className="flex flex-col space-y-4 mt-7">
              {sidebarItems.map((item) => (
                  <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`p-4 pl-4 rounded-lg transition-all duration-200 cursor-pointer ${getItemStyles(
                          item
                      )}`}
                      title={item.label}
                  >
                    <item.icon size={20} />
                  </button>
              ))}
            </div>
            <div className="mt-auto pb-5 z-10">
              <button
                  onClick={handleOpenSettings}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer z-10"
                  title="Settings"
              >
                <Settings />
              </button>
            </div>
          </nav>

          <div className="flex-1 w-1/2 flex flex-col lg:flex-row ">
            <main
                className="flex w-full justify-center items-center overflow-y-auto p-3 sm:p-6 "
                style={{
                  background: `url(${imgP6}) no-repeat center center`,
                  backgroundSize: "cover",
                  backgroundColor: "white",
                }}
            >
              <Outlet />
            </main>
          </div>

          {!isAnalyticsRoute && !isAdminRoute && showPreview && (
              <div className=" w-1/2 flex justify-center items-center relative">
                <div
                    className="absolute inset-0"
                    style={{
                      background: `url(${imgP2}) no-repeat center center`,
                      backgroundSize: "cover",
                      height: "110%",
                      width: "110%",
                      opacity: 0.6,
                    }}
                />
                <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
                  <button
                      onClick={handleExpoced}
                      title="Mi URL"
                      className={`text-xs cursor-pointer rounded-lg px-3 py-2 text-white flex items-center space-x-1.5 transition-all duration-200 ${
                          buttonContent.disabled
                              ? "bg-gray-600/60 cursor-not-allowed"
                              : "bg-black/20 hover:bg-black/30"
                      } backdrop-blur-sm`}
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="truncate max-w-[120px]">
                  vesite/{biosite?.slug || "your-slug"}
                </span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <ShareButton />
                    <button
                        onClick={handleUpdateShareAction}
                        disabled={buttonContent.disabled}
                        className={`text-xs cursor-pointer rounded-lg px-3 py-2 text-white flex items-center space-x-1.5 transition-all duration-200 ${
                            buttonContent.disabled
                                ? "bg-gray-600/60 cursor-not-allowed"
                                : hasChanges
                                    ? "bg-[#98C022] hover:bg-[#86A81E]"
                                    : "bg-black/20 hover:bg-black/30"
                        } backdrop-blur-sm`}
                        title="Actualizar VeSite"
                    >
                      {buttonContent.icon}
                      <span>{buttonContent.text}</span>
                    </button>
                  </div>
                </div>
                {biosite && (
                    <PhonePreview
                        key={`${biosite.id}-${hasChanges ? "changed" : "unchanged"}`}
                    >
                      {biosite.slug ? (
                          <NewBiositePage slug={biosite.slug} />
                      ) : (
                          <LivePreviewContent />
                      )}
                    </PhonePreview>
                )}
              </div>
          )}
        </div>

        {/* --- VISTA MÓVIL --- */}
        <div
            className={`lg:hidden flex flex-col h-screen relative ${
                isDrawerOpen ? "overflow-hidden" : ""
            }`}
            style={{
              background: `url(${imgP2}) no-repeat center center`,
              backgroundSize: "cover",
              height: "100%",
              width: "100%",
            }}
        >
          <div className="absolute inset-0 bg-white opacity-24 z-0"></div>

          <header className="flex items-center justify-between p-3 z-10 relative">
            <img
                src={getAvatarImage()}
                onClick={handleOpenSettings}
                className="w-8 h-8 cursor-pointer rounded-full object-cover"
                alt="profile"
            />
            <div className="flex items-center space-x-5">
              <button
                  className="p-2 text-gray-400 rounded-full hover:bg-black/20 "
                  onClick={handleOpenSettings}
              >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </button>
              <div className="absolute top-3.5 right-18">
                <ShareButton />
              </div>
              <button
                  onClick={handleUpdateShareAction}
                  disabled={buttonContent.disabled}
                  className={`px-4 cursor-pointer py-2 text-xs rounded-lg flex items-center space-x-1.5 transition-colors ${
                      buttonContent.disabled
                          ? "bg-gray-600 text-gray-400"
                          : "bg-white text-black"
                  }`}
              >
                {buttonContent.icon}
                <span>{buttonContent.text}</span>
              </button>
            </div>
          </header>

          <main
              className={`flex-1 overflow-hidden flex items-center justify-center p-0 ${
                  isDrawerOpen ? "pointer-events-none" : ""
              }`}
              style={{
                maxHeight: "calc(100vh - 100px)",
                paddingBottom: isDrawerOpen ? "80px" : "0" // Añadir padding cuando drawer está abierto
              }}
          >
            {biosite && (
                <PhonePreview
                    key={`${biosite.id}-${hasChanges ? "changed" : "unchanged"}`}
                >
                  {biosite.slug ? (
                      <NewBiositePage slug={biosite.slug} />
                  ) : (
                      <LivePreviewContent />
                  )}
                </PhonePreview>
            )}
          </main>

          {/* Menú inferior - SIEMPRE VISIBLE */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-lg z-[60]">
            <div className="flex justify-around items-center py-2 px-4">
              {sidebarItems.map((item) => (
                  <button
                      key={item.id}
                      onClick={() => handleDrawerSectionClick(item.id)}
                      className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${
                          selectedSection === item.id
                              ? "text-[#98C022] bg-[#98C022]/10"
                              : "text-gray-600 hover:text-[#98C022] hover:bg-gray-100"
                      }`}
                  >
                    <item.icon size={20} />
                    <span className="text-[10px] font-medium tracking-wide">
                  {item.label}
                </span>
                  </button>
              ))}
            </div>
          </nav>

          {/* --- Drawer Deslizable --- */}
          {isDrawerOpen && (
              <>
                <div
                    ref={drawerRef}
                    className="fixed bottom-0 p-4 left-0 right-0 bg-[#E0EED5]/95 backdrop-blur-lg rounded-t-2xl shadow-2xl z-50 flex flex-col pointer-events-auto"
                    style={{
                      height: `${currentDrawerHeight}vh`,
                      transition: "height 0.3s ease-in-out",
                      paddingBottom: "90px", // Espacio para el menú inferior
                    }}
                >
                  {/* Header del drawer con botón de cerrar */}
                  <div className="flex items-center justify-between pb-2 flex-shrink-0">
                    <div
                        ref={dragHandleRef}
                        onMouseDown={handleDragStart}
                        onTouchStart={handleDragStart}
                        className="flex-1 pb-2 cursor-grab active:cursor-grabbing flex justify-center"
                    >
                      <div className="w-10 h-1.5 bg-gray-600 rounded-full" />
                    </div>
                    <button
                        onClick={closeDrawer}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200/50 rounded-full transition-colors"
                        title="Cerrar"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="overflow-y-auto flex-1">
                    <Outlet />
                  </div>
                </div>
              </>
          )}
        </div>
        <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            onLogout={handleLogoutFromSettings}
            onProfileSelect={handleProfileSelect}
            onCreateNewSite={handleCreateNewSite}
        />
      </>
  );
};

export default Layout;