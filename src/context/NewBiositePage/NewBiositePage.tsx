import { useEffect, useState } from "react";
import apiService from "../../service/apiService";
import type { Section } from "../../interfaces/sections";
import { getSectionsByBiositeApi } from "../../constants/EndpointsRoutes";
import Button from "../../components/shared/Button";
import { useNavigate, useParams } from "react-router-dom";
import type { BiositeFull, BiositeLink } from "../../interfaces/Biosite";
import Loading from "../../components/shared/Loading";
import { getThemeConfig, isValidImageUrl } from "../../Utils/biositeUtils";
import {
  AvatarSection,
  BackgroundSection,
  UserInfoSection,
} from "../../components/Preview/LivePreviewComponents";
import { useUser } from "../../hooks/useUser";
import { createOrderedSectionsRecord } from "./recordHelper";
import BiositeSection, { Section_type } from "./BiositeSection";
import ConditionalNavButton from "../../components/ConditionalNavButton";
import VCardModal from "./VCardModal";
import type { VCardData } from "../../types/V-Card";

export default function NewBiositePage({ slug: propSlug }: { slug?: string }) {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = propSlug || paramSlug;
  const { user } = useUser();
  const [biosite, setBiosite] = useState<BiositeFull>();
  const [links, setLinks] = useState<Map<Section_type, BiositeLink[]>>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showVCard, setShowVCard] = useState(false);
  const navigate = useNavigate();

  const [imageLoadStates, setImageLoadStates] = useState<{
    [key: string]: "loading" | "loaded" | "error";
  }>({});

  useEffect(() => {
    if (showVCard) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showVCard]);

  const onNavigate = (route: string) => {
    navigate(route);
  };

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        if (biosite?.id) {
          const fetchedSections = await apiService.getAll<Section[]>(
              `${getSectionsByBiositeApi}/${biosite.id}`
          );
          let links: Map<Section_type, BiositeLink[]>;

          links = createOrderedSectionsRecord(
              biosite.links,
              fetchedSections,
              propSlug != null,
              onNavigate
          );

          setLinks(links);
        }
      } catch (erro: any) {
        setError("Error al cargar secciones");
      } finally {
        setLoading(false);
      }
    };

    if (biosite?.id) {
      fetchSections();
    }
  }, [biosite, propSlug]);

  useEffect(() => {
    const fetchBiositeBySlug = async () => {
      setLoading(true);
      setError("");

      if (!slug) {
        throw new Error("No se proporcionó un slug válido");
      }

      try {
        const biosite = await apiService.getById<BiositeFull>(
            "/biosites/slug",
            slug
        );

        if (!biosite) {
          throw new Error("Biosite no encontrado");
        }

        setBiosite(biosite);
      } catch (error: any) {
        const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Error al cargar el biosite";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBiositeBySlug();
  }, [slug]);

  const isExposedRoute = propSlug != null || window.location.pathname === `/${biosite?.slug}`;

  const handleUserInfoClick = (e: React.MouseEvent) => {
    if (isExposedRoute) {
      e.preventDefault();
      navigate('/profile');
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
        <div className="min-h-screen text-center bg-gray-100 flex items-center justify-center">
          <div>
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Biosite no encontrado
            </h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => (window.location.href = "/")}>
              Ir al inicio
            </Button>
          </div>
        </div>
    );
  }

  const themeConfig = getThemeConfig(biosite);
  const validBackgroundImage = isValidImageUrl(biosite?.backgroundImage)
      ? biosite?.backgroundImage
      : null;
  const validAvatarImage = isValidImageUrl(biosite?.avatarImage)
      ? biosite?.avatarImage
      : null;
  const defaultAvatar =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Ccircle cx='48' cy='48' r='48' fill='%23e5e7eb'/%3E%3Cpath d='M48 20c-8 0-14 6-14 14s6 14 14 14 14-6 14-14-6-14-14-14zM24 72c0-13 11-20 24-20s24 7 24 20v4H24v-4z' fill='%239ca3af'/%3E%3C/svg%3E";

  const description = biosite?.owner?.description;

  const getCardData = (): VCardData => {
    return {
      name: biosite?.owner?.name || "",
      title: biosite?.owner?.description || "",
      company: biosite?.owner?.site || "",
      email: biosite?.owner?.email || "",
      phone: biosite?.owner?.phone || "",
      website: biosite?.owner?.site || "",
    };
  };

  return (
      <>
        <div
            className={`w-full min-h-screen flex items-center justify-center`}
            style={{
              background: themeConfig.colors.background.startsWith(
                  "linear-gradient"
              )
                  ? themeConfig.colors.background
                  : themeConfig.colors.background,
              backgroundColor: themeConfig.colors.background.startsWith(
                  "linear-gradient"
              )
                  ? undefined
                  : themeConfig.colors.background,
              fontFamily: themeConfig.fonts.primary,
              color: themeConfig.colors.text,
            }}
        >
          <div className={`w-full max-w-full min-h-screen mx-auto`}>
            <BackgroundSection
                isExposedRoute={isExposedRoute}
                validBackgroundImage={validBackgroundImage}
                imageLoadStates={imageLoadStates}
                handleImageLoad={setImageLoadStates}
                biosite={biosite}
                themeConfig={themeConfig}
                handleImageClick={handleUserInfoClick}
            />

            <AvatarSection
                isExposedRoute={isExposedRoute}
                validAvatarImage={validAvatarImage}
                imageLoadStates={imageLoadStates}
                handleImageLoad={setImageLoadStates}
                biosite={biosite}
                themeConfig={themeConfig}
                defaultAvatar={defaultAvatar}
                handleImageClick={handleUserInfoClick}
            />

            <div className={`w-full max-w-md mx-auto`}>
              <UserInfoSection
                  biosite={biosite}
                  user={user}
                  description={description}
                  themeConfig={themeConfig}
                  handleUserInfoClick={handleUserInfoClick}
              />
            </div>
            <div className="flex flex-col gap-y-2 max-w-[550px] mx-auto justify-center p-4 -mt-2">
              <>
                {links &&
                    Array.from(links.entries()).map(([sectionId, sectionLinks]) => (
                        <BiositeSection
                            isPreview={isExposedRoute}
                            isPublicView={!isExposedRoute}
                            themeConfig={themeConfig}
                            key={sectionId}
                            section={sectionId}
                            links={sectionLinks}
                            vcard={{
                              avatar: validAvatarImage,
                              onClick: () => setShowVCard(true),
                            }}
                        />
                    ))}

                    <ConditionalNavButton themeConfig={themeConfig} />

              </>
            </div>
          </div>
        </div>
        {showVCard && (
            <VCardModal
                cardData={getCardData()}
                themeConfig={themeConfig}
                onClose={() => setShowVCard(false)}
            />
        )}
      </>
  );
}