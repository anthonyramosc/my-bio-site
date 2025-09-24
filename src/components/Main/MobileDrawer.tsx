import React, { useState } from "react";
import { GripVertical, Edit3 } from "lucide-react";
import { usePreview } from "../../context/PreviewContext.tsx";
import { useSectionsContext } from "../../context/SectionsContext.tsx";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";

interface SectionsWithDrawerInteractionProps {
  onSubsectionClick: (section: string) => void;
}

const SectionsWithDrawerInteraction: React.FC<
  SectionsWithDrawerInteractionProps
> = ({ onSubsectionClick }) => {
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

  // Edit mode and drag states
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Filter active links (same logic as MySite.tsx)
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

  const profileSection = visibleSections.find(
    (section) => section.titulo === "Profile"
  );
  const draggableSections = visibleSections.filter(
    (section) => section.titulo !== "Profile"
  );

  const mySiteSections = [
    {
      key: "profile",
      title: "Perfil",
      icon: (
        <svg
          width="200"
          height="200"
          viewBox="0 0 50 51"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 12.5C6 9.73858 8.23858 7.5 11 7.5H38C40.7614 7.5 43 9.73858 43 12.5V39.5C43 42.2614 40.7614 44.5 38 44.5H11C8.23858 44.5 6 42.2614 6 39.5V12.5Z"
            fill="#427AFE"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M25 17.5C23.6008 17.4997 22.2259 17.8665 21.0127 18.5636C19.7995 19.2608 18.7904 20.2639 18.086 21.473C17.3817 22.682 17.0067 24.0546 16.9987 25.4538C16.9906 26.8531 17.3497 28.2299 18.04 29.447C18.5066 28.8406 19.1064 28.3496 19.7931 28.012C20.4797 27.6744 21.2348 27.4992 22 27.5H28C28.7652 27.4992 29.5203 27.6744 30.2069 28.012C30.8936 28.3496 31.4934 28.8406 31.96 29.447C32.6503 28.2299 33.0094 26.8531 33.0013 25.4538C32.9933 24.0546 32.6183 22.682 31.914 21.473C31.2096 20.2639 30.2005 19.2608 28.9873 18.5636C27.7741 17.8665 26.3992 17.4997 25 17.5ZM32.943 31.576C33.0683 31.4127 33.1883 31.2453 33.303 31.074C34.4116 29.4267 35.0026 27.4856 35 25.5C35 19.977 30.523 15.5 25 15.5C19.477 15.5 15 19.977 15 25.5C14.9969 27.6968 15.72 29.8329 17.057 31.576L17.052 31.594L17.407 32.007C18.3449 33.1035 19.5094 33.9836 20.8202 34.5866C22.1311 35.1897 23.5571 35.5013 25 35.5C25.216 35.5 25.4307 35.4933 25.644 35.48C27.4484 35.3662 29.1877 34.7629 30.675 33.735C31.3863 33.2443 32.031 32.6635 32.593 32.007L32.948 31.594L32.943 31.576ZM25 19.5C24.2044 19.5 23.4413 19.8161 22.8787 20.3787C22.3161 20.9413 22 21.7043 22 22.5C22 23.2956 22.3161 24.0587 22.8787 24.6213C23.4413 25.1839 24.2044 25.5 25 25.5C25.7956 25.5 26.5587 25.1839 27.1213 24.6213C27.6839 24.0587 28 23.2956 28 22.5C28 21.7043 27.6839 20.9413 27.1213 20.3787C26.5587 19.8161 25.7956 19.5 25 19.5Z"
            fill="white"
          />
        </svg>
      ),
      bgColor: "#427AFE",
    },
    {
      key: "social",
      title: "Social",
      icon: (
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
      ),
      bgColor: "#0EBBAA",
    },
    {
      key: "VCard",
      title: "VCard",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="white"
        >
          <g fillRule="evenodd">
            <path d="M13 14h1v1h-1v-1Zm1 1h1v1h-1v-1Zm0 1h1v1h-1v-1Zm2 0h1v1h-1v-1Zm0 1h1v1h-1v-1Zm-3-1h1v1h-1v-1Zm2 0h1v1h-1v-1Zm0 1h1v1h-1v-1Zm3-1h1v1h-1v-1Zm0-1h1v1h-1v-1Zm1-1h1v1h-1v-1Zm-2 2h1v1h-1v-1Zm0 1h1v1h-1v-1Zm-1 1h1v1h-1v-1Zm-1 0h1v1h-1v-1Zm2 0h1v1h-1v-1Zm1 0h1v1h-1v-1Zm-2 1h1v1h-1v-1Zm-2 0h1v1h-1v-1Zm1 0h1v1h-1v-1Zm-2 0h1v1h-1v-1Zm0 1h1v1h-1v-1Zm1 1h1v1h-1v-1Zm1 0h1v1h-1v-1Zm2 0h1v1h-1v-1Zm1 0h1v1h-1v-1Zm-1-2h1v1h-1v-1Zm1 0h1v1h-1v-1Zm1-1h1v1h-1v-1Zm0-1h1v1h-1v-1Zm0 3h1v1h-1v-1Zm0-1h1v1h-1v-1Zm1-1h1v1h-1v-1Zm0-1h1v1h-1v-1Zm1 3h1v1h-1v-1Zm0-2h1v1h-1v-1Zm0 1h1v1h-1v-1Zm-2-3h1v1h-1v-1Zm-6 1h1v1h-1v-1Zm-1 0h1v1h-1v-1Zm0 1h1v1h-1v-1Zm2 0h1v1h-1v-1Zm-3 0h1v1h-1v-1Zm2 0h1v1h-1v-1Zm-2 1h1v1h-1v-1Zm0 1h1v1h-1v-1Zm0-19h1v1h-1V1Zm1 1h1v1h-1V2Zm-1 2h1v1h-1V4Zm1 1h1v1h-1V5Zm-1 1h1v1h-1V6Zm1 0h1v1h-1V6Zm0 1h1v1h-1V7Zm0 1h1v1h-1V8Zm-1 1h1v1h-1V9Zm1 0h1v1h-1V9Zm-1 1h1v1h-1v-1ZM1 11h1v1H1v-1Zm1 1h1v1H2v-1Zm2-1h1v1H4v-1Zm0 1h1v1H4v-1Zm1-1h1v1H5v-1Zm1 1h1v1H6v-1Zm1-1h1v1H7v-1Zm1 1h1v1H8v-1Zm0-1h1v1H8v-1Zm1 0h1v1H9v-1Zm1 0h1v1h-1v-1Zm1 1h1v1h-1v-1Zm2 0h1v1h-1v-1Zm1-1h1v1h-1v-1Zm1 0h1v1h-1v-1Zm1 0h1v1h-1v-1Zm-1 2h1v1h-1v-1Zm-2 9h1v1h-1v-1Zm-1 0h1v1h-1v-1Zm0-9h1v1h-1v-1Zm-1 0h1v1h-1v-1Zm0 1h1v1h-1v-1Zm0 1h1v1h-1v-1Zm11-1h1v1h-1v-1Zm-1 1h1v1h-1v-1Zm1 2h1v1h-1v-1Zm-5-4h1v1h-1v-1Zm1-1h1v1h-1v-1Zm4 0h1v1h-1v-1Zm0 1h1v1h-1v-1Zm-1 0h1v1h-1v-1Zm1 8h1v1h-1v-1Zm-1 1h1v1h-1v-1Zm-2 0h1v1h-1v-1Zm3 0h1v1h-1v-1Z" />
            <path
              stroke="white"
              strokeWidth="2"
              d="M15 2h7v7h-7V2ZM2 2h7v7H2V2Zm0 13h7v7H2v-7ZM18 5h1v1h-1V5ZM5 5h1v1H5V5Zm0 13h1v1H5v-1Z"
            />
          </g>
        </svg>
      ),
      bgColor: "#9B59B6", // Cambiado de 'white' a un color púrpura
      borderColor: "#9B59B6", // Agregado border color consistente
    },
  ];

  // Get section icon and color
  const getSectionIcon = (sectionTitle: string) => {
    const sectionMap: {
      [key: string]: {
        icon: React.ReactNode;
        bgColor: string;
        borderColor?: string;
      };
    } = {
      Social: {
        icon: mySiteSections[1].icon,
        bgColor: mySiteSections[1].bgColor,
      },
      VCard: {
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="white"
          >
            <g fillRule="evenodd">
              <path d="M13 14h1v1h-1v-1Zm1 1h1v1h-1v-1Zm0 1h1v1h-1v-1Zm2 0h1v1h-1v-1Zm0 1h1v1h-1v-1Zm-3-1h1v1h-1v-1Zm2 0h1v1h-1v-1Zm0 1h1v1h-1v-1Zm3-1h1v1h-1v-1Zm0-1h1v1h-1v-1Zm1-1h1v1h-1v-1Zm-2 2h1v1h-1v-1Zm0 1h1v1h-1v-1Zm-1 1h1v1h-1v-1Zm-1 0h1v1h-1v-1Zm2 0h1v1h-1v-1Zm1 0h1v1h-1v-1Zm-2 1h1v1h-1v-1Zm-2 0h1v1h-1v-1Zm1 0h1v1h-1v-1Zm-2 0h1v1h-1v-1Zm0 1h1v1h-1v-1Zm1 1h1v1h-1v-1Zm1 0h1v1h-1v-1Zm2 0h1v1h-1v-1Zm1 0h1v1h-1v-1Zm-1-2h1v1h-1v-1Zm1 0h1v1h-1v-1Zm1-1h1v1h-1v-1Zm0-1h1v1h-1v-1Zm0 3h1v1h-1v-1Zm0-1h1v1h-1v-1Zm1-1h1v1h-1v-1Zm0-1h1v1h-1v-1Zm1 3h1v1h-1v-1Zm0-2h1v1h-1v-1Zm0 1h1v1h-1v-1Zm-2-3h1v1h-1v-1Zm-6 1h1v1h-1v-1Zm-1 0h1v1h-1v-1Zm0 1h1v1h-1v-1Zm2 0h1v1h-1v-1Zm-3 0h1v1h-1v-1Zm2 0h1v1h-1v-1Zm-2 1h1v1h-1v-1Zm0 1h1v1h-1v-1Zm0-19h1v1h-1V1Zm1 1h1v1h-1V2Zm-1 2h1v1h-1V4Zm1 1h1v1h-1V5Zm-1 1h1v1h-1V6Zm1 0h1v1h-1V6Zm0 1h1v1h-1V7Zm0 1h1v1h-1V8Zm-1 1h1v1h-1V9Zm1 0h1v1h-1V9Zm-1 1h1v1h-1v-1ZM1 11h1v1H1v-1Zm1 1h1v1H2v-1Zm2-1h1v1H4v-1Zm0 1h1v1H4v-1Zm1-1h1v1H5v-1Zm1 1h1v1H6v-1Zm1-1h1v1H7v-1Zm1 1h1v1H8v-1Zm0-1h1v1H8v-1Zm1 0h1v1H9v-1Zm1 0h1v1h-1v-1Zm1 1h1v1h-1v-1Zm2 0h1v1h-1v-1Zm1-1h1v1h-1v-1Zm1 0h1v1h-1v-1Zm1 0h1v1h-1v-1Zm-1 2h1v1h-1v-1Zm-2 9h1v1h-1v-1Zm-1 0h1v1h-1v-1Zm0-9h1v1h-1v-1Zm-1 0h1v1h-1v-1Zm0 1h1v1h-1v-1Zm0 1h1v1h-1v-1Zm11-1h1v1h-1v-1Zm-1 1h1v1h-1v-1Zm1 2h1v1h-1v-1Zm-5-4h1v1h-1v-1Zm1-1h1v1h-1v-1Zm4 0h1v1h-1v-1Zm0 1h1v1h-1v-1Zm-1 0h1v1h-1v-1Zm1 8h1v1h-1v-1Zm-1 1h1v1h-1v-1Zm-2 0h1v1h-1v-1Zm3 0h1v1h-1v-1Z" />
              <path
                stroke="white"
                strokeWidth="2"
                d="M15 2h7v7h-7V2ZM2 2h7v7H2V2Zm0 13h7v7H2v-7ZM18 5h1v1h-1V5ZM5 5h1v1H5V5Zm0 13h1v1H5v-1Z"
              />
            </g>
          </svg>
        ),
        bgColor: "#9B59B6",
      },
      Links: {
        icon: (
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
        ),
        bgColor: "#6F4FC1",
      },
      "Link de mi App": {
        icon: (
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
        ),
        bgColor: "green-600",
      },
      Contactame: {
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="white"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488" />
          </svg>
        ),
        bgColor: "green-600",
      },
      "Music / Podcast": {
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        ),
        bgColor: "purple-600",
      },
      "Social Post": {
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="m16 11.37 A4 4 0 1 1 12.63 8 A4 4 0 0 1 16 11.37 z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        ),
        bgColor: "pink-600",
      },
      Video: {
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
        ),
        bgColor: "blue-600",
      },
    };

    return sectionMap[sectionTitle] || { icon: null, bgColor: "gray-500" };
  };

  // Drag handlers using react-beautiful-dnd (same as MySite.tsx)
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

  // Check which sections are visible in MySite (same as addMore.tsx)
  const isSocialVisible = visibleSections.some(
    (section) => section.titulo === "Social"
  );

  // Helper function to handle navigation for "Add More Sections"
  const handleAddMoreSectionClick = (sectionKey: string) => {
    // Use the drawer navigation instead of router navigation
    onSubsectionClick(sectionKey);
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="max-w-2xl mx-auto">
          <div className="text-center text-gray-500">Loading sections...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-2xl mx-auto">
        {/* Header with Edit button */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-500 text-xl font-medium">My Site</h3>
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
              isEditMode
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Edit3 size={14} />
            <span className="text-sm">{isEditMode ? "Hecho" : "Edit"}</span>
          </button>
        </div>

        {/* My Site Sections with Drag & Drop */}
        <DragDropContext
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        >
          <div className="space-y-3">
            {/* Profile Card - Always first, not draggable (same as MySite.tsx) */}
            {profileSection && (
              <div
                onClick={() => !isEditMode && onSubsectionClick("profile")}
                className={`bg-[#FAFFF6] rounded-lg p-4 flex items-center space-x-3 transition-colors ${
                  !isEditMode
                    ? "cursor-pointer hover:bg-gray-50"
                    : "cursor-default"
                }`}
              >
                <div
                  className={`w-8 h-8 bg-[#427AFE] rounded-lg flex items-center justify-center`}
                >
                  {mySiteSections[0].icon}
                </div>
                <span className="text-black font-medium flex-1">Perfil</span>
              </div>
            )}

            {/* Draggable sections using react-beautiful-dnd */}
            <Droppable droppableId="mobile-sections" direction="vertical">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-3 ${
                    snapshot.isDraggingOver && isEditMode
                      ? "bg-blue-50/30 rounded-lg p-2"
                      : ""
                  }`}
                >
                  {draggableSections.map((section, index) => {
                    const { icon, bgColor, borderColor } = getSectionIcon(
                      section.titulo
                    );
                    const displayTitle =
                      section.titulo === "Link de mi App"
                        ? "Link de mi App"
                        : section.titulo;

                    return (
                      <Draggable
                        key={section.id}
                        draggableId={section.id.toString()}
                        index={index}
                        isDragDisabled={!isEditMode}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            onClick={() =>
                              !isEditMode &&
                              !snapshot.isDragging &&
                              onSubsectionClick(
                                section.titulo
                                  .toLowerCase()
                                  .replace(/\s+/g, "")
                                  .replace("linkdemiapp", "app")
                                  .replace("contactame", "whatsapp")
                                  .replace("socialpost", "post")
                                  .replace("music/podcast", "music")
                              )
                            }
                            className={`
                                                            group relative bg-[#FAFFF6] rounded-lg p-4 flex items-center space-x-3 transition-all duration-200
                                                            ${
                                                              !isEditMode
                                                                ? "cursor-pointer hover:bg-gray-50"
                                                                : "cursor-default"
                                                            }
                                                            ${
                                                              snapshot.isDragging
                                                                ? "opacity-50 scale-95 shadow-lg z-50"
                                                                : ""
                                                            }
                                                            ${
                                                              isDragging &&
                                                              !snapshot.isDragging
                                                                ? "opacity-75"
                                                                : ""
                                                            }
                                                        `}
                          >
                            {/* Drag handle - only visible in edit mode */}
                            {isEditMode && (
                              <div
                                {...provided.dragHandleProps}
                                className="flex items-center justify-center w-6 h-6 cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical
                                  size={16}
                                  className="text-gray-400"
                                />
                              </div>
                            )}

                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                bgColor.startsWith("#") ? "" : `bg-${bgColor}`
                              }`}
                              style={
                                bgColor.startsWith("#")
                                  ? { backgroundColor: bgColor }
                                  : {}
                              }
                              {...(borderColor
                                ? {
                                    style: {
                                      border: `1px solid ${borderColor}`,
                                      backgroundColor: bgColor.startsWith("#")
                                        ? bgColor
                                        : undefined,
                                    },
                                  }
                                : {})}
                            >
                              {icon}
                            </div>
                            <span className="text-black font-medium flex-1">
                              {displayTitle}
                            </span>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>

        {/* Add More Sections - Modified to use drawer navigation */}
        <div className="mt-8">
          <h3 className="text-gray-400 text-lg font-medium mb-6">
            Add More Sections
          </h3>
          <div className="space-y-3">
            {/* Show Social component only when NOT visible in MySite */}
            {!isSocialVisible && (
              <div
                onClick={() => handleAddMoreSectionClick("social")}
                className="bg-[#FAFFF6] rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#0EBBAA] rounded-lg flex items-center justify-center">
                    {mySiteSections[1].icon}
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

            {/* Links Section */}
            <div
              onClick={() => handleAddMoreSectionClick("links")}
              className="bg-[#FAFFF6] rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
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

            {/* App Section */}
            <div
              onClick={() => handleAddMoreSectionClick("app")}
              className="bg-[#FAFFF6] rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
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

            {/* WhatsApp Section */}
            <div
              onClick={() => handleAddMoreSectionClick("whatsapp")}
              className="bg-[#FAFFF6] rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
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
                  <div className="text-gray-400 text-sm">WhatsAppeame</div>
                </div>
              </div>
              <div className="w-6 h-6 border border-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-green-600 hover:border-green-600 transition-colors">
                <span className="text-black text-sm hover:text-white">+</span>
              </div>
            </div>

            {/* Video Section */}
            <div
              onClick={() => handleAddMoreSectionClick("videos")}
              className="bg-[#FAFFF6] rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect
                      x="1"
                      y="5"
                      width="15"
                      height="14"
                      rx="2"
                      ry="2"
                    ></rect>
                  </svg>
                </div>
                <div>
                  <div className="text-black font-medium">Video</div>
                  <div className="text-gray-400 text-sm">
                    Añade un video de Youtube que quieras{" "}
                  </div>
                </div>
              </div>
              <div className="w-6 h-6 border border-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-blue-600 hover:border-blue-600 transition-colors">
                <span className="text-black text-sm hover:text-white">+</span>
              </div>
            </div>

            {/* Music Section */}
            <div
              onClick={() => handleAddMoreSectionClick("music")}
              className="bg-[#FAFFF6] rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                </div>
                <div>
                  <div className="text-black font-medium">Music / Podcast</div>
                  <div className="text-gray-400 text-sm">Añade Musica</div>
                </div>
              </div>
              <div className="w-6 h-6 border border-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-purple-600 hover:border-purple-600 transition-colors">
                <span className="text-black text-sm hover:text-white">+</span>
              </div>
            </div>

            {/* Social Post Section */}
            <div
              onClick={() => handleAddMoreSectionClick("post")}
              className="bg-[#FAFFF6] rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="m16 11.37 A4 4 0 1 1 12.63 8 A4 4 0 0 1 16 11.37 z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
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
        </div>
      </div>
    </div>
  );
};

export default SectionsWithDrawerInteraction;
