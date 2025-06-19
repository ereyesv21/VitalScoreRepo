import { Notificaciones } from "./Notificaciones";

export interface NotificacionesPort {
    createNotificacion(notificacion: Omit<Notificaciones, 'id_notificacion'>): Promise<number>;
    updateNotificacion(id: number, notificacion: Partial<Notificaciones>): Promise<boolean>;
    deleteNotificacion(id: number): Promise<boolean>;
    getNotificacionById(id: number): Promise<Notificaciones | null>;
    getAllNotificaciones(): Promise<Notificaciones[]>;
    getNotificacionesByPaciente(paciente: number): Promise<Notificaciones[]>;
    getNotificacionesPorFecha(fechaInicio: Date, fechaFin: Date): Promise<Notificaciones[]>;
} 