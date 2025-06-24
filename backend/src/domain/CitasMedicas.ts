export interface CitasMedicas {
    id_cita: number;
    paciente: number;
    medico: number;
    fecha_cita: Date;
    hora_inicio: string;
    hora_fin: string;
    estado: 'programada' | 'confirmada' | 'en_progreso' | 'completada' | 'cancelada' | 'no_asistio';
    motivo_consulta?: string;
    observaciones?: string;
    fecha_creacion: Date;
    fecha_modificacion: Date;
    cancelado_por?: string;
    motivo_cancelacion?: string;
} 