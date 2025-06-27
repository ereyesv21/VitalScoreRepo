import { API_TIMEOUT } from '../constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { authService } from './auth';
import { router } from 'expo-router';

const API_URL = Platform.OS === 'web'
  ? "http://localhost:4000/api"
  : "http://192.168.100.77:4000/api"; // Para Android emulator, usar 10.0.2.2 en lugar de localhost

console.log('API Service - Usando URL:', API_URL);

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

// Endpoints que no requieren autenticación
const PUBLIC_ENDPOINTS = [
    '/register',
    '/login',
    '/public/eps',
    '/public/especialidades'
];

const isPublicEndpoint = (endpoint: string) => {
    return PUBLIC_ENDPOINTS.some(publicEndpoint => endpoint.startsWith(publicEndpoint));
};

const handleResponse = async (response: Response) => {
    const data = await response.json();
    
    if (!response.ok) {
        const errorMessage = data.error || data.message || data.details || 'Something went wrong';

        // Si el error es de token inválido/expirado, forzar logout y redirigir
        if (
            errorMessage.toLowerCase().includes('token') &&
            (errorMessage.toLowerCase().includes('invalido') || errorMessage.toLowerCase().includes('expir'))
        ) {
            await authService.logout();
            router.replace('/auth/login'); // o router.push según tu flujo
        }

        throw new ApiError(response.status, errorMessage);
    }
    
    return data;
};

const timeoutPromise = (ms: number) => {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(`Request timed out after ${ms}ms`));
        }, ms);
    });
};

export const api = {
    get: async (endpoint: string) => {
        try {
            const token = await AsyncStorage.getItem('token');
            console.log('🌐 GET Request:', `${API_URL}${endpoint}`);
            
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            
            // Solo agregar token si no es un endpoint público
            if (token && !isPublicEndpoint(endpoint)) {
                headers.Authorization = `Bearer ${token}`;
            }
            
            const response = await Promise.race([
                fetch(`${API_URL}${endpoint}`, {
                    method: 'GET',
                    headers,
                }),
                timeoutPromise(API_TIMEOUT),
            ]);
            
            console.log('✅ GET Response status:', (response as Response).status);
            return await handleResponse(response as Response);
        } catch (error) {
            console.error('❌ GET Error:', error);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
        }
    },

    post: async (endpoint: string, data: any) => {
        try {
            const token = await AsyncStorage.getItem('token');
            console.log('🌐 POST Request:', `${API_URL}${endpoint}`, data);
            
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            
            // Solo agregar token si no es un endpoint público
            if (token && !isPublicEndpoint(endpoint)) {
                headers.Authorization = `Bearer ${token}`;
            }
            
            const response = await Promise.race([
                fetch(`${API_URL}${endpoint}`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(data),
                }),
                timeoutPromise(API_TIMEOUT),
            ]);
            
            console.log('✅ POST Response status:', (response as Response).status);
            return await handleResponse(response as Response);
        } catch (error) {
            console.error('❌ POST Error:', error);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
        }
    },

    put: async (endpoint: string, data: any) => {
        try {
            const token = await AsyncStorage.getItem('token');
            
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            
            // Solo agregar token si no es un endpoint público
            if (token && !isPublicEndpoint(endpoint)) {
                headers.Authorization = `Bearer ${token}`;
            }
            
            const response = await Promise.race([
                fetch(`${API_URL}${endpoint}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(data),
                }),
                timeoutPromise(API_TIMEOUT),
            ]);
            
            return await handleResponse(response as Response);
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
        }
    },

    delete: async (endpoint: string) => {
        try {
            const token = await AsyncStorage.getItem('token');
            
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            
            // Solo agregar token si no es un endpoint público
            if (token && !isPublicEndpoint(endpoint)) {
                headers.Authorization = `Bearer ${token}`;
            }
            
            const response = await Promise.race([
                fetch(`${API_URL}${endpoint}`, {
                    method: 'DELETE',
                    headers,
                }),
                timeoutPromise(API_TIMEOUT),
            ]);
            
            return await handleResponse(response as Response);
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
        }
    },
}; 