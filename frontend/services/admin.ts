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
  disponible?: boolean;
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
  
  // Obtener todos los médicos con datos completos
  getAllDoctors: async (): Promise<Doctor[]> => {
    const medicos = await api.get('/medicos');
    const [usuarios, especialidades, epsList] = await Promise.all([
      api.get('/usuarios'),
      api.get('/especialidades'),
      api.get('/public/eps'),
    ]);
    console.log('medicos:', medicos);
    console.log('usuarios:', usuarios);
    console.log('especialidades:', especialidades);
    console.log('epsList:', epsList);
    const especialidadesArray = Array.isArray(especialidades.data) ? especialidades.data : especialidades;
    const result = medicos.map((medico: any) => ({
      ...medico,
      usuario_data: usuarios.find((u: any) => u.id_usuario === medico.usuario),
      especialidad_nombre: especialidadesArray.find((e: any) => e.id_especialidad === medico.especialidad)?.nombre,
      eps_nombre: epsList.find((e: any) => e.id_eps === medico.eps)?.nombre,
    }));
    console.log('doctores mapeados:', result);
    return result;
  },

  // Obtener médico por ID
  getDoctorById: async (id: number): Promise<Doctor> => {
    return api.get(`/medico/${id}`);
  },

  // Crear médico (usuario + médico)
  createDoctor: async (data: {
    nombre: string;
    apellido: string;
    correo: string;
    contraseña: string;
    especialidad: number;
    genero: string;
    id_eps: number;
  }) => {
    return api.post('/register', {
      ...data,
      rol: 2, // 2 = médico
    });
  },

  // Editar médico (usuario + médico)
  updateDoctor: async (usuarioId: number, medicoId: number, data: {
    nombre?: string;
    apellido?: string;
    correo?: string;
    genero?: string;
    estado?: string;
    especialidad?: number;
    id_eps?: number;
  }) => {
    await api.put(`/usuario/${usuarioId}`, {
      nombre: data.nombre,
      apellido: data.apellido,
      correo: data.correo,
      genero: data.genero,
      estado: data.estado,
    });
    await api.put(`/medico/${medicoId}`, {
      especialidad: data.especialidad,
      eps: data.id_eps,
    });
  },

  // Eliminar médico y usuario
  deleteDoctor: async (medicoId: number, usuarioId: number) => {
    await api.delete(`/medico/${medicoId}`);
    await api.delete(`/usuario/${usuarioId}`);
  },

  // Activar/Inactivar usuario
  setUserStatus: async (usuarioId: number, estado: string) => {
    await api.put(`/usuario/${usuarioId}`, { estado });
  },

  // Obtener médicos por especialidad
  getDoctorsBySpecialty: async (specialty: string): Promise<Doctor[]> => {
    const medicos = await api.get(`/medicos/especialidad/${specialty}`);
    const [usuarios, especialidades, epsList] = await Promise.all([
      api.get('/usuarios'),
      api.get('/especialidades'),
      api.get('/public/eps'),
    ]);
    const especialidadesArray = Array.isArray(especialidades.data) ? especialidades.data : especialidades;
    return medicos.map((medico: any) => ({
      ...medico,
      usuario_data: usuarios.find((u: any) => u.id_usuario === medico.usuario),
      especialidad_nombre: especialidadesArray.find((e: any) => e.id_especialidad === medico.especialidad)?.nombre,
      eps_nombre: epsList.find((e: any) => e.id_eps === medico.eps)?.nombre,
    }));
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

  // Obtener horarios de un médico para una fecha con disponibilidad
  getDoctorAvailableSchedules: async (doctorId: number, date: string): Promise<any[]> => {
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
  },

  // Catálogos
  getEspecialidades: async () => api.get('/especialidades'),
  getEps: async () => api.get('/public/eps'),
}; 