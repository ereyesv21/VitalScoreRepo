import { api } from './api';
import { authService } from './auth';

export interface RegistrationData {
    nombre: string;
    apellido: string;
    correo: string;
    contraseña: string;
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

    // Complete registration flow with automatic login
    completeRegistration: async (userData: RegistrationData, additionalData?: any) => {
        try {
            // Step 1: Create user
            const userResponse = await registrationService.register(userData);
            const userId = userResponse.usuarioId;

            // Step 2: Create role-specific profile
            if (userData.rol === 1) { // Paciente
                const patientData: PatientRegistrationData = {
                    usuario: userId,
                    puntos: 0, // Start with 0 points
                    id_eps: additionalData?.id_eps || 1, // Default EPS or from form
                };
                await registrationService.createPatientProfile(patientData);
            } else if (userData.rol === 2) { // Médico
                const doctorData: DoctorRegistrationData = {
                    usuario: userId,
                    especialidad: additionalData?.especialidad || 'General',
                    eps: additionalData?.eps || 1, // Default EPS or from form
                };
                await registrationService.createDoctorProfile(doctorData);
            }

            // Step 3: Automatically log in the user
            const loginResponse = await authService.login({
                correo: userData.correo,
                contraseña: userData.contraseña
            });

            return { 
                success: true, 
                userId,
                loginResponse,
                role: userData.rol === 1 ? 'paciente' : 'medico'
            };
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },
}; 