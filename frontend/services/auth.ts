import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export interface User {
    id_usuario: number;
    nombre: string;
    apellido: string;
    correo: string;
    rol: number;
    estado: string;
    genero: string;
}

export interface AuthResponse {
    token: string;
    user: User;
    message?: string;
}

export type UserRole = 'paciente' | 'medico' | 'administrador';

export const authService = {
    // Login con validación de roles
    login: async (email: string, password: string): Promise<AuthResponse> => {
        try {
            const response = await api.post('/auth/login', { correo: email, contraseña: password });
            
            // Guardar token y datos del usuario
            await AsyncStorage.setItem('token', response.token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));
            await AsyncStorage.setItem('userRole', getRoleName(response.user.rol));
            
            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Registro con validación de clave de administrador
    register: async (userData: {
        nombre: string;
        apellido: string;
        correo: string;
        contraseña: string;
        rol: number;
        genero: string;
        adminKey?: string; // Solo para administradores
    }): Promise<AuthResponse> => {
        try {
            const response = await api.post('/auth/register', userData);
            
            // Guardar token y datos del usuario
            await AsyncStorage.setItem('token', response.token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));
            await AsyncStorage.setItem('userRole', getRoleName(response.user.rol));
            
            return response;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    },

    // Obtener usuario actual
    getCurrentUser: async (): Promise<User | null> => {
        try {
            const userStr = await AsyncStorage.getItem('user');
            console.log('[getCurrentUser] userStr:', userStr);
            if (!userStr) return null;
            return JSON.parse(userStr);
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    },

    // Obtener rol actual
    getCurrentRole: async (): Promise<UserRole | null> => {
        try {
            const role = await AsyncStorage.getItem('userRole');
            // Si es un número (guardado como string), conviértelo a string de rol
            if (role && !isNaN(Number(role))) {
                return getRoleName(Number(role));
            }
            return role as UserRole;
        } catch (error) {
            console.error('Get current role error:', error);
            return null;
        }
    },

    // Verificar si el usuario está autenticado
    isAuthenticated: async (): Promise<boolean> => {
        try {
            const token = await AsyncStorage.getItem('token');
            return !!token;
        } catch (error) {
            return false;
        }
    },

    // Verificar si el usuario tiene un rol específico
    hasRole: async (role: UserRole): Promise<boolean> => {
        try {
            const currentRole = await authService.getCurrentRole();
            return currentRole === role;
        } catch (error) {
            return false;
        }
    },

    // Verificar si es administrador
    isAdmin: async (): Promise<boolean> => {
        return await authService.hasRole('administrador');
    },

    // Verificar si es médico
    isDoctor: async (): Promise<boolean> => {
        return await authService.hasRole('medico');
    },

    // Verificar si es paciente
    isPatient: async (): Promise<boolean> => {
        return await authService.hasRole('paciente');
    },

    // Logout
    logout: async (): Promise<void> => {
        try {
            console.log('🔄 Iniciando logout...');
            
            // Limpiar todos los datos de autenticación
            const keysToRemove = ['token', 'user', 'userRole'];
            await AsyncStorage.multiRemove(keysToRemove);
            
            console.log('✅ Datos de autenticación eliminados');
            
            // Verificar que se limpiaron correctamente
            const remainingToken = await AsyncStorage.getItem('token');
            const remainingUser = await AsyncStorage.getItem('user');
            const remainingRole = await AsyncStorage.getItem('userRole');
            
            console.log('🔍 Verificación post-logout:', {
                token: remainingToken,
                user: remainingUser,
                role: remainingRole
            });
            
            if (remainingToken || remainingUser || remainingRole) {
                console.warn('⚠️ Algunos datos no se limpiaron correctamente');
                // Intentar limpiar individualmente
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('user');
                await AsyncStorage.removeItem('userRole');
            }
            
            console.log('✅ Logout completado exitosamente');
        } catch (error) {
            console.error('❌ Error durante logout:', error);
            throw error;
        }
    },

    // Recuperar contraseña
    forgotPassword: async (email: string): Promise<void> => {
        try {
            await api.post('/auth/forgot-password', { correo: email });
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    },

    // Cambiar contraseña
    changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
        try {
            await api.put('/auth/change-password', {
                contraseña_actual: currentPassword,
                contraseña_nueva: newPassword
            });
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    },

    updateProfile: async (id: number, data: Partial<User>) => {
        return api.put(`/user/${id}`, data);
    },
};

// Función auxiliar para convertir ID de rol a nombre
export function getRoleName(roleId: number): UserRole {
    switch (roleId) {
        case 1:
            return 'paciente';
        case 2:
            return 'medico';
        case 3:
            return 'administrador';
        default:
            return 'paciente';
    }
}

// Función auxiliar para convertir nombre de rol a ID
export function getRoleId(roleName: UserRole): number {
    switch (roleName) {
        case 'paciente':
            return 1;
        case 'medico':
            return 2;
        case 'administrador':
            return 3;
        default:
            return 1;
    }
} 