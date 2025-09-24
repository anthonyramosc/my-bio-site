import { Music } from "lucide-react";
import { useState, useEffect } from "react";
import { usePreview } from "../../../../context/PreviewContext.tsx";
import BackButton from "../../../shared/BackButton.tsx";
import ElementCard from "../Components/ElementCard.tsx";

const MusicPage = () => {
  const { getMusicEmbed, setMusicEmbed, loading } = usePreview();

  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasExistingMusic, setHasExistingMusic] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUrl, setEditUrl] = useState("");
  const [editNote, setEditNote] = useState("");

  useEffect(() => {
    const existingMusic = getMusicEmbed();
    if (existingMusic && existingMusic.url) {
      setUrl(existingMusic.url);
      setNote(existingMusic.label || "");
      setHasExistingMusic(true);
    } else {
      setHasExistingMusic(false);
    }
  }, [getMusicEmbed]);

  const handleEdit = () => {
    setEditUrl(url);
    setEditNote(note);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      setIsSubmitting(true);
      await setMusicEmbed(editUrl, editNote);
      setUrl(editUrl);
      setNote(editNote);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating music embed:", error);
      alert("Error al actualizar el embed de música");
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
      await setMusicEmbed("", "");
      setHasExistingMusic(false);
      setUrl("");
      setNote("");
    } catch (error) {
      console.error("Error deleting music embed:", error);
      alert("Error al eliminar el embed de música");
    } finally {
      setIsDeleting(false);
    }
  };

  const isValidUrl = (url: string) => {
    if (!url.trim()) return false;
    const musicPlatforms = [
      "spotify.com",
      "soundcloud.com",
      "apple.com/music",
      "music.apple.com",
      "youtube.com",
      "anchor.fm",
      "podcasts.apple.com",
      "podcasts.google.com",
    ];
    return musicPlatforms.some((platform) =>
      url.toLowerCase().includes(platform)
    );
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
              type="text"
              placeholder="https://open.spotify.com/track/..."
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              className="w-full h-10 bg-[#FAFFF6] text-xs text-black px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-200"
              disabled={isSubmitting}
            />
            {editUrl && !isValidUrl(editUrl) && (
              <p className="text-red-400 text-xs mt-1">
                Please enter a valid URL from supported platforms.
              </p>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">
              Nota (optional)
            </label>
            <input
              type="text"
              placeholder="Añade una nota o descripción sobre este music/podcast"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              className="w-full h-10 bg-[#FAFFF6] text-xs text-black px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-200"
              disabled={isSubmitting}
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button
              onClick={handleSaveEdit}
              disabled={!editUrl.trim() || !isValidUrl(editUrl) || isSubmitting}
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

    if (hasExistingMusic) {
      return (
        <ElementCard
          icon={Music}
          title={note || "Música/Podcast"}
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
        <Music size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          No hay music/podcast configurado
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Agrega un enlace de Spotify, SoundCloud u otra plataforma
        </p>
        <button
          onClick={() => setIsEditing(true)}
          className="text-white bg-purple-600 px-6 py-2 rounded-lg hover:bg-purple-700 transition cursor-pointer"
        >
          Agregar Music/Podcast
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
        <BackButton text={"Music/Podcast"} />
      </div>
      <div className="p-4 space-y-4">{renderContent()}</div>
    </div>
  );
};

export default MusicPage;
