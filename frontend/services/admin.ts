import { api } from './api';

export interface Doctor {
  id_medico: number;
  usuario: number;
  especialidad: number;
  eps: number;
  estado: string;
  fecha_registro: string;
  usuario_data?: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    correo: string;
    estado: string;
    genero?: string;
  };
  eps_nombre?: string;
  especialidad_nombre?: string;
}

export interface DoctorSchedule {
  id_horario: number;
  medico: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  pausa_inicio?: string;
  pausa_fin?: string;
  estado: string;
}

export interface CreateDoctorData {
  nombre: string;
  apellido: string;
  correo: string;
  contraseña: string;
  especialidad: string;
  genero: string;
}

export interface UpdateDoctorData {
  nombre?: string;
  apellido?: string;
  correo?: string;
  especialidad?: string;
  estado?: string;
}

export interface CreateScheduleData {
  medico: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  pausa_inicio?: string;
  pausa_fin?: string;
}

export interface AdminStats {
  totalPacientes: number;
  totalMedicos: number;
  totalCitas: number;
  citasHoy: number;
  citasSemana: number;
  pacientesActivos: number;
  medicosActivos: number;
  citasPorEstado: {
    programadas: number;
    confirmadas: number;
    completadas: number;
    canceladas: number;
  };
  topMedicos: Array<{
    medico: string;
    citas: number;
  }>;
  pacientesPorNivel: {
    bronce: number;
    plata: number;
    oro: number;
  };
}

