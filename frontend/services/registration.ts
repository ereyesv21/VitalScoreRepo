import { api } from './api';
import { authService } from './auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RegistrationData {
    nombre: string;
    apellido: string;
    correo: string;
    password: string;
    genero: string;
    rol: number; // 1 for paciente, 2 for medico
    especialidad?: string; // Required for doctors
}

export interface RegistrationResponse {
    message: string;
    usuarioId: number;
    token: string;
    rol: 'paciente' | 'medico';
}

export interface PatientRegistrationData {
    usuario: number;
    puntos: number;
    id_eps: number;
}

export interface DoctorRegistrationData {
    usuario: number;
    especialidad: string;
    eps: number;
}

export const registrationService = {
    async register(data: RegistrationData): Promise<RegistrationResponse> {
        try {
            const response = await api.post('/register', data);
            return response;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    // Create patient profile after user registration
    createPatientProfile: async (patientData: PatientRegistrationData) => {
        return api.post('/paciente', patientData);
    },

    // Create doctor profile after user registration
    createDoctorProfile: async (doctorData: DoctorRegistrationData) => {
        return api.post('/medico', doctorData);
    },

    // Complete registration flow - simplified to use backend's complete registration
    completeRegistration: async (userData: RegistrationData, additionalData?: any) => {
        try {
            // Combine user data with additional data
            const registrationData = {
                ...userData,
                ...additionalData
            };

            // Call the backend's complete registration endpoint
            const response = await api.post('/register', registrationData);
            
            // Store the token if provided
            if (response.token) {
                await AsyncStorage.setItem('token', response.token);
                await AsyncStorage.setItem('user', JSON.stringify({
                    id: response.usuarioId,
                    rol: response.rol
                }));
            }

            return { 
                success: true, 
                userId: response.usuarioId,
                token: response.token,
                role: response.rol,
                message: response.message
            };
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },
}; 