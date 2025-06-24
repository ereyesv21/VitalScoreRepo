export interface ConfiguracionNotificaciones {
    id_configuracion: number;
    paciente?: number | null;
    medico?: number | null;
    tipo_notificacion: string;
    activo: boolean;
    hora_inicio: string;
    hora_fin: string;
    dias_semana: number[];
    fecha_creacion: Date;
} 