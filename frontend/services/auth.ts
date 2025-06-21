import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export interface LoginCredentials {
    correo: string;
    contraseña: string;
}

export interface Usuario {
    id_usuario: number;
    nombre: string;
    apellido: string;
    correo: string;
    contraseña: string;
    rol: number;
    estado: string;
    genero: string;
}

export interface LoginResponse {
    token: string;
    usuario: Usuario;
    rol: string;
}

export const authService = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const response = await api.post('/login', credentials);
        if (response.token) {
            global.token = response.token;
        }
        return response;
    },

    logout: async () => {
        try {
            global.token = undefined;
            await AsyncStorage.multiRemove([
                'userData',
                'token',
                'userRole'
            ]);
        } catch (error) {
            console.error('Error during logout data clearing:', error);
            // Propagate error to be handled by the caller
            throw error;
        }
    },

    getCurrentUser: async (): Promise<Usuario> => {
        return api.get('/user/current');
    },

    register: async (userData: Omit<Usuario, 'id_usuario'>) => {
        return api.post('/register', userData);
    },

    updateProfile: async (id: number, data: Partial<Usuario>) => {
        return api.put(`/user/${id}`, data);
    },
}; 