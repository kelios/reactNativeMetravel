import React, {createContext, useState, useEffect, useContext,ReactNode,FC} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {logoutApi, loginApi, sendPasswordApi, setNewPasswordApi, resetPasswordLinkApi} from '@/src/api/travels'

interface AuthContextType {
    isAuthenticated: boolean,
    setIsAuthenticated: (isAuthenticated:boolean) => void,
    logout: () => void,
    login: (email: string, password: string, navigation: any) => Promise<void>,
    sendPassword: (email: string) => Promise<string>,
    setNewPassword: (token: string, newPassword: string) => Promise<boolean>,
}

interface AuthProviderProps{
    children: ReactNode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider:FC<AuthProviderProps> = ({children}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);


    const checkAuthentication = async () => {
        const token = await AsyncStorage.getItem('userToken');
        setIsAuthenticated(!!token);
    };

    useEffect(() => {
        checkAuthentication();
    }, []);

    const login = async (email: string, password: string, navigation: any) => {
        const success = await loginApi(email, password);
        if (success) {
            await checkAuthentication();
            navigation.navigate('index');
        }
    };

    const logout = async () => {
        await logoutApi();
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userName');
        setIsAuthenticated(false);
    };

    const sendPassword = async (email: string): Promise<boolean> => {
        return await resetPasswordLinkApi(email);
    };

    const setNewPassword = async (token: string, newPassword: string): Promise<boolean> => {
        return await setNewPasswordApi(token, newPassword);
    };

    return (
        <AuthContext.Provider value={{isAuthenticated, setIsAuthenticated, login, logout, sendPassword, setNewPassword}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context;
}