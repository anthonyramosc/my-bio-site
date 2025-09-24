import { Instagram } from "lucide-react";
import SVG from "../../../../../public/post.svg"
import { useState, useEffect } from "react";
import { usePreview } from "../../../../context/PreviewContext.tsx";
import BackButton from "../../../shared/BackButton.tsx";
import ElementCard from "../Components/ElementCard.tsx";

const PostPage = () => {
  const { getSocialPost, setSocialPost, loading } = usePreview();

  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasExistingPost, setHasExistingPost] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUrl, setEditUrl] = useState("");
  const [editNote, setEditNote] = useState("");

  useEffect(() => {
    const existingPost = getSocialPost();
    if (existingPost && existingPost.url) {
      setUrl(existingPost.url);
      setNote(existingPost.label || "");
      setHasExistingPost(true);
    } else {
      setHasExistingPost(false);
    }
  }, [getSocialPost]);

  const handleEdit = () => {
    setEditUrl(url);
    setEditNote(note);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      setIsSubmitting(true);
      await setSocialPost(editUrl, editNote || undefined);
      setUrl(editUrl);
      setNote(editNote);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating social post:", error);
      alert("Error al actualizar el post social");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditUrl("");
    setEditNote("");
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await setSocialPost("", "");
      setHasExistingPost(false);
      setUrl("");
      setNote("");
    } catch (error) {
      console.error("Error deleting social post:", error);
      alert("Error al eliminar el post social");
    } finally {
      setIsDeleting(false);
    }
  };

  const isValidUrl = (url: string) => {
    if (!url.trim()) return false;
    const socialPlatforms = [
      "instagram.com",
      "facebook.com",
      "twitter.com",
      "x.com",
      "tiktok.com",
      "linkedin.com",
      "youtube.com",
      "threads.net",
      "snapchat.com",
    ];
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      return socialPlatforms.some((platform) =>
        url.toLowerCase().includes(platform)
      );
    } catch {
      return false;
    }
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <div className="p-4 space-y-4">
          <div>
            <label
              className="text-gray-600 block mb-2"
              style={{ fontSize: "14px" }}
            >
              URL
            </label>
            <input
              type="url"
              className="w-full h-10 bg-[#FAFFF6] text-xs text-black px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
              placeholder="https://instagram.com/p/..."
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              disabled={isSubmitting}
            />
            {editUrl.trim() && !isValidUrl(editUrl) && (
              <p className="text-xs text-red-400 mt-1">
                Please enter a valid social media URL
              </p>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">
              Nota (optional)
            </label>
            <textarea
              className="w-full bg-[#FAFFF6] rounded-md px-4 py-3 text-xs text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none border border-gray-200"
              placeholder="Añade un titulo para este post"
              rows={3}
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              disabled={isSubmitting}
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {editNote.length}/100 characters
            </p>
          </div>
          <div className="pt-4 flex gap-3">
            <button
              onClick={handleSaveEdit}
              disabled={!editUrl.trim() || isSubmitting}
              className="w-32 text-white bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isSubmitting}
              className="w-32 text-gray-700 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      );
    }

    if (hasExistingPost) {
      return (
        <ElementCard
          icon={SVG}
          title={note || "Post Social"}
          subtitle={url}
          onEdit={handleEdit}
          onRemove={handleDelete}
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
        />
      );
    }

    return (
      <div className="text-center py-8">
        <Instagram size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          No hay post social configurado
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Agrega un enlace de Instagram, Twitter u otra plataforma social
        </p>
        <button
          onClick={() => setIsEditing(true)}
          className="text-white bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          Agregar Post Social
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-4 text-white flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full mt-0 lg:mt-14 mb-10 max-w-md mx-auto rounded-lg">
      <div className="px-6 py-4 border-b border-gray-700">
        <BackButton text={"Social Post"} />
      </div>
      <div className="p-4 space-y-4">{renderContent()}</div>
    </div>
  );
};

export default PostPage;
