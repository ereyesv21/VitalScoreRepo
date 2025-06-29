import { api } from './api';

// Interface matching the database schema
export interface Paciente {
    id_paciente: number;
    puntos: number;
    id_eps: number;
    usuario: number;
    racha_dias?: number;
    ultima_fecha_racha?: string;
}

// Interface for user data (joined with paciente)
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

// Combined interface for patient with user data
export interface PatientWithUser extends Paciente {
    usuario_data?: Usuario;
    eps_data?: {
        id_eps: number;
        nombre: string;
    };
    vitalScore?: number; // Calculated from puntos
    lastActivity?: string;
    riskLevel?: 'low' | 'medium' | 'high';
}

export interface PatientStats {
    highCompliance: number;
    mediumCompliance: number;
    lowCompliance: number;
    averageVitalScore: number;
}

export const patientService = {
    // Get all patients (for doctors)
    getAllPatients: async (): Promise<PatientWithUser[]> => {
        return api.get('/pacientes');
    },

    // Get patient by ID
    getPatientById: async (id: number): Promise<PatientWithUser> => {
        return api.get(`/paciente/${id}`);
    },

    // Get current patient's data (for patients)
    getCurrentPatient: async (): Promise<PatientWithUser> => {
        return api.get('/paciente/current');
    },

    // Get patient statistics (for doctors)
    getPatientStats: async (): Promise<PatientStats> => {
        return api.get('/pacientes/stats');
    },

    // Update patient information
    updatePatient: async (id: number, data: Partial<Paciente>): Promise<Paciente> => {
        return api.put(`/paciente/${id}`, data);
    },

    // Get patient's treatment plan
    getTreatmentPlan: async (patientId: number) => {
        return api.get(`/paciente/${patientId}/plan`);
    },

    // Get patient's appointments
    getAppointments: async (patientId: number) => {
        return api.get(`/paciente/${patientId}/citas`);
    },

    // Get patient's points history
    getPointsHistory: async (patientId: number) => {
        return api.get(`/paciente/${patientId}/historial-puntos`);
    },

    // Get patient's files
    getPatientFiles: async (patientId: number) => {
        return api.get(`/paciente/${patientId}/archivos`);
    },

    // Update patient's daily streak
    updateStreak: async (patientId: number): Promise<{ racha: number; mensaje: string }> => {
        return api.put(`/paciente/${patientId}/racha`, {});
    },

    // Sustraer puntos al paciente
    subtractPoints: async (pacienteId: number, puntos: number) => {
        return api.post(`/paciente/${pacienteId}/puntos/sustraer`, { puntos });
    },
}; 