import { api } from './api';

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

    logout: () => {
        global.token = undefined;
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