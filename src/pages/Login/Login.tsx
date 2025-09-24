import { type FC, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Alert, Button, Form, Input, Layout, Typography } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";

import { useAuthContext } from "../../hooks/useAuthContext.ts";
import imgP6 from "../../../public/img/img_8.png";
const { Content } = Layout;

export const Login: FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const { login } = useAuthContext();

  // useEffect para auto-ocultar el error después de 4 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 2000); // 4 segundos

      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const autoLogin = () => {
      try {
        const storedData = localStorage.getItem("datos");
        if (!storedData) {
          console.log("No hay datos en localStorage");
          return;
        }

        const parsedData = JSON.parse(storedData);

        const cedula = parsedData?.data?.ci;
        if (!cedula || typeof cedula !== "string") {
          console.log("No se encontrÃ³ cÃ©dula vÃ¡lida en localStorage");
          return;
        }

        const email = cedula;
        const password = cedula.substring(0, 5);

        console.log("Intentando auto-login con:", { email, password: "***" });

        // Llenar el formulario automÃ¡ticamente (opcional, para mostrar al usuario)
        form.setFieldsValue({
          email: email,
          password: password,
        });

        // Ejecutar login automÃ¡ticamente
        handleAutoLogin(email, password);
      } catch (error) {
        console.error("Error en auto-login:", error);
      }
    };

    // Verificar si ya hay un token vÃ¡lido
    const existingToken = Cookies.get("accessToken");
    if (!existingToken) {
      autoLogin();
    }
  }, [form]);

  const handleAutoLogin = async (email: string, password: string) => {
    if (!login) {
      console.error("Login functionality is not available.");
      return;
    }

    try {
      setLoading(true);
      const response = await login(email, password);

      if (response.success) {
        const token = Cookies.get("accessToken");
        if (token) {
          console.log("Auto-login exitoso");
          // Recargar la pÃ¡gina antes de navegar
          window.location.href = "/sections";
        } else {
          setError("Auto-login fallÃ³. No se encontrÃ³ token.");
        }
      } else {
        setError("Auto-login fallÃ³. Verifica tus credenciales almacenadas.");
      }
    } catch (err) {
      console.error("Auto-login error:", err);
      setError("Error inesperado en auto-login.");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    if (!login) {
      setError("Login functionality is not available.");
      setLoading(false);
      return;
    }

    try {
      const response = await login(values.email, values.password);

      if (response.success) {
        const token = Cookies.get("accessToken");
        if (token) {
          // Recargar la pÃ¡gina antes de navegar
          window.location.href = "/sections";
        } else {
          setError("Login failed. No token found.");
        }
      } else {
        setError("Login failed. Porfavor revisa tu contraseña o tu usuario.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Content
      className="h-screen flex relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%), url(${imgP6}) no-repeat center center`,
        backgroundSize: "cover",
        backgroundBlendMode: "overlay",
      }}
    >
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-400 rounded-full opacity-60 animate-pulse"></div>
        <div
          className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full opacity-40 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-emerald-300 rounded-full opacity-30 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Header with glassmorphism effect */}
      <div
        className="absolute top-5 left-4 right-4 lg:left-10 lg:right-10 z-10 flex flex-col sm:flex-row justify-between items-center p-2 gap-4 sm:gap-0"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="w-30 h-20">
          <img src="./img/veosite.png" className="w-30 h-20" />
        </div>
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <Form
            form={form} // Agregamos la referencia del formulario
            layout="inline"
            onFinish={onFinish}
            className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto"
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: "Cedula o Correo requerido" }]}
              className="mb-0 w-full sm:w-auto"
            >
              <Input
                placeholder="Correo o Cedula"
                className="rounded-xl border-0 px-4 py-3 transition-all duration-300 hover:shadow-md focus:shadow-lg"
                style={{
                  width: "100%",
                  minWidth: "220px",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
                  fontSize: "15px",
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Contraseña requerida" }]}
              className="mb-0 w-full sm:w-auto"
            >
              <Input.Password
                placeholder="Contraseña"
                className="rounded-xl border-0 px-4 py-3 transition-all duration-300 hover:shadow-md focus:shadow-lg"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                style={{
                  width: "100%",
                  minWidth: "220px",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
                  fontSize: "15px",
                }}
              />
            </Form.Item>

            <Form.Item className="mb-0 w-full sm:w-auto">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="rounded-xl px-8 py-3 border-0 w-full sm:w-auto font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                style={{
                  background: loading
                    ? undefined
                    : "linear-gradient(135deg, #BAD789 0%, #BAD789 100%)",
                  color: "white",
                  height: "32px",
                  fontSize: "15px",
                }}
              >
                {loading ? "Cargando..." : "Iniciar Sesión"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-16 pt-32 sm:pt-20">
        <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl gap-12 lg:gap-16">
          {/* Left Side - Video/Image with enhanced styling */}
          <div className="flex-1 w-full lg:mr-12 order-2 lg:order-1">
            <div className="relative group">
              <img
                className="relative w-full h-64 sm:h-80 lg:h-96 rounded-3xl shadow-2xl object-cover transition-transform duration-500 group-hover:scale-105"
                src="./Video/TARJETA_NFC.gif"
                style={{
                  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
                }}
                alt="VESites Demo"
              />
            </div>
          </div>

          {/* Right Side - Enhanced text content */}
          <div className="flex-1 w-full lg:ml-12 order-1 lg:order-2">
            <div className="text-center lg:text-left space-y-6">
              <div className="space-y-4">
                <Typography.Title
                  level={1}
                  className="m-0 font-bold bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 bg-clip-text text-transparent"
                  style={{
                    fontSize: "clamp(32px, 5vw, 56px)",
                    lineHeight: "1.1",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Disfruta de
                  <span className="block bg-gradient-to-r from-[#BAD789] to-[#E0EED5] bg-clip-text text-transparent">
                    VisitaEcuador.com
                  </span>
                </Typography.Title>

                <div className="h-1 w-24 bg-gradient-to-r from-[#BAD789] to-[#E0EED5] rounded-full mx-auto lg:mx-0"></div>
              </div>

              <Typography.Text
                className="block text-gray-600 leading-relaxed"
                style={{
                  fontSize: "clamp(18px, 3vw, 28px)",
                  fontWeight: "400",
                  maxWidth: "500px",
                }}
              >
                Crea tu marca con nuestros{" "}
                <span className="font-semibold bg-gradient-to-r from-[#718C5B] to-[#718C5B] bg-clip-text text-transparent">
                  VeSites
                </span>
              </Typography.Text>

              {/* Decorative elements */}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Error Alert */}
      {error && (
        <div className="absolute top-44 sm:top-36 lg:top-28 left-1/2 transform -translate-x-1/2 z-20 px-4 w-full max-w-md">
          <div className="animate-fadeIn">
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              className="rounded-2xl shadow-2xl border-0"
              style={{
                background: "rgba(254, 226, 226, 0.95)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 10px 25px rgba(239, 68, 68, 0.2)",
              }}
            />
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
    </Content>
  );
};
