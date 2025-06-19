import { NotificacionesPort } from "../domain/NotificacionesPort";
import { Notificaciones } from "../domain/Notificaciones";
import { PacientePort } from "../domain/PacientePort";

export class NotificacionesApplicationService {
    private readonly notificacionesPort: NotificacionesPort;
    private readonly pacientesPort: PacientePort;

    constructor(notificacionesPort: NotificacionesPort, pacientesPort: PacientePort) {
        this.notificacionesPort = notificacionesPort;
        this.pacientesPort = pacientesPort;
    }

    async createNotificacion(notificacionData: Omit<Notificaciones, "id_notificacion">): Promise<number> {
        // Validar que el paciente existe
        const pacienteExistente = await this.pacientesPort.getPacienteById(notificacionData.paciente);
        if (!pacienteExistente) {
            throw new Error("El paciente especificado no existe");
        }

        // Validar que el mensaje no esté vacío
        if (!notificacionData.mensaje || notificacionData.mensaje.trim().length === 0) {
            throw new Error("El mensaje de la notificación es requerido");
        }

        // Validar que la fecha de envío sea válida
        if (!notificacionData.fecha_envio || isNaN(new Date(notificacionData.fecha_envio).getTime())) {
            throw new Error("La fecha de envío es inválida");
        }

        return await this.notificacionesPort.createNotificacion(notificacionData);
    }

    async getAllNotificaciones(): Promise<Notificaciones[]> {
        return await this.notificacionesPort.getAllNotificaciones();
    }

    async getNotificacionById(id: number): Promise<Notificaciones | null> {
        return await this.notificacionesPort.getNotificacionById(id);
    }

    async getNotificacionesByPaciente(paciente: number): Promise<Notificaciones[]> {
        // Validar que el paciente existe
        const pacienteExistente = await this.pacientesPort.getPacienteById(paciente);
        if (!pacienteExistente) {
            throw new Error("El paciente especificado no existe");
        }
        return await this.notificacionesPort.getNotificacionesByPaciente(paciente);
    }

    async getNotificacionesPorFecha(fechaInicio: Date, fechaFin: Date): Promise<Notificaciones[]> {
        // Validar que las fechas sean válidas
        if (!fechaInicio || !fechaFin || isNaN(new Date(fechaInicio).getTime()) || isNaN(new Date(fechaFin).getTime())) {
            throw new Error("Las fechas de inicio y fin son requeridas y deben ser válidas");
        }
        if (fechaInicio >= fechaFin) {
            throw new Error("La fecha de inicio debe ser anterior a la fecha de fin");
        }
        return await this.notificacionesPort.getNotificacionesPorFecha(fechaInicio, fechaFin);
    }

    async updateNotificacion(id: number, notificacionData: Partial<Notificaciones>): Promise<boolean> {
        // Validar que la notificación existe
        const notificacionExistente = await this.notificacionesPort.getNotificacionById(id);
        if (!notificacionExistente) {
            throw new Error("La notificación no existe");
        }

        // Si se actualiza el paciente, validar que existe
        if (notificacionData.paciente) {
            const pacienteExistente = await this.pacientesPort.getPacienteById(notificacionData.paciente);
            if (!pacienteExistente) {
                throw new Error("El paciente especificado no existe");
            }
        }

        // Si se actualiza el mensaje, validar que no esté vacío
        if (notificacionData.mensaje !== undefined) {
            if (!notificacionData.mensaje || notificacionData.mensaje.trim().length === 0) {
                throw new Error("El mensaje de la notificación no puede estar vacío");
            }
        }

        // Si se actualiza la fecha de envío, validar que sea válida
        if (notificacionData.fecha_envio !== undefined) {
            if (!notificacionData.fecha_envio || isNaN(new Date(notificacionData.fecha_envio).getTime())) {
                throw new Error("La fecha de envío es inválida");
            }
        }

        return await this.notificacionesPort.updateNotificacion(id, notificacionData);
    }

    async deleteNotificacion(id: number): Promise<boolean> {
        // Validar que la notificación existe
        const notificacionExistente = await this.notificacionesPort.getNotificacionById(id);
        if (!notificacionExistente) {
            throw new Error("La notificación no existe");
        }
        return await this.notificacionesPort.deleteNotificacion(id);
    }
} 