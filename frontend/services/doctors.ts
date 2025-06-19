import { api } from './api';

// Interface matching the database schema
export interface Medico {
    id_medico: number;
    especialidad: string;
    usuario: number;  // Foreign key to Usuarios
    eps: number;      // Foreign key to EPS
}

// Interface for user data (joined with medico)
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

// Interface for EPS data
export interface EPS {
    id_eps: number;
    nombre: string;
    tipo: string;
    fecha_registro: Date;
    estado: string;
}

// Combined interface for doctor with user and EPS data
export interface DoctorWithUser extends Medico {
    usuario_data?: Usuario;
    eps_data?: EPS;
    activePatients?: number;
}

export interface DoctorStats {
    totalPatients: number;
    averageVitalScore: number;
    appointmentsToday: number;
}

export const doctorService = {
    // Get current doctor's data
    getCurrentDoctor: async (): Promise<DoctorWithUser> => {
        return api.get('/medico/current');
    },

    // Get doctor's statistics
    getDoctorStats: async (): Promise<DoctorStats> => {
        return api.get('/medico/stats');
    },

    // Get doctor's patients
    getDoctorPatients: async (): Promise<any[]> => {
        return api.get('/medico/pacientes');
    },

    // Get doctor's appointments
    getDoctorAppointments: async () => {
        return api.get('/medico/citas');
    },

    // Update doctor information
    updateDoctor: async (id: number, data: Partial<Medico>): Promise<Medico> => {
        return api.put(`/medico/${id}`, data);
    },

    // Get doctor's treatment plans
    getDoctorPlans: async () => {
        return api.get('/medico/planes');
    },

    // Get doctor's tasks
    getDoctorTasks: async () => {
        return api.get('/medico/tareas');
    },
}; 