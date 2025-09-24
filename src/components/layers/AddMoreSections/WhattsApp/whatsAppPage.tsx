import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Phone,
  MessageCircle,
} from "lucide-react";
import { usePreview } from "../../../../context/PreviewContext";
import { WhatsAppOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import BackButton from "../../../shared/BackButton";

const WhatsAppPage = () => {
  const {
    biosite,
    whatsAppLinks,
    addWhatsAppLink,
    updateWhatsAppLink,
    removeWhatsAppLink,
    loading,
    error,
  } = usePreview();

  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate("/sections");
  };

  const getActiveApiWhatsAppLinks = () => {
    return whatsAppLinks.filter(
      (link) =>
        link.isActive &&
        link.phone &&
        link.message &&
        link.phone.trim() !== "" &&
        link.message.trim() !== ""
    );
  };

  const activeApiLinks = getActiveApiWhatsAppLinks();

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [saveMessage, setSaveMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [description, setDescription] = useState("");

  const clearForm = () => {
    setPhone("");
    setMessage("");
    setDescription("");
    setEditingLink(null);
    setShowForm(false);
  };

  const handleNewLink = () => {
    clearForm();
    setShowForm(true);
  };

  const handleEditLink = (link: any) => {
    setEditingLink(link);
    setPhone(link.phone || "");
    setMessage(link.message || "");
    setDescription(link.description || "");
    setShowForm(true);
  };

  const isValidPhoneNumber = (phoneNumber: string): boolean => {
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, "");
    return /^(\+?\d{10,15})$/.test(cleanPhone);
  };

  const cleanPhoneNumber = (phoneNumber: string): string => {
    let cleaned = phoneNumber.replace(/[^\d+]/g, "");

    if (!cleaned.startsWith("+")) {
      if (cleaned.startsWith("0")) {
        cleaned = "+593" + cleaned.substring(1);
      } else if (cleaned.length === 9 || cleaned.length === 10) {
        cleaned = "+593" + cleaned;
      } else if (!cleaned.startsWith("+")) {
        cleaned = "+" + cleaned;
      }
    }

    return cleaned;
  };

  const handleSave = async () => {
    if (!biosite?.id) {
      setSaveStatus("error");
      setSaveMessage("Error: No se encontró el biosite");
      return;
    }

    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();
    const trimmedDescription = description.trim();

    if (!trimmedPhone) {
      setSaveStatus("error");
      setSaveMessage("Por favor, ingresa un número de teléfono");
      setTimeout(() => setSaveStatus("idle"), 3000);
      return;
    }

    if (!isValidPhoneNumber(trimmedPhone)) {
      setSaveStatus("error");
      setSaveMessage(
        "Por favor, ingresa un número de teléfono válido (ej: +593986263432)"
      );
      setTimeout(() => setSaveStatus("idle"), 3000);
      return;
    }

    if (!trimmedMessage) {
      setSaveStatus("error");
      setSaveMessage("Por favor, ingresa un mensaje predeterminado");
      setTimeout(() => setSaveStatus("idle"), 3000);
      return;
    }

    if (!trimmedDescription) {
      setSaveStatus("error");
      setSaveMessage("Por favor, ingresa una descripción para el enlace");
      setTimeout(() => setSaveStatus("idle"), 3000);
      return;
    }

    setIsSaving(true);
    setSaveStatus("idle");
    setSaveMessage("");

    try {
      const cleanPhone = cleanPhoneNumber(trimmedPhone);

      if (editingLink) {
        console.log("Updating WhatsApp link:", editingLink.id);
        await updateWhatsAppLink(editingLink.id, {
          phone: cleanPhone,
          message: trimmedMessage,
          description: trimmedDescription,
          isActive: true,
        });
        setSaveMessage("Enlace de WhatsApp actualizado correctamente");
      } else {
        console.log("Creating new WhatsApp link");
        await addWhatsAppLink({
          phone: cleanPhone,
          message: trimmedMessage,
          description: trimmedDescription,
          isActive: true,
        });
        setSaveMessage("Enlace de WhatsApp creado correctamente");
      }

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
      clearForm();
    } catch (error) {
      console.error("Error saving WhatsApp link:", error);
      setSaveStatus("error");
      setSaveMessage("Error al guardar el enlace. Inténtalo de nuevo.");
      setTimeout(() => setSaveStatus("idle"), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (linkId: string, description: string) => {
    setIsSaving(true);
    try {
      console.log("Deleting WhatsApp link:", linkId);
      await removeWhatsAppLink(linkId);

      setSaveStatus("success");
      setSaveMessage("Enlace de WhatsApp eliminado correctamente");
      setTimeout(() => setSaveStatus("idle"), 3000);
      setTimeout(() => {
        window.location.reload();
      }, 50);
    } catch (error) {
      console.error("Error deleting WhatsApp link:", error);
      setSaveStatus("error");
      setSaveMessage("Error al eliminar el enlace");
      setTimeout(() => setSaveStatus("idle"), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = () => {
    if (!editingLink) {
      return (
        phone.trim() !== "" ||
        message.trim() !== "" ||
        description.trim() !== ""
      );
    }

    const cleanCurrentPhone = cleanPhoneNumber(phone.trim());
    return (
      cleanCurrentPhone !== editingLink.phone ||
      message.trim() !== editingLink.message ||
      description.trim() !== (editingLink.description || "")
    );
  };

  return (
    <div className="w-full h-full mb-10 mt-0 lg:mt-20 max-w-md mx-auto rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700">
        <BackButton text={"Enlaces de WhatsApp"} />
      </div>

      <div className="flex flex-col items-center justify-center px-6 py-6 space-y-6 w-full">
        {/* Header */}
        {!showForm && (
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <WhatsAppOutlined style={{ fontSize: "48px", color: "white" }} />
            </div>
            <h2 className="font-bold text-black text-xl">
              Enlaces de WhatsApp
            </h2>
            <p className="text-gray-600 text-sm">
              Crea múltiples enlaces de WhatsApp con diferentes propósitos y
              mensajes personalizados.
            </p>
          </div>
        )}

        {/* Mensajes de error general */}
        {error && (
          <div className="w-full max-w-md p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Mensaje de guardado */}
        {saveMessage && (
          <div
            className={`w-full max-w-md p-3 border rounded-md flex items-center gap-2 ${
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

        {/* Lista mejorada de enlaces activos */}
        {!showForm && activeApiLinks && activeApiLinks.length > 0 && (
          <div className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Enlaces activos
              </h3>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {activeApiLinks.length}
              </span>
            </div>

            <div className="space-y-3">
              {activeApiLinks.map((link) => (
                <div
                  key={link.id}
                  className="group bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:border-green-300"
                >
                  <div className="flex items-start gap-3">
                    {/* Icono de WhatsApp */}
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <WhatsAppOutlined
                        style={{ fontSize: "15px", color: "white" }}
                      />
                    </div>

                    {/* Contenido principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">
                            {link.description || "WhatsApp"}
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                              <Phone className="w-3 h-3" />
                              <span className="truncate">{link.phone}</span>
                            </div>
                            <div className="flex items-start gap-1 mt-1 text-xs text-gray-600">
                              <MessageCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2 text-left">
                                "
                                {link.message.length > 50
                                  ? `${link.message.substring(0, 50)}...`
                                  : link.message}
                                "
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditLink(link)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(
                                link.id,
                                link.description || "WhatsApp"
                              )
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar"
                            disabled={isSaving}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay enlaces activos */}
        {!showForm && activeApiLinks.length === 0 && (
          <div className="w-full max-w-md text-center py-8">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <WhatsAppOutlined
                style={{ fontSize: "32px", color: "#9CA3AF" }}
              />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay enlaces activos
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Crea tu primer enlace de WhatsApp para conectar con tus contactos.
            </p>
          </div>
        )}

        {/* Botón para agregar nuevo enlace */}
        {!showForm && (
          <button
            onClick={handleNewLink}
            className="w-full max-w-md bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Agregar nuevo enlace
          </button>
        )}

        {/* Formulario */}
        {showForm && (
          <div className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingLink ? "Editar enlace" : "Nuevo enlace"}
              </h3>
              <button
                onClick={clearForm}
                className="text-gray-500 hover:text-gray-700 p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titulo
              </label>
              <input
                type="text"
                placeholder="Ej: Soporte Técnico, Ventas, Información General"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSaving || loading}
                className="w-full bg-white text-black px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-300"
              />
              <p className="text-xs text-gray-500 mt-1">
                Esta descripción aparecerá como título del botón
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Teléfono
              </label>
              <input
                type="tel"
                placeholder="Ej: +593986263432"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSaving || loading}
                className={`w-full bg-white text-black px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 border transition-colors ${
                  phone && !isValidPhoneNumber(phone)
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Incluye el código de país (ej: +593 para Ecuador)
              </p>
              {phone && !isValidPhoneNumber(phone) && (
                <p className="text-xs text-red-600 mt-1">
                  Número de teléfono inválido
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje Predeterminado
              </label>
              <textarea
                placeholder="Ej: Hola, quisiera más información sobre tus servicios"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSaving || loading}
                rows={3}
                className="w-full bg-white text-black px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-300 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Este mensaje aparecerá automáticamente cuando alguien abra
                WhatsApp
              </p>
            </div>

            {/* Botones del formulario */}
            <div className="space-y-2">
              <button
                onClick={handleSave}
                disabled={
                  isSaving ||
                  loading ||
                  !phone.trim() ||
                  !message.trim() ||
                  !description.trim() ||
                  !isValidPhoneNumber(phone) ||
                  !hasChanges()
                }
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Guardando...
                  </>
                ) : editingLink ? (
                  "Actualizar enlace"
                ) : (
                  "Crear enlace"
                )}
              </button>

              <button
                onClick={clearForm}
                disabled={isSaving || loading}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Información adicional */}
        {!showForm && (
          <div className="w-full max-w-md">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                ¿Cómo funciona?
              </h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Crea múltiples enlaces con diferentes propósitos</li>
                <li>• Cada enlace tiene su propia descripción y mensaje</li>
                <li>
                  • Solo se muestran enlaces activos de la API de WhatsApp
                </li>
                <li>
                  • Los botones aparecen en tu biosite cuando están activos
                </li>
                <li>• Funciona en dispositivos móviles y computadoras</li>
                <li>• Puedes editar, eliminar y previsualizar cada enlace</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      <div className="h-10"></div>
    </div>
  );
};

export default WhatsAppPage;