export const adminService = {
  // ===== GESTIÓN DE MÉDICOS =====
  
  // Obtener todos los médicos
  getAllDoctors: async (page?: number, pageSize?: number): Promise<{ items: Doctor[]; total: number }> => {
    const response = await api.get('/medicos');
    const doctors = response as Doctor[];
    
    // For now, return all doctors with pagination info
    // TODO: Implement actual pagination in backend
    return {
      items: doctors,
      total: doctors.length
    };
  },

  // Obtener médico por ID
  getDoctorById: async (id: number): Promise<Doctor> => {
    return api.get(`/medico/${id}`);
  },

  // Crear nuevo médico
  createDoctor: async (data: CreateDoctorData): Promise<Doctor> => {
    return api.post('/medico', data);
  },

  // Actualizar médico
  updateDoctor: async (id: number, data: UpdateDoctorData): Promise<Doctor> => {
    return api.put(`/medico/${id}`, data);
  },

  // Eliminar médico
  deleteDoctor: async (id: number): Promise<void> => {
    return api.delete(`/medico/${id}`);
  },

  // Activar médico
  activateDoctor: async (id: number): Promise<Doctor> => {
    return api.put(`/medico/${id}/activar`, {});
  },

  // Inactivar médico
  deactivateDoctor: async (id: number): Promise<Doctor> => {
    return api.put(`/medico/${id}/inactivar`, {});
  },

  // Obtener médicos por especialidad
  getDoctorsBySpecialty: async (specialty: string): Promise<Doctor[]> => {
    return api.get(`/medicos/especialidad/${specialty}`);
  },

  // Obtener médicos activos
  getActiveDoctors: async (): Promise<Doctor[]> => {
    return api.get('/medicos/activos');
  },

  // ===== GESTIÓN DE HORARIOS =====

  // Obtener horarios de un médico
  getDoctorSchedules: async (doctorId: number): Promise<DoctorSchedule[]> => {
    return api.get(`/horarios-medicos/medico/${doctorId}`);
  },

  // Crear horario para médico
  createSchedule: async (data: CreateScheduleData): Promise<DoctorSchedule> => {
    return api.post('/horario-medico', data);
  },

  // Actualizar horario
  updateSchedule: async (id: number, data: Partial<CreateScheduleData>): Promise<DoctorSchedule> => {
    return api.put(`/horario-medico/${id}`, data);
  },

  // Eliminar horario
  deleteSchedule: async (id: number): Promise<void> => {
    return api.delete(`/horario-medico/${id}`);
  },

  // Obtener disponibilidad de un médico
  getDoctorAvailability: async (doctorId: number, date: string): Promise<any> => {
    return api.get(`/horarios-medicos/${doctorId}/disponibilidad?fecha=${date}`);
  },

  // ===== GESTIÓN DE PACIENTES =====

  // Obtener todos los pacientes
  getAllPatients: async (): Promise<any[]> => {
    return api.get('/pacientes');
  },

  // Obtener estadísticas de pacientes
  getPatientStats: async (): Promise<any> => {
    return api.get('/pacientes/stats');
  },

  // Obtener pacientes por nivel de puntos
  getPatientsByLevel: async (level: 'bronce' | 'plata' | 'oro'): Promise<any[]> => {
    return api.get(`/pacientes/nivel/${level}`);
  },

  // ===== ESTADÍSTICAS GENERALES =====

  // Obtener estadísticas del dashboard
  getDashboardStats: async (): Promise<AdminStats> => {
    return api.get('/admin/stats');
  },

  // Obtener estadísticas de citas
  getAppointmentStats: async (): Promise<any> => {
    return api.get('/citas-medicas/stats');
  },

  // Obtener top médicos más agendados
  getTopDoctors: async (limit: number = 5): Promise<any[]> => {
    return api.get(`/admin/top-medicos?limit=${limit}`);
  },

  // Obtener estadísticas por período
  getStatsByPeriod: async (startDate: string, endDate: string): Promise<any> => {
    return api.get(`/admin/stats-periodo?inicio=${startDate}&fin=${endDate}`);
  },

  // ===== GESTIÓN DE ESPECIALIDADES =====

  // Obtener todas las especialidades
  getAllSpecialties: async (): Promise<{ data: any[] }> => {
    return api.get('/especialidades');
  },

  // Crear especialidad
  createSpecialty: async (data: { nombre: string; descripcion?: string }): Promise<any> => {
    return api.post('/especialidad', data);
  },

  // Actualizar especialidad
  updateSpecialty: async (id: number, data: { nombre?: string; descripcion?: string }): Promise<any> => {
    return api.put(`/especialidad/${id}`, data);
  },

  // Eliminar especialidad
  deleteSpecialty: async (id: number): Promise<void> => {
    return api.delete(`/especialidad/${id}`);
  },

  // ===== GESTIÓN DE ENFERMEDADES =====

  // Obtener todas las enfermedades
  getAllDiseases: async (): Promise<any[]> => {
    return api.get('/enfermedades');
  },

  // Crear enfermedad
  createDisease: async (data: { nombre: string; descripcion?: string }): Promise<any> => {
    return api.post('/enfermedad', data);
  },

  // Actualizar enfermedad
  updateDisease: async (id: number, data: { nombre?: string; descripcion?: string }): Promise<any> => {
    return api.put(`/enfermedad/${id}`, data);
  },

  // Eliminar enfermedad
  deleteDisease: async (id: number): Promise<void> => {
    return api.delete(`/enfermedad/${id}`);
  },

  // ===== GESTIÓN DE MEDICAMENTOS =====

  // Obtener todos los medicamentos
  getAllMedications: async (): Promise<any[]> => {
    return api.get('/medicamentos');
  },

  // Crear medicamento
  createMedication: async (data: {
    nombre: string;
    descripcion?: string;
    dosis_recomendada?: string;
    frecuencia?: string;
    duracion_tratamiento?: string;
  }): Promise<any> => {
    return api.post('/medicamento', data);
  },

  // Actualizar medicamento
  updateMedication: async (id: number, data: any): Promise<any> => {
    return api.put(`/medicamento/${id}`, data);
  },

  // Eliminar medicamento
  deleteMedication: async (id: number): Promise<void> => {
    return api.delete(`/medicamento/${id}`);
  },

  // ===== REPORTES =====

  // Generar reporte de citas
  generateAppointmentReport: async (startDate: string, endDate: string): Promise<any> => {
    return api.get(`/admin/reportes/citas?inicio=${startDate}&fin=${endDate}`);
  },

  // Generar reporte de pacientes
  generatePatientReport: async (): Promise<any> => {
    return api.get('/admin/reportes/pacientes');
  },

  // Generar reporte de médicos
  generateDoctorReport: async (): Promise<any> => {
    return api.get('/admin/reportes/medicos');
  }
}; 