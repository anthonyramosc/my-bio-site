import { useRef, useState } from "react";
import { ChevronLeft, X, ImagePlus } from "lucide-react";
import { message } from "antd";
import { uploadLinkImage } from "../../../MySite/Profile/lib/uploadImage.ts";
import LinkImage from "./LinkImage";
import type { RegularLink } from "../../../../../interfaces/PreviewContext.ts";
import type { LinkData } from "../../../../../interfaces/AdminData.ts";
import FomrField from "../../../../shared/FomrField.tsx";
import Input from "../../../../shared/Input.tsx";
import ImageInput from "../../../../shared/ImageInput.tsx";
import Button from "../../../../shared/Button.tsx";

interface LinkEditFormProps {
  link: RegularLink | LinkData;
  editTitle: string;
  editUrl: string;
  editImage: string | undefined;
  isSubmitting: boolean;
  onTitleChange: (title: string) => void;
  onUrlChange: (url: string) => void;
  onImageChange: (image: string | undefined) => void;
  onSave: () => void;
  onCancel: () => void;
}

const LinkEditForm = ({
  link,
  editTitle,
  editUrl,
  editImage,
  isSubmitting,
  onTitleChange,
  onUrlChange,
  onImageChange,
  onSave,
  onCancel,
}: LinkEditFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const validateFile = (file: File): boolean => {
    // Check file type
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

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      message.error("El archivo es demasiado grande. Tamaño máximo: 5MB");
      return false;
    }

    return true;
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      console.error("Please select an image file");
      alert("Por favor selecciona un archivo de imagen válido");
      return;
    }

    // Validar tamaño (opcional - máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error("Image size should be less than 5MB");
      alert("El tamaño de la imagen debe ser menor a 5MB");
      return;
    }

    if (!validateFile(file)) {
      return;
    }

    if (link.id) {
      try {
        setUploadingImage(true);
        console.log("Uploading image for link ID:", link.id);

        // Subir imagen usando el endpoint específico
        const imageUrl = await uploadLinkImage(file, link.id);
        console.log("Image uploaded successfully:", imageUrl);

        // Actualizar el estado local para mostrar la imagen inmediatamente
        onImageChange(imageUrl);

        console.log("Image URL set in edit state:", imageUrl);
      } catch (error) {
        console.error("Error uploading link image:", error);
        alert("Error al subir la imagen al servidor");

        // Fallback a base64 si falla la subida
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            onImageChange(reader.result);
          }
        };
        reader.readAsDataURL(file);
      } finally {
        setUploadingImage(false);
      }
    } else {
      // Si no hay ID del enlace, usar base64 como fallback
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onImageChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }

    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
  };

  return (
    <div className="w-full max-h-screen mb-10 max-w-md mx-auto rounded-lg">
      {/* Header */}
      <div className="px-4">
        <button
          onClick={onCancel}
          className="flex items-center text-gray-300 hover:text-white transition-colors cursor-pointer"
          disabled={isSubmitting}
        >
          <ChevronLeft className="w-5 h-5 mr-1 text-black" />
          <h1 className="text-lg text-black font-semibold">Editar Link</h1>
        </button>
      </div>

      {/* Form Content */}
      <div className="p-4">
        <div className="space-y-4">
          <FomrField title={"NOMBRE"}>
            <Input
              value={editTitle}
              placeholder="Nombre del enlace"
              disabled={isSubmitting}
              onChange={(e) => onTitleChange(e.target.value)}
            />
          </FomrField>
          <FomrField title={"URL"}>
            <Input
              value={editUrl}
              placeholder="https://ejemplo.com"
              disabled={isSubmitting}
              onChange={(e) => onUrlChange(e.target.value)}
            />
          </FomrField>

          <div className="flex items-center space-x-2">
            <FomrField title={"IMAGEN (opcional)"}>
              <ImageInput
                maxHeight={170}
                square
                initialSrc={editImage}
                onChange={handleImageUpload}
              />
            </FomrField>
            {uploadingImage && (
              <p className="text-sm text-blue-600 mt-1">Subiendo imagen...</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-5 max-w-[200px]">
            <Button
              onClick={onSave}
              disabled={
                isSubmitting ||
                !editTitle.trim() ||
                !editUrl.trim() ||
                uploadingImage
              }
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting || uploadingImage}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkEditForm;
