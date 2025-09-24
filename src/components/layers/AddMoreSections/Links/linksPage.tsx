import { useState, useRef, useEffect } from "react";
import { Plus, X, Check } from "lucide-react";
import { usePreview } from "../../../../context/PreviewContext.tsx";
import { uploadLinkImage } from "../../MySite/Profile/lib/uploadImage.ts";
import { message } from "antd";
import LinkEditForm from "./Components/LinksEditForm.tsx";
import BackButton from "../../../shared/BackButton.tsx";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import LinkCard from "./Components/LinksCard.tsx";

const LinksPage = () => {
  const {
    regularLinks,
    addRegularLink,
    removeRegularLink,
    updateRegularLink,
    reorderRegularLinks,
    loading,
    error,
    refreshBiosite,
  } = usePreview();

  const [adding, setAdding] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editImage, setEditImage] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeLinks = regularLinks.filter((link) => link.isActive);

  const placeholderLinkImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f3f4f6' rx='6'/%3E%3Cpath d='M10 10h20v20H10z' fill='%23d1d5db'/%3E%3Ccircle cx='16' cy='16' r='3' fill='%239ca3af'/%3E%3Cpath d='M12 28l8-6 8 6H12z' fill='%239ca3af'/%3E%3C/svg%3E";

  const normalizeUrl = (url: string): string => {
    if (!url || typeof url !== "string") return "";

    const cleanUrl = url.trim();

    if (!cleanUrl) return "";

    if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
      return cleanUrl;
    }

    if (
      cleanUrl.startsWith("localhost") ||
      cleanUrl.startsWith("127.0.0.1") ||
      cleanUrl.match(/^192\.168\.\d+\.\d+/) ||
      cleanUrl.match(/^10\.\d+\.\d+\.\d+/)
    ) {
      return `http://${cleanUrl}`;
    }
    return `https://${cleanUrl}`;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const normalizedUrl = normalizeUrl(url);
      new URL(normalizedUrl);
      return true;
    } catch {
      return false;
    }
  };

  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== "string") return false;

    if (url.startsWith("data:")) {
      const dataUrlRegex = /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/]+=*$/;
      const isValid = dataUrlRegex.test(url);
      if (isValid) {
        const base64Part = url.split(",")[1];
        return base64Part && base64Part.length > 10;
      }
      return false;
    }

    try {
      const urlObj = new URL(url);
      const isHttps = ["http:", "https:"].includes(urlObj.protocol);
      const hasValidExtension =
        /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) ||
        url.includes("/img/") ||
        url.includes("image-");

      return isHttps && (hasValidExtension || !urlObj.pathname.includes("."));
    } catch (error) {
      console.warn("Invalid URL:", url, error);
      return false;
    }
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      message.error(
        "Formato de archivo no válido. Solo se permiten: JPG, PNG, WebP, GIF"
      );
      return false;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      message.error("El archivo es demasiado grande. Tamaño máximo: 5MB");
      return false;
    }

    return true;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      console.log("No file selected");
      return;
    }
    console.log("File selected:", {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
    });

    if (!validateFile(file)) {
      e.target.value = "";
      return;
    }

    if (editingIndex !== null) {
      const linkToUpdate = activeLinks[editingIndex];

      if (linkToUpdate.id) {
        try {
          setUploadingImage(true);

          const loadingMessage = message.loading(
            "Subiendo imagen del enlace...",
            0
          );

          const imageUrl = await uploadLinkImage(file, linkToUpdate.id);

          loadingMessage();

          if (!isValidImageUrl(imageUrl)) {
            throw new Error("La URL de la imagen subida no es válida");
          }

          setEditImage(imageUrl);

          message.success("Imagen del enlace actualizada correctamente");
        } catch (error) {
          let errorMessage = "Error al subir la imagen del enlace";
          if (error instanceof Error) {
            errorMessage = error.message;
          }
          message.error(errorMessage);

          console.log("Falling back to base64...");
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") {
              setEditImage(reader.result);
              message.info(
                "Imagen cargada localmente (se guardará al confirmar)"
              );
            }
          };
          reader.onerror = () => {
            message.error("Error al procesar la imagen");
          };
          reader.readAsDataURL(file);
        } finally {
          setUploadingImage(false);
        }
      } else {
        console.log("No link ID, using base64 fallback");
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            setEditImage(reader.result);
            message.info("Imagen cargada localmente");
          }
        };
        reader.onerror = () => {
          message.error("Error al procesar la imagen");
        };
        reader.readAsDataURL(file);
      }
    } else {
      console.log("New link, using base64");
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setEditImage(reader.result);
          message.info("Imagen cargada localmente");
        }
      };
      reader.onerror = () => {
        message.error("Error al procesar la imagen");
      };
      reader.readAsDataURL(file);
    }

    e.target.value = "";
  };

  useEffect(() => {
    console.log("Active links changed:", activeLinks);
    activeLinks.forEach((link, index) => {
      console.log(`Link ${index}:`, {
        id: link.id,
        title: link.title,
        image: editImage,
        imageValid: isValidImageUrl(link.image),
      });
    });
  }, [activeLinks, editImage]);

  const handleConfirmAdd = async () => {
    if (newUrl.trim()) {
      try {
        setIsSubmitting(true);

        const normalizedUrl = normalizeUrl(newUrl);

        if (!isValidUrl(normalizedUrl)) {
          message.error("Por favor ingresa una URL válida");
          return;
        }

        const maxOrderIndex = Math.max(
          ...activeLinks.map((link) => link.orderIndex),
          -1
        );

        const newLink = {
          title: newUrl,
          url: normalizedUrl,
          icon: undefined,
          image: undefined,
          orderIndex: maxOrderIndex + 1,
          isActive: true,
        };

        await addRegularLink(newLink);
        setNewUrl("");
        setAdding(false);
        console.log(
          "Link added successfully with normalized URL:",
          normalizedUrl
        );
      } catch (error) {
        console.error("Error adding link:", error);
        message.error("Error al agregar el enlace");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsSubmitting(true);
      await removeRegularLink(id);
      console.log("Link deleted successfully");
    } catch (error) {
      console.error("Error deleting link:", error);
      message.error("Error al eliminar el enlace");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (index: number) => {
    const link = activeLinks[index];
    setEditingIndex(index);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditImage(link.image);
    console.log("Opening edit for link:", link);
  };

  const handleSaveEdit = async () => {
    if (editingIndex === null) return;

    try {
      setIsSubmitting(true);

      const normalizedUrl = normalizeUrl(editUrl);

      if (!isValidUrl(normalizedUrl)) {
        message.error("Por favor ingresa una URL válida");
        return;
      }

      const linkToUpdate = activeLinks[editingIndex];

      const updateData = {
        title: editTitle,
        url: normalizedUrl,
        image: editImage,
      };

      await updateRegularLink(linkToUpdate.id, updateData);

      await refreshBiosite();

      setEditingIndex(null);
      setEditTitle("");
      setEditUrl("");
      setEditImage(editImage);

      message.success("Enlace actualizado correctamente");
    } catch (error) {
      console.error("Error updating link:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditTitle("");
    setEditUrl("");
    setEditImage(undefined);
  };

  const handleCancelAdd = () => {
    setAdding(false);
    setNewUrl("");
  };

  const getSafeImageUrl = (imageUrl: string | null | undefined): string => {
    return isValidImageUrl(imageUrl) ? imageUrl! : placeholderLinkImage;
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const newLinks = Array.from(activeLinks);
    const [reorderedItem] = newLinks.splice(result.source.index, 1);
    newLinks.splice(result.destination.index, 0, reorderedItem);

    const reorderedLinks = newLinks.map((link, index) => ({
      ...link,
      orderIndex: index,
    }));

    try {
      await reorderRegularLinks(reorderedLinks);
    } catch (error) {
      console.error("Error reordering links:", error);
      message.error("Error al reordenar los enlaces");
    }
  };

  if (loading && activeLinks.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-4 text-white flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">Cargando enlaces...</p>
        </div>
      </div>
    );
  }

  if (editingIndex !== null) {
    const linkToEdit = activeLinks[editingIndex];
    return (
      <LinkEditForm
        link={linkToEdit}
        editTitle={editTitle}
        editUrl={editUrl}
        editImage={editImage}
        isSubmitting={isSubmitting}
        onTitleChange={setEditTitle}
        onUrlChange={setEditUrl}
        onImageChange={setEditImage}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div className="w-full h-full mt mb-10 max-w-md mx-auto rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 ">
        <BackButton text={"Links"} />
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Active Links Section */}
          {activeLinks.length > 0 && (
            <div>
              <h3 className="text-sm text-gray-600 font-semibold mb-3">
                Enlaces activos ({activeLinks.length})
              </h3>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="links-list">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {activeLinks.map((link, index) => (
                        <Draggable
                          key={link.id}
                          draggableId={link.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <LinkCard
                                id={link.id}
                                title={link.title}
                                url={link.url}
                                image={link.image}
                                onEdit={() => handleOpenEdit(index)}
                                onRemove={() => handleDelete(link.id)}
                                isSubmitting={isSubmitting}
                                dragHandleProps={provided.dragHandleProps}
                                getSafeImageUrl={getSafeImageUrl}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          )}

          {/* Add New Link Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">
              Agregar enlace
            </h3>

            {adding ? (
              <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-300">
                <input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="Ingresa una URL (ej: visitaecuador.com)"
                  className="flex-1 bg-transparent text-black placeholder-gray-400 focus:outline-none"
                  autoFocus
                  disabled={isSubmitting}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleConfirmAdd();
                    }
                  }}
                />
                <button
                  onClick={handleConfirmAdd}
                  disabled={!newUrl.trim() || isSubmitting}
                  className="p-2 text-green-500 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={handleCancelAdd}
                  disabled={isSubmitting}
                  className="p-2 text-red-500 hover:text-red-600 disabled:opacity-50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAdding(true)}
                disabled={isSubmitting}
                className="w-full cursor-pointer p-4 border-2 border-dashed border-gray-300 bg-white rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center"
              >
                <Plus size={20} className="mb-1" />
                <span className="text-sm">Agregar enlace</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleImageUpload}
        style={{ display: "none" }}
        multiple={false}
      />
    </div>
  );
};

export default LinksPage;
