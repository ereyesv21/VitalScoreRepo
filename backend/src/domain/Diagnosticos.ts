export interface Diagnosticos {
    id_diagnostico: number;
    paciente: number;
    medico: number;
    cita?: number | null;
    enfermedad?: number | null;
    diagnostico: string;
    observaciones?: string;
    fecha_diagnostico: Date;
    estado: 'activo' | 'inactivo' | 'resuelto' | 'pendiente';
    fecha_creacion: Date;
} 