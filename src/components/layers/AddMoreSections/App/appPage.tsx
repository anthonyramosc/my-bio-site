import { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertCircle,
  Smartphone,
} from "lucide-react";
import { usePreview } from "../../../../context/PreviewContext";
import BackButton from "../../../shared/BackButton";
import SVGAPPLE from '../../../../assets/icons/AppleStore.svg'
import SVGGOO from '../../../../assets/icons/GooglePLay.svg'
import ElementCard from "../Components/ElementCard";

const AppPage = () => {

  const { appLinks, updateAppLink, addAppLink, removeAppLink, loading, error } = usePreview();

  const [appStoreUrl, setAppStoreUrl] = useState("");
  const [googlePlayUrl, setGooglePlayUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
      "idle"
  );
  const [saveMessage, setSaveMessage] = useState("");
  const [editingStore, setEditingStore] = useState<"appstore" | "googleplay" | null>(null);
  const [editUrl, setEditUrl] = useState("");

  useEffect(() => {
    const appStore = appLinks.find((link) => link.store === "appstore" && link.isActive === true);
    const googlePlay = appLinks.find((link) => link.store === "googleplay" && link.isActive === true);

    setAppStoreUrl(appStore?.url || "");
    setGooglePlayUrl(googlePlay?.url || "");
  }, [appLinks]);

  const handleEdit = (store: "appstore" | "googleplay") => {
    setEditingStore(store);
    setEditUrl(store === "appstore" ? appStoreUrl : googlePlayUrl);
  };

  const handleSaveEdit = async () => {
    if (!editingStore) return;

    setIsSaving(true);
    setSaveStatus("idle");
    setSaveMessage("");

    try {
      const existingLink = appLinks.find((link) => link.store === editingStore && link.isActive === true);

      if (existingLink && editUrl) {
        await updateAppLink(existingLink.id, { url: editUrl, isActive: true });
      } else if (!existingLink && editUrl) {
        await addAppLink({
          store: editingStore,
          url: editUrl,
          isActive: true,
        });
      }

      if (editingStore === "appstore") {
        setAppStoreUrl(editUrl);
      } else {
        setGooglePlayUrl(editUrl);
      }

      setEditingStore(null);
      setEditUrl("");
      setSaveStatus("success");
      setSaveMessage("Enlace actualizado correctamente");

      setTimeout(() => {
        setSaveStatus("idle");
        setSaveMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error saving app link:", error);
      setSaveStatus("error");
      setSaveMessage("Error al actualizar el enlace. Inténtalo de nuevo.");

      setTimeout(() => {
        setSaveStatus("idle");
        setSaveMessage("");
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingStore(null);
    setEditUrl("");
  };

  const handleDeleteLink = async (store: "appstore" | "googleplay") => {
    try {
      const link = appLinks.find((link) => link.store === store);
      if (link) {
        await removeAppLink(link.id);
        setSaveStatus("success");
        setSaveMessage(
            `Enlace de ${
                store === "appstore" ? "App Store" : "Google Play"
            } eliminado`
        );

        if (store === "appstore") {
          setAppStoreUrl("");
        } else {
          setGooglePlayUrl("");
        }

        setTimeout(() => {
          setSaveStatus("idle");
          setSaveMessage("");
        }, 3000);
      } else {
        if (store === "appstore") {
          setAppStoreUrl("");
        } else {
          setGooglePlayUrl("");
        }
      }
    } catch (error) {
      console.error("Error deleting app link:", error);
      setSaveStatus("error");
      setSaveMessage("Error al eliminar el enlace. Inténtalo de nuevo.");

      setTimeout(() => {
        setSaveStatus("idle");
        setSaveMessage("");
      }, 5000);
    }
  };

  const isValidUrl = (url: string, type: "appstore" | "googleplay") => {
    if (!url) return true;

    if (type === "appstore") {
      return url.includes("apps.apple.com") || url.includes("itunes.apple.com");
    } else {
      return url.includes("play.google.com");
    }
  };

  const getStoreName = (store: "appstore" | "googleplay") => {
    return store === "appstore" ? "App Store" : "Google Play";
  };

  const getStoreIcon = (store: "appstore" | "googleplay") => {
    return store === "appstore" ? SVGAPPLE : SVGGOO;
  };

  if (loading) {
    return (
        <div className="max-w-xl mx-auto p-4 text-white flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-400">Cargando enlaces de descarga...</p>
          </div>
        </div>
    );
  }

  // Edit form view
  if (editingStore) {
    return (
        <div className="w-full h-full mt-0 lg:mt-14 mb-10 max-w-md mx-auto rounded-lg">

          <div className="px-6 py-4 border-b border-gray-700 ">
            <BackButton text={`Editar ${getStoreName(editingStore)}`} />
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="text-gray-600 block mb-2" style={{ fontSize: "14px" }}>
                URL de {getStoreName(editingStore)}
              </label>
              <input
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full h-10 bg-[#FAFFF6] text-xs text-black px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
                  placeholder={
                    editingStore === "appstore"
                        ? "https://apps.apple.com/..."
                        : "https://play.google.com/store/apps/..."
                  }
                  disabled={isSaving}
              />
              {editUrl && !isValidUrl(editUrl, editingStore) && (
                  <p className="text-xs text-red-400 mt-1">
                    La URL debe ser de {getStoreName(editingStore)}
                  </p>
              )}
            </div>

            <div className="pt-4 flex gap-3">
              <button
                  onClick={handleSaveEdit}
                  disabled={!editUrl.trim() || !isValidUrl(editUrl, editingStore) || isSaving}
                  className="w-32 text-white bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
              >
                {isSaving ? (
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
                  disabled={isSaving}
                  className="w-32 text-gray-700 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="w-full h-full mt-0 lg:mt-14 mb-10 max-w-md mx-auto rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700">
          <BackButton text={"Enlaces de Descarga"} />
        </div>

        {/* Main Content */}
        <div className="p-4">
          {/* Error Message */}
          {error && (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
          )}

          {/* Success/Error Messages */}
          {saveMessage && (
              <div
                  className={`mb-4 p-3 border rounded-md flex items-center gap-2 ${
                      saveStatus === "success"
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-red-50 border-red-200 text-red-700"
                  }`}
              >
                {saveStatus === "success" ? (
                    <CheckCircle className="w-4 h-4" />
                ) : (
                    <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm">{saveMessage}</span>
              </div>
          )}

          <div className="space-y-6">
            {/* App Links Section */}
            <div>
              <h3 className="text-sm text-gray-600 font-semibold mb-3">
                Enlaces de descarga de la app (2/2)
              </h3>
              <div className="space-y-2">
                {/* App Store Link */}
                <ElementCard
                    image={getStoreIcon("appstore")}
                    title="App Store"
                    subtitle={appStoreUrl || "No configurado"}
                    onEdit={() => handleEdit("appstore")}
                    onRemove={() => handleDeleteLink("appstore")}
                    isSubmitting={isSaving}
                    isDeleting={false}
                />

                {/* Google Play Link */}
                <ElementCard
                    image={getStoreIcon("googleplay")}
                    title="Google Play"
                    subtitle={googlePlayUrl || "No configurado"}
                    onEdit={() => handleEdit("googleplay")}
                    onRemove={() => handleDeleteLink("googleplay")}
                    isSubmitting={isSaving}
                    isDeleting={false}
                />
              </div>
            </div>

            {/* Quick Actions */}
            {(!appStoreUrl || !googlePlayUrl) && (
                <div className="text-center py-4">
                  <Smartphone size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    Configura tus enlaces de descarga
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Añade los enlaces de tu app para que los usuarios puedan descargarla
                  </p>
                  <div className="flex gap-2 justify-center">
                    {!appStoreUrl && (
                        <button
                            onClick={() => handleEdit("appstore")}
                            className="text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer text-sm"
                        >
                          Configurar App Store
                        </button>
                    )}
                    {!googlePlayUrl && (
                        <button
                            onClick={() => handleEdit("googleplay")}
                            className="text-white bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition cursor-pointer text-sm"
                        >
                          Configurar Google Play
                        </button>
                    )}
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default AppPage;