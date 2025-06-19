import { Request, Response } from "express";
import { NotificacionesApplicationService } from "../../application/NotificacionesApplicationService";

export class NotificacionesController {
    private notificacionesApplicationService: NotificacionesApplicationService;

    constructor(notificacionesApplicationService: NotificacionesApplicationService) {
        this.notificacionesApplicationService = notificacionesApplicationService;
    }

    // POST /notificacion - Crear nueva notificación
    async createNotificacion(req: Request, res: Response): Promise<void> {
        try {
            const { paciente, mensaje, fecha_envio } = req.body;

            // Validaciones básicas
            if (!paciente || !mensaje) {
                res.status(400).json({
                    success: false,
                    message: "Faltan campos requeridos: paciente, mensaje"
                });
                return;
            }

            const notificacionData = {
                paciente: Number(paciente),
                mensaje,
                fecha_envio: fecha_envio ? new Date(fecha_envio) : new Date()
            };

            const id = await this.notificacionesApplicationService.createNotificacion(notificacionData);

            res.status(201).json({
                success: true,
                message: "Notificación creada exitosamente",
                data: { id_notificacion: id }
            });
        } catch (error) {
            console.error("Error creating notificacion:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Error interno del servidor"
            });
        }
    }

    // GET /notificaciones - Obtener todas las notificaciones
    async getAllNotificaciones(req: Request, res: Response): Promise<void> {
        try {
            const notificaciones = await this.notificacionesApplicationService.getAllNotificaciones();

            res.status(200).json({
                success: true,
                message: "Notificaciones obtenidas exitosamente",
                data: notificaciones
            });
        } catch (error) {
            console.error("Error fetching notificaciones:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Error interno del servidor"
            });
        }
    }

    // GET /notificacion/:id - Obtener notificación por ID
    async getNotificacionById(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "ID de notificación inválido"
                });
                return;
            }

            const notificacion = await this.notificacionesApplicationService.getNotificacionById(id);

            if (!notificacion) {
                res.status(404).json({
                    success: false,
                    message: "Notificación no encontrada"
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Notificación obtenida exitosamente",
                data: notificacion
            });
        } catch (error) {
            console.error("Error fetching notificacion by ID:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Error interno del servidor"
            });
        }
    }

    // GET /notificaciones/paciente/:paciente - Obtener notificaciones por paciente
    async getNotificacionesByPaciente(req: Request, res: Response): Promise<void> {
        try {
            const paciente = Number(req.params.paciente);

            if (isNaN(paciente)) {
                res.status(400).json({
                    success: false,
                    message: "ID de paciente inválido"
                });
                return;
            }

            const notificaciones = await this.notificacionesApplicationService.getNotificacionesByPaciente(paciente);

            res.status(200).json({
                success: true,
                message: "Notificaciones del paciente obtenidas exitosamente",
                data: notificaciones
            });
        } catch (error) {
            console.error("Error fetching notificaciones by paciente:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Error interno del servidor"
            });
        }
    }

    // POST /notificaciones/por-fecha - Obtener notificaciones por rango de fechas
    async getNotificacionesPorFecha(req: Request, res: Response): Promise<void> {
        try {
            const { fechaInicio, fechaFin } = req.body;

            if (!fechaInicio || !fechaFin) {
                res.status(400).json({
                    success: false,
                    message: "Fechas de inicio y fin son requeridas"
                });
                return;
            }

            const fechaInicioDate = new Date(fechaInicio);
            const fechaFinDate = new Date(fechaFin);

            if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaFinDate.getTime())) {
                res.status(400).json({
                    success: false,
                    message: "Formato de fecha inválido"
                });
                return;
            }

            const notificaciones = await this.notificacionesApplicationService.getNotificacionesPorFecha(fechaInicioDate, fechaFinDate);

            res.status(200).json({
                success: true,
                message: "Notificaciones por fecha obtenidas exitosamente",
                data: notificaciones
            });
        } catch (error) {
            console.error("Error fetching notificaciones by fecha:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Error interno del servidor"
            });
        }
    }

    // PUT /notificacion/:id - Actualizar notificación
    async updateNotificacion(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const updateData = req.body;

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "ID de notificación inválido"
                });
                return;
            }

            // Convertir tipos si es necesario
            if (updateData.paciente) updateData.paciente = Number(updateData.paciente);
            if (updateData.fecha_envio) updateData.fecha_envio = new Date(updateData.fecha_envio);

            const success = await this.notificacionesApplicationService.updateNotificacion(id, updateData);

            if (!success) {
                res.status(404).json({
                    success: false,
                    message: "Notificación no encontrada"
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Notificación actualizada exitosamente"
            });
        } catch (error) {
            console.error("Error updating notificacion:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Error interno del servidor"
            });
        }
    }

    // DELETE /notificacion/:id - Eliminar notificación
    async deleteNotificacion(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: "ID de notificación inválido"
                });
                return;
            }

            const success = await this.notificacionesApplicationService.deleteNotificacion(id);

            if (!success) {
                res.status(404).json({
                    success: false,
                    message: "Notificación no encontrada"
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Notificación eliminada exitosamente"
            });
        } catch (error) {
            console.error("Error deleting notificacion:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Error interno del servidor"
            });
        }
    }
} 