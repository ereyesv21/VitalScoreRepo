import { api } from './api';

export interface Appointment {
  id_cita: number;
  paciente: number;
  medico: number;
  fecha_cita: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'programada' | 'confirmada' | 'en_progreso' | 'completada' | 'cancelada' | 'no_asistio';
  motivo_consulta?: string;
  observaciones?: string;
  fecha_creacion: string;
  fecha_modificacion: string;
  cancelado_por?: string;
  motivo_cancelacion?: string;
}

export interface AppointmentWithDetails extends Appointment {
  paciente_data?: {
    id_paciente: number;
    nombre: string;
    apellido: string;
    correo: string;
    puntos: number;
  };
  medico_data?: {
    id_medico: number;
    nombre: string;
    apellido: string;
    especialidad: string;
  };
}

export interface CreateAppointmentData {
  paciente: number;
  medico: number;
  fecha_cita: string;
  hora_inicio: string;
  hora_fin: string;
  motivo_consulta?: string;
  estado?: 'programada' | 'confirmada' | 'en_progreso' | 'completada' | 'cancelada' | 'no_asistio';
}

export interface UpdateAppointmentData {
  fecha_cita?: string;
  hora_inicio?: string;
  hora_fin?: string;
  motivo_consulta?: string;
  observaciones?: string;
}

export interface AvailableSlot {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  medico: number;
  disponible: boolean;
}

export const appointmentsService = {
  // Obtener todas las citas (para médicos y administradores)
  getAllAppointments: async (): Promise<AppointmentWithDetails[]> => {
    return api.get('/citas-medicas');
  },

  // Obtener cita por ID
  getAppointmentById: async (id: number): Promise<AppointmentWithDetails> => {
    return api.get(`/cita-medica/${id}`);
  },

  // Obtener citas del paciente actual
  getMyAppointments: async (): Promise<AppointmentWithDetails[]> => {
    return api.get('/citas-medicas/paciente/current');
  },

  // Obtener citas de un paciente específico (para médicos)
  getPatientAppointments: async (patientId: number): Promise<AppointmentWithDetails[]> => {
    return api.get(`/citas-medicas/paciente/${patientId}`);
  },

  // Obtener citas de un médico específico
  getDoctorAppointments: async (doctorId: number): Promise<AppointmentWithDetails[]> => {
    return api.get(`/citas-medicas/medico/${doctorId}`);
  },

  // Obtener citas por estado
  getAppointmentsByStatus: async (status: string): Promise<AppointmentWithDetails[]> => {
    return api.get(`/citas-medicas/estado/${status}`);
  },

  // Obtener citas por fecha
  getAppointmentsByDate: async (date: string): Promise<AppointmentWithDetails[]> => {
    return api.get(`/citas-medicas/fecha/${date}`);
  },

  // Obtener citas próximas
  getUpcomingAppointments: async (days?: number): Promise<AppointmentWithDetails[]> => {
    const params = days ? `?dias=${days}` : '';
    return api.get(`/citas-medicas/proximas${params}`);
  },

  // Obtener citas vencidas
  getExpiredAppointments: async (): Promise<AppointmentWithDetails[]> => {
    return api.get('/citas-medicas/vencidas');
  },

  // Crear nueva cita
  createAppointment: async (data: CreateAppointmentData): Promise<Appointment> => {
    return api.post('/cita-medica', data);
  },

  // Actualizar cita
  updateAppointment: async (id: number, data: UpdateAppointmentData): Promise<Appointment> => {
    return api.put(`/cita-medica/${id}`, data);
  },

  // Eliminar cita
  deleteAppointment: async (id: number): Promise<void> => {
    return api.delete(`/cita-medica/${id}`);
  },

  // Acciones de flujo de la cita
  confirmAppointment: async (id: number): Promise<Appointment> => {
    return api.post(`/cita-medica/${id}/confirmar`, {});
  },

  cancelAppointment: async (id: number, canceladoPor: string, motivo: string): Promise<Appointment> => {
    return api.post(`/cita-medica/${id}/cancelar`, { cancelado_por: canceladoPor, motivo_cancelacion: motivo });
  },

  startAppointment: async (id: number): Promise<Appointment> => {
    return api.post(`/cita-medica/${id}/iniciar`, {});
  },

  completeAppointment: async (id: number): Promise<Appointment> => {
    return api.post(`/cita-medica/${id}/completar`, {});
  },

  markNoShow: async (id: number): Promise<Appointment> => {
    return api.post(`/cita-medica/${id}/no-asistio`, {});
  },

  // Obtener horarios disponibles de un médico
  getAvailableSlots: async (doctorId: number, date: string): Promise<AvailableSlot[]> => {
    return api.get(`/horarios-medicos/${doctorId}/disponibilidad?fecha=${date}`);
  },

  // Verificar disponibilidad para una cita específica
  checkAvailability: async (doctorId: number, date: string, time: string): Promise<boolean> => {
    try {
      const response = await api.get(`/horarios-medicos/${doctorId}/verificar-disponibilidad?fecha=${date}&hora=${time}`);
      return response.disponible;
    } catch (error) {
      return false;
    }
  },

  // Obtener estadísticas de citas (para administradores)
  getAppointmentStats: async (): Promise<{
    total: number;
    programadas: number;
    confirmadas: number;
    completadas: number;
    canceladas: number;
    no_asistio: number;
  }> => {
    return api.get('/citas-medicas/stats');
  }
}; 