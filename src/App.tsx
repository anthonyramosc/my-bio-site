import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Layout principal
import Layout from "./components/Main/Layout.tsx";

// Páginas públicas
import { Login } from "./pages/Login/Login.tsx";
// Páginas privadas
import Sections from "./pages/sections.tsx";
import ProfilePage from "./components/layers/MySite/Profile/profilePage.tsx";
import Analytics from "./pages/analytics.tsx";
import Styles from "./pages/styles.tsx";
import PrivateRoute from "./pages/Login/PrivateRoute.tsx";
import { PreviewProvider } from "./context/PreviewContext.tsx";
import { SectionsProvider } from "./context/SectionsContext.tsx";
import SocialPage from "./components/layers/MySite/Social/socialPage.tsx";
import VideoPage from "./components/layers/AddMoreSections/Video/videoPage.tsx";
import MusicPage from "./components/layers/AddMoreSections/Music-Posdcast/musicPage.tsx";
import PostPage from "./components/layers/AddMoreSections/Socialpost/socialPostPage.tsx";
import LinksPage from "./components/layers/AddMoreSections/Links/linksPage.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import LivePreviewContent from "./components/Preview/LivePreviewContent.tsx";
import AppPage from "./components/layers/AddMoreSections/App/appPage.tsx";
import VCardPage from "./components/layers/MySite/V-Card/V-CardPage.tsx";
import WhatsAppPage from "./components/layers/AddMoreSections/WhattsApp/whatsAppPage.tsx";
import AdminPanel from "./pages/SuperAdmin.tsx";
import NewBiositePage from "./context/NewBiositePage/NewBiositePage.tsx";

// Componente wrapper para rutas privadas con Layout
const PrivateLayout = () => (
  <PrivateRoute>
    <Layout />
  </PrivateRoute>
);

const App = () => {
  return (
    <AuthProvider>
      <PreviewProvider>
        <SectionsProvider>
          <BrowserRouter basename="vesite">
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Navigate to="/sections" />} />
              <Route path="/login" element={<Login />} />

              {/* Ruta pública para ver biosite por slug */}
              <Route
                path="/:slug"
                element={
                  <div className="min-h-screen bg-gray-100">
                    <NewBiositePage />
                  </div>
                }
              />

              {/* Rutas privadas con Layout usando Outlet */}
              <Route path="/" element={<PrivateLayout />}>
                <Route path="sections" element={<Sections />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="social" element={<SocialPage />} />
                <Route path="whatsApp" element={<WhatsAppPage />} />
                <Route path="links" element={<LinksPage />} />
                <Route path="videos" element={<VideoPage />} />
                <Route path="music" element={<MusicPage />} />
                <Route path="post" element={<PostPage />} />
                <Route path="app" element={<AppPage />} />
                <Route path="droplet" element={<Styles />} />
                <Route path="styles" element={<Styles />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="VCard" element={<VCardPage />} />
                <Route path="admin" element={<AdminPanel />} />
              </Route>

              {/* Ruta de preview sin Layout */}
              <Route
                path="vesite/expoced"
                element={
                  <PrivateRoute>
                    <div className="min-h-screen bg-gray-100">
                      <LivePreviewContent />
                    </div>
                  </PrivateRoute>
                }
              />

              {/* Catch-all: redirección a inicio */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SectionsProvider>
      </PreviewProvider>
    </AuthProvider>
  );
};
export default App;
