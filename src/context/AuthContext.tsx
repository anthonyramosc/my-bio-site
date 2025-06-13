import {type FC, type ReactNode, useState, useEffect} from 'react';
import Cookie from 'js-cookie';
import type {LoginParams} from "../types/authTypes.ts";
import type {AuthResponse} from "../interfaces/Auth.ts";
import {AuthContext} from '../hooks/useAuthContext.ts'
import apiService from "../service/apiService.ts";
import {loginApi} from "../constants/EndpointsRoutes.ts";
import notificationService from "../service/notificationService.ts";

export const AuthProvider: FC<{ children: ReactNode }> = ({children}) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Check for existing tokens on app startup
    useEffect(() => {
        const checkAuth = () => {
            const token = Cookie.get('accessToken');
            const userIdFromCookie = Cookie.get('userId');
            const roleFromCookie = Cookie.get('roleName');
            
            if (token && userIdFromCookie) {
                setIsAuthenticated(true);
                setUserId(userIdFromCookie);
                setAccessToken(token);
                if (roleFromCookie) {
                    setRole(roleFromCookie);
                }
            }
            
            setLoading(false);
        };
        
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            const data = {email: email, password: password}
            const responseData = await apiService.createReqRes<LoginParams, AuthResponse>(loginApi, data)
            const {accessToken, refreshToken, userId, roleName} = responseData;
            const accessExpirationDate = new Date();
            const refreshExpirationDate = new Date();
            accessExpirationDate.setDate(accessExpirationDate.getDate() + 2);
            refreshExpirationDate.setDate(refreshExpirationDate.getDate() + 7);

            Cookie.set('accessToken', accessToken, { expires: accessExpirationDate });
            Cookie.set('refreshToken', refreshToken, { expires: refreshExpirationDate });
            Cookie.set('userId', userId, { expires: refreshExpirationDate});
            Cookie.set('roleName', roleName[0].roleName, { expires: refreshExpirationDate });

            setIsAuthenticated(true);
            setUserId(userId);
            setAccessToken(accessToken);
            setRole(roleName[0].roleName);

            if (Cookie.get('roleName') === 'admin') {
                notificationService.warning('Sudo mode', 'You are logged in as sudo, please be careful');
            }

            return {success: true};

        } catch (error) {
            console.error('Login error:', error);
            const err = error as { response?: { data: unknown }; request?: unknown; message?: string };
            if (err.response) {
                console.error('Error in server response:', err.response.data);
            } else if (err.request) {
                console.error('No response from server:', err.request);
            } else {
                console.error('Error while setting up the request', err.message);
            }

            return {success: false};
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        try {
            setLoading(true);
            Cookie.remove('accessToken');
            Cookie.remove('refreshToken');
            Cookie.remove('userId');
            Cookie.remove('roleName');
            setIsAuthenticated(false);
            setUserId(null);
            setAccessToken(null);
            setRole(null);
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{isAuthenticated, userId, accessToken, role, loading, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};