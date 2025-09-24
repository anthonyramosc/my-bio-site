import Add from "../components/layers/AddMoreSections/addMore";
import MySite from "../components/layers/MySite/Mysite";
import Cookie from "js-cookie";
import apiService from "../service/apiService.ts";
import { useEffect } from "react";
import { usePreview } from "../context/PreviewContext.tsx";

const Sections = () => {
  const { biosite, getVideoEmbed } = usePreview();

  const updateAdminAndChildrenBackground = async (backgroundImage: string) => {
    const role = Cookie.get("roleName");
    const userId = Cookie.get("userId");
    const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

    if (!isAdmin || !userId) {
      return;
    }

    try {
      await apiService.patch(
        `/biosites/admin/update-background/${userId}?background=${encodeURIComponent(
          backgroundImage
        )}`,
        {}
      );
      console.log("Background updated for admin and children successfully");
    } catch (error) {
      console.error("Error updating background for admin and children:", error);
      throw error;
    }
  };

  const updateAdminAndChildrenVideoEffect = async (videoUrl: string) => {
    const role = Cookie.get("roleName");
    const userId = Cookie.get("userId");
    const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

    if (!isAdmin || !userId) {
      return;
    }

    try {
      await apiService.patch(
        `/biosites/admin/update-video/${userId}?video=${encodeURIComponent(
          videoUrl
        )}`,
        {}
      );
      console.log("Video updated for admin and children successfully");
    } catch (error) {
      console.error("Error updating video for admin and children:", error);
      throw error;
    }
  };

  // Effect for admin background update
  useEffect(() => {
    const executeAdminBackgroundUpdate = async () => {
      const role = Cookie.get("roleName");
      const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

      if (isAdmin && biosite?.backgroundImage) {
        try {
          await updateAdminAndChildrenBackground(biosite.backgroundImage);
        } catch (error) {
          console.error("Error updating admin background after login:", error);
        }
      }
    };

    // Execute when biosite data is loaded and user is admin
    if (biosite) {
      executeAdminBackgroundUpdate();
    }
  }, [biosite]);

  // Effect for admin video update
  useEffect(() => {
    const executeAdminVideoUpdate = async () => {
      const role = Cookie.get("roleName");
      const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

      if (isAdmin) {
        const videoEmbed = getVideoEmbed();
        if (videoEmbed && videoEmbed.url) {
          try {
            await updateAdminAndChildrenVideoEffect(videoEmbed.url);
          } catch (error) {
            console.error("Error updating admin video after login:", error);
          }
        }
      }
    };

    // Execute when biosite data is loaded and user is admin
    if (biosite) {
      executeAdminVideoUpdate();
    }
  }, [biosite, getVideoEmbed]);

  return (
    <div className="flex max-w-[420px] flex-wrap gap-y-5 justify-center w-full h-full transform scale-[0.9]">
      <MySite />
      <Add />
    </div>
  );
};

export default Sections;
