import type {FC} from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Main/Layout.tsx";
import Dashboard from "./pages/dashboard.tsx";
import {AuthProvider} from "./context/AuthContext.tsx";
import {Login} from "./pages/Login.tsx";
import ProfilePage from "./components/layers/MySite/Profile/profilePage.tsx";
import SocialPage from "./components/layers/MySite/Social/socialPage.tsx";
import LinksPage from "./components/layers/MySite/Links/linksPage.tsx";
import StylePage from "./components/layers/MySite/Style/stylePage.tsx";
import AnalyticsPage from "./pages/analytics.tsx";
import { Register } from "./pages/Register";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute.tsx";
import { useAuthContext } from "./hooks/useAuthContext.ts";
import { BiositeProvider, useBiositeContext } from "./context/BiositeContext.tsx";

// Create a separate component for the routes to access the auth context
const AppRoutes: FC = () => {
    const { isAuthenticated, loading } = useAuthContext();
    
    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#1b1b1b] text-white">
                <div className="animate-pulse">Cargando...</div>
            </div>
        );
    }
    
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Root Route - Redirect based on auth status */}
            <Route path="/" element={
                isAuthenticated ? <Navigate to="/sections" /> : <Navigate to="/login" />
            } />
            
            {/* Protected Routes */}
            <Route 
                path="/sections" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Dashboard />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            
            {/* Removed separate droplet route since it's now handled directly by the Layout component */}
            
            <Route 
                path="/analytics" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <AnalyticsPage />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            
            <Route 
                path="/profile" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <ProfilePage />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            
            <Route 
                path="/social" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <SocialPage />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            
            <Route 
                path="/links" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <LinksPage />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            
            <Route 
                path="/style" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <StylePage />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

// Notification Container Component
const NotificationContainer: FC = () => {
    const { notification, clearNotification } = useBiositeContext();
    
    return (
        <div className="notification-container">
            {notification.type && notification.message && (
                <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 ${
                    notification.type === 'success' ? 'bg-green-500 text-white' : 
                    notification.type === 'error' ? 'bg-red-500 text-white' : ''
                }`}>
                    <span>{notification.message}</span>
                    <button onClick={clearNotification} className="text-white hover:text-gray-200">
                        <span className="text-xl">&times;</span>
                    </button>
                </div>
            )}
        </div>
    );
};

// Main app component
const App: FC = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <BiositeProvider>
                    <AppRoutes />
                    <NotificationContainer />
                </BiositeProvider>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;