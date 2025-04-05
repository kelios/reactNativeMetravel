import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    ReactNode,
    FC,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    logoutApi,
    loginApi,
    resetPasswordLinkApi,
    setNewPasswordApi,
} from '@/src/api/travels';

interface AuthContextType {
    isAuthenticated: boolean;
    username: string;
    isSuperuser: boolean;
    userId: string | null;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    setUsername: (username: string) => void;
    setIsSuperuser: (isSuperuser: boolean) => void;
    setUserId: (id: string | null) => void;
    logout: () => Promise<void>;
    login: (email: string, password: string) => Promise<boolean>;
    sendPassword: (email: string) => Promise<string>;
    setNewPassword: (token: string, newPassword: string) => Promise<boolean>;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
    // Вызов хуков (useState, useEffect) строго на верхнем уровне
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [isSuperuser, setIsSuperuser] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // При первой загрузке проверяем данные аутентификации
    useEffect(() => {
        checkAuthentication();
    }, []);

    // Функции, не содержащие хуков
    const checkAuthentication = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const storedUserId = await AsyncStorage.getItem('userId');
            const storedUsername = await AsyncStorage.getItem('userName');
            const superuserFlag = await AsyncStorage.getItem('isSuperuser');

            setIsAuthenticated(!!token);
            setUserId(storedUserId);
            setUsername(storedUsername || '');
            setIsSuperuser(superuserFlag === 'true');
        } catch (error) {
            console.error('Ошибка при проверке аутентификации:', error);
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const userData = await loginApi(email, password);
            if (userData) {
                await AsyncStorage.multiSet([
                    ['userToken', userData.token],
                    ['userId', userData.id],
                    ['userName', userData.name?.trim() || userData.email],
                    ['isSuperuser', userData.is_superuser ? 'true' : 'false'],
                ]);

                setIsAuthenticated(true);
                setUserId(userData.id);
                setUsername(userData.name?.trim() || userData.email);
                setIsSuperuser(userData.is_superuser);

                return true;
            }
            return false;
        } catch (error) {
            console.error('Ошибка входа:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            // Всегда удаляем локальные данные, даже если api не сработал
            await logoutApi();
        } catch (e) {
            console.warn('Ошибка при логауте с сервера:', e);
        } finally {
            await AsyncStorage.multiRemove([
                'userToken',
                'userName',
                'isSuperuser',
                'userId',
            ]);
            setIsAuthenticated(false);
            setUserId(null);
            setUsername('');
            setIsSuperuser(false);
        }
    };

    const sendPassword = async (email: string): Promise<string> => {
        try {
            const response = await resetPasswordLinkApi(email);
            return typeof response === 'string'
                ? response
                : 'Что-то пошло не так. Попробуйте снова.';
        } catch (error) {
            console.error('Ошибка при сбросе пароля:', error);
            return 'Произошла ошибка. Попробуйте ещё раз.';
        }
    };

    const setNewPassword = async (
        token: string,
        newPassword: string
    ): Promise<boolean> => {
        return await setNewPasswordApi(token, newPassword);
    };

    // Отдаём контекстное значение во все дочерние компоненты
    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                username,
                isSuperuser,
                userId,
                setIsAuthenticated,
                setUsername,
                setIsSuperuser,
                setUserId,
                login,
                logout,
                sendPassword,
                setNewPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Кастомный хук для удобного доступа к контексту
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
