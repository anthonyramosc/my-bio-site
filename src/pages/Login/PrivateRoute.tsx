import type { FC, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: FC<PrivateRouteProps> = ({ children }) => {
  const accessToken = Cookies.get("accessToken");
  const userId = Cookies.get("userId");
  const biositeId = Cookies.get("biositeId");

  // Verificar que todos los tokens necesarios estén presentes y sean válidos
  const isAuthenticated =
    accessToken &&
    userId &&
    biositeId &&
    accessToken !== "undefined" &&
    accessToken !== "null" &&
    accessToken !== "";

  if (!isAuthenticated) {
    // Limpiar todas las cookies si la autenticación falla
    const cookiesToClear = [
      "accessToken",
      "refreshToken",
      "userId",
      "roleName",
      "biositeId",
    ];
    cookiesToClear.forEach((cookie) => Cookies.remove(cookie));

    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
