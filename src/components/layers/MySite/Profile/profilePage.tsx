import { Button, Form, Input, message } from "antd";
import { usePreview } from "../../../../context/PreviewContext";
import { useFetchBiosite } from "../../../../hooks/useFetchBiosite";
import { useUser } from "../../../../hooks/useUser";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
//import { ChevronLeft } from "lucide-react";
//import { useNavigate } from "react-router-dom";
import type {
  BiositeColors,
  BiositeUpdateDto,
} from "../../../../interfaces/Biosite";
import ImageUploadSection from "./ImageUploadSection";
import apiService from "../../../../service/apiService";
import BackButton from "../../../shared/BackButton";

const { TextArea } = Input;

const ProfilePage = () => {
  const role = Cookies.get("roleName");
  const { biosite, updatePreview, loading: previewLoading } = usePreview();
  const userId = Cookies.get("userId");
  const {
    updateBiosite,
    fetchBiosite,
    loading: updateLoading,
  } = useFetchBiosite(userId);
  const { user, fetchUser, updateUser, loading: userLoading } = useUser();
  const [form] = Form.useForm();

  const [showWarning, setShowWarning] = useState(true);
  const [initialValuesSet, setInitialValuesSet] = useState(false);
  const [slugValidating, setSlugValidating] = useState(false);
  const [slugValidationTimeout, setSlugValidationTimeout] = useState<
    number | null
  >(null);

  const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";
  const DEFAULT_BACKGROUND =
    "https://visitaecuador.com/bio-api/img/image-1753208386348-229952436.jpeg";
  const loading = previewLoading || updateLoading || userLoading;

  const isValidAvatar = (avatarUrl: string | null | undefined): boolean => {
    if (!avatarUrl || typeof avatarUrl !== "string") return false;

    if (avatarUrl.startsWith("data:image/svg+xml")) {
      return false;
    }

    try {
      const url = new URL(avatarUrl);
      return ["http:", "https:"].includes(url.protocol);
    } catch {
      return false;
    }
  };

  const hasValidAvatar = isValidAvatar(biosite?.avatarImage);

  const toggleWarning = () => {
    setShowWarning(!showWarning);
  };

  const validateSlugUnique = async (slug: string): Promise<boolean> => {
    if (!slug || slug.length < 3) {
      return true;
    }

    if (biosite?.slug === slug) {
      return true;
    }

    try {
      setSlugValidating(true);

      const response = await apiService.getAll<any>(
        `/biosites?page=1&size=10&search=${encodeURIComponent(slug)}`
      );

      let biosites: any[] = [];

      if (Array.isArray(response)) {
        biosites = response;
      } else if (
        response &&
        typeof response === "object" &&
        "data" in response
      ) {
        biosites = (response as any).data || [];
      } else {
        biosites = [];
      }

      const exactMatch = biosites.find((b: any) => b.slug === slug);

      return !exactMatch;
    } catch (error) {
      console.error("Error validating slug:", error);
      return true;
    } finally {
      setSlugValidating(false);
    }
  };

  const debouncedValidateSlug = (slug: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (slugValidationTimeout) {
        clearTimeout(slugValidationTimeout);
      }

      const timeout = setTimeout(async () => {
        const isValid = await validateSlugUnique(slug);
        resolve(isValid);
      }, 800);

      setSlugValidationTimeout(timeout);
    });
  };

  const updateAdminAndChildrenBackground = async (backgroundImage: string) => {
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

  useEffect(() => {
    return () => {
      if (slugValidationTimeout) {
        clearTimeout(slugValidationTimeout);
      }
    };
  }, [slugValidationTimeout]);

  useEffect(() => {
    if (biosite && !loading) {
      fetchBiosite();
    }
  }, [biosite, fetchBiosite, loading]);

  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId, fetchUser]);

  useEffect(() => {
    if (user && !initialValuesSet) {
      const initialTitle = biosite?.title || user.name || "";
      const initialSlug = biosite?.slug || user.cedula || "";
      const initialDescription = user.description || "";

      form.setFieldsValue({
        title: initialTitle,
        slug: initialSlug,
        description: initialDescription,
        cedula: user.cedula || "",
      });

      setInitialValuesSet(true);
    }
  }, [biosite, user, form, initialValuesSet]);

  useEffect(() => {
    setInitialValuesSet(false);
  }, [biosite?.id, user?.id]);

  const handleFinish = async (values: any) => {
    if (!biosite?.id || !userId || typeof updateBiosite !== "function") {
      message.error("Error: Información del perfil no disponible");
      return;
    }

    try {
      const ensureColorsAsString = (
        colors: string | BiositeColors | null | undefined
      ): string => {
        if (!colors) return '{"primary":"#3B82F6","secondary":"#1F2937"}';
        if (typeof colors === "string") {
          try {
            JSON.parse(colors);
            return colors;
          } catch {
            return '{"primary":"#3B82F6","secondary":"#1F2937"}';
          }
        }
        return JSON.stringify(colors);
      };

      const getBackgroundImage = (): string =>
        biosite.backgroundImage || DEFAULT_BACKGROUND;

      const loadingMessage = message.loading("Actualizando perfil...", 0);

      const baseUpdateData = {
        ownerId: biosite.ownerId || userId,
        title: values.title || user?.name || biosite.title,
        slug: values.slug || biosite.slug || user?.cedula,
        themeId: biosite.themeId,
        colors: ensureColorsAsString(biosite.colors),
        fonts: biosite.fonts || "",
        backgroundImage: getBackgroundImage(),
        isActive: biosite.isActive ?? true,
      };

      const updateData: BiositeUpdateDto = hasValidAvatar
        ? { ...baseUpdateData, avatarImage: biosite.avatarImage! }
        : baseUpdateData;

      if (values.description !== user?.description) {
        const updatedUser = await updateUser(userId, {
          description: values.description || "",
        });
        if (updatedUser) {
          form.setFieldsValue({ description: updatedUser.description });
        }
      }

      const updated = await updateBiosite(updateData);
      if (updated) {
        updatePreview(updated);

        // Si es admin y tiene una imagen de fondo válida, actualizar también a los hijos
        if (
          isAdmin &&
          updated.backgroundImage &&
          updated.backgroundImage !== DEFAULT_BACKGROUND
        ) {
          try {
            await updateAdminAndChildrenBackground(updated.backgroundImage);
            message.success(
              "Perfil actualizado exitosamente. Imagen de fondo aplicada a todos los perfiles administrados."
            );
          } catch (error) {
            console.warn("Error updating children backgrounds:", error);
            message.success("Perfil actualizado exitosamente");
          }
        } else {
          message.success("Perfil actualizado exitosamente");
        }

        console.log("Profile updated successfully:", {
          themeId: updated.themeId,
          backgroundImage: updated.backgroundImage,
          slug: updated.slug,
        });
      }

      loadingMessage();

      setTimeout(() => {
        window.location.reload();
      }, 50);
    } catch (error: any) {
      console.error("Error al actualizar perfil:", error);

      if (error.response?.data?.details?.code === "P2003") {
        message.error("Error: Referencia de base de datos inválida");
      } else {
        const errorMessage =
          error.response?.data?.message || error.message || "Error desconocido";
        message.error(`Error al actualizar el perfil: ${errorMessage}`);
      }
    }
  };

  if (loading && !biosite) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="text-center text-gray-500 py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!biosite) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="text-center text-red-500 py-8">
          <div className="mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-lg font-semibold mb-2">
            No se pudo cargar el perfil
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Verifica tu conexión e intentalo de nuevo
          </p>
          <Button onClick={() => window.location.reload()}>
            Recargar pagina
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full mb-10 mt-0 lg:mt-20 p-2 max-w-md mx-auto">
      <div className="px-6 py-4 border-b border-gray-700">
        <BackButton text={"Perfil"} />
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wide text-start">
            IMAGENES
          </h3>
          <ImageUploadSection
            biosite={biosite}
            loading={loading}
            userId={userId}
            updateBiosite={updateBiosite}
            updatePreview={updatePreview}
            role={role}
          />
          {isAdmin && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h4 className="text-xs font-medium text-blue-800 mb-1">
                    Administrador
                  </h4>
                  <p className="text-xs text-blue-700">
                    Al actualizar tu imagen de fondo, también se aplicará
                    automáticamente a todos los perfiles que administras.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {!isAdmin && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 cursor-pointer">
                <svg
                  className="w-5 h-5 text-blue-500 mt-0.5 cursor-pointer hover:text-blue-600 transition-colors"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  onClick={toggleWarning}
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              {showWarning && (
                <div className="h-20 lg:h-20 md:h-20 sm:h-20">
                  <h4
                    className="text-sm font-medium text-blue-800 mb-1"
                    style={{ fontSize: "11px" }}
                  >
                    Importante
                  </h4>
                  <p
                    className="text-sm text-blue-700"
                    style={{ fontSize: "11px" }}
                  >
                    {biosite.backgroundImage
                      ? "Tienes una imagen de fondo personalizada ya previa configurada             Al configurar debes llenar todos los campos y añadir una imagen "
                      : " Al configurar debes llenar todos los campos y añadir una imagen. Se aplicara una imagen de fondo por defecto a el perfil VeSite... "}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* About Section */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wide text-start">
            ACERCA DE
          </h3>
          <Form form={form} layout="vertical" onFinish={handleFinish}>
            {/* Nombre Input */}
            <div className="mb-4">
              <label className="text-xs font-ligth text-gray-500 mb-4 uppercase tracking-wide text-start">
                NOMBRE
              </label>
              <Form.Item
                name="title"
                rules={[
                  { required: true, message: "El nombre es requerido" },
                  {
                    min: 2,
                    message: "El nombre debe tener al menos 2 caracteres",
                  },
                  {
                    max: 50,
                    message: "El nombre no puede tener mas de 50 caracteres",
                  },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder={user?.name || "Añadir"}
                  disabled={loading}
                  maxLength={50}
                  className="rounded-lg border-gray-600 bg-[#2A2A2A] text-white h-12 placeholder-gray-500"
                  style={{ fontSize: "12px" }}
                />
              </Form.Item>
            </div>

            <div className="mb-4">
              <label className="text-xs font-ligth text-gray-500 mb-4 uppercase tracking-wide text-start">
                DESCRIPCIÓN
              </label>
              <Form.Item
                name="description"
                rules={[
                  {
                    max: 250,
                    message:
                      "La descripción no puede tener mas de 250 caracteres",
                  },
                ]}
                className="mb-0"
              >
                <TextArea
                  placeholder={user?.description || "Añadir descripción"}
                  disabled={loading}
                  maxLength={250}
                  rows={4}
                  className="rounded-lg border-gray-600 bg-[#2A2A2A] text-white resize-none placeholder-gray-500"
                  style={{ fontSize: "12px" }}
                  showCount
                />
              </Form.Item>
            </div>

            {/* URL Input */}
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wide text-start block">
                SITIO
              </label>
              <span className="text-xs font-ligth text-gray-500 mb-4 uppercase tracking-wide text-start">
                URL
              </span>
              <Form.Item
                name="slug"
                rules={[
                  { required: true, message: "La url es requerido" },
                  {
                    min: 3,
                    message: "La url debe tener al menos 3 caracteres",
                  },
                  {
                    max: 30,
                    message: "La url no puede tener mas de 30 caracteres",
                  },
                  {
                    pattern: /^[a-zA-Z0-9-_]+$/,
                    message:
                      "La URL solo puede contener letras, números, guiones y guiones bajos",
                  },
                  {
                    validator: async (_, value) => {
                      if (value && value.length >= 3) {
                        const isUnique = await debouncedValidateSlug(value);
                        if (!isUnique) {
                          throw new Error(
                            "Esta URL ya está en uso. Por favor, elige otra."
                          );
                        }
                      }
                    },
                  },
                ]}
                className="mb-0"
                validateTrigger={["onBlur"]} // Only validate on blur, not on change
                hasFeedback
              >
                <Input
                  placeholder="tu-url-personalizada"
                  disabled={loading}
                  height={20}
                  addonBefore="vesite/"
                  maxLength={30}
                  className="flex-1 h-12 border-none bg-transparent text-black placeholder-gray-400 shadow-none focus:shadow-none focus:border-none hover:shadow-none p-0"
                  style={{ fontSize: "12px", boxShadow: "none" }}
                  suffix={
                    slugValidating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    ) : null
                  }
                />
              </Form.Item>

              {form.getFieldValue("slug") && (
                <div
                  className="mt-2 text-sm text-gray-600"
                  style={{ fontSize: "12px" }}
                >
                  URL completa:{" "}
                  <span className="text-blue-600">
                    visitaecuador.com/vesite/{form.getFieldValue("slug")}
                  </span>
                </div>
              )}
              {form.getFieldValue("cedula") && (
                <div
                  className="mt-2 text-sm text-gray-600"
                  style={{ fontSize: "12px" }}
                >
                  URL fija:{" "}
                  <span className="text-blue-600">
                    visitaecuador.com/{form.getFieldValue("cedula")}
                  </span>
                </div>
              )}
            </div>

            <Form.Item className="mb-0">
              <Button
                type="default"
                htmlType="submit"
                className={`w-full border-none rounded-lg py-2 h-auto ${
                  !loading && !slugValidating
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-400 text-gray-600 cursor-not-allowed"
                }`}
                loading={loading || slugValidating}
                disabled={!biosite.id || loading || slugValidating}
              >
                {loading || slugValidating
                  ? "Validando..."
                  : "Actualizar Perfil"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
