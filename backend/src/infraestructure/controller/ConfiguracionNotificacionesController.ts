import { Request, Response } from "express";
import { ConfiguracionNotificacionesApplicationService } from "../../application/ConfiguracionNotificacionesApplicationService";
import { ConfiguracionNotificaciones } from "../../domain/ConfiguracionNotificaciones";

export class ConfiguracionNotificacionesController {
    private readonly appService: ConfiguracionNotificacionesApplicationService;

    constructor(appService: ConfiguracionNotificacionesApplicationService) {
        this.appService = appService;
    }

    async createConfiguracion(req: Request, res: Response): Promise<void> {
        try {
            const { paciente, medico, tipo_notificacion, activo, hora_inicio, hora_fin, dias_semana } = req.body;
            if (!tipo_notificacion || typeof tipo_notificacion !== 'string') {
                res.status(400).json({ error: "El campo 'tipo_notificacion' es requerido y debe ser un string" });
                return;
            }
            if (!hora_inicio || typeof hora_inicio !== 'string') {
                res.status(400).json({ error: "El campo 'hora_inicio' es requerido y debe ser un string" });
                return;
            }
            if (!hora_fin || typeof hora_fin !== 'string') {
                res.status(400).json({ error: "El campo 'hora_fin' es requerido y debe ser un string" });
                return;
            }
            if (!Array.isArray(dias_semana) || dias_semana.length === 0) {
                res.status(400).json({ error: "El campo 'dias_semana' es requerido y debe ser un array de números" });
                return;
            }
            const configData: Omit<ConfiguracionNotificaciones, "id_configuracion" | "fecha_creacion"> = {
                paciente: paciente ?? null,
                medico: medico ?? null,
                tipo_notificacion,
                activo: activo !== undefined ? activo : true,
                hora_inicio,
                hora_fin,
                dias_semana
            };
            const id = await this.appService.createConfiguracion(configData);
            res.status(201).json({ message: "Configuración creada exitosamente", id_configuracion: id });
        } catch (error) {
            console.error("Error al crear configuración:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getAllConfiguraciones(req: Request, res: Response): Promise<void> {
        try {
            const configs = await this.appService.getAllConfiguraciones();
            res.status(200).json(configs);
        } catch (error) {
            console.error("Error al obtener configuraciones:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getConfiguracionById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID debe ser un número positivo" });
                return;
            }
            const config = await this.appService.getConfiguracionById(id);
            if (!config) {
                res.status(404).json({ error: "Configuración no encontrada" });
                return;
            }
            res.status(200).json(config);
        } catch (error) {
            console.error("Error al obtener configuración por ID:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getConfiguracionesByPaciente(req: Request, res: Response): Promise<void> {
        try {
            const paciente = parseInt(req.params.paciente);
            if (isNaN(paciente) || paciente <= 0) {
                res.status(400).json({ error: "El ID del paciente debe ser un número positivo" });
                return;
            }
            const configs = await this.appService.getConfiguracionesByPaciente(paciente);
            res.status(200).json(configs);
        } catch (error) {
            console.error("Error al obtener configuraciones por paciente:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getConfiguracionesByMedico(req: Request, res: Response): Promise<void> {
        try {
            const medico = parseInt(req.params.medico);
            if (isNaN(medico) || medico <= 0) {
                res.status(400).json({ error: "El ID del médico debe ser un número positivo" });
                return;
            }
            const configs = await this.appService.getConfiguracionesByMedico(medico);
            res.status(200).json(configs);
        } catch (error) {
            console.error("Error al obtener configuraciones por médico:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getConfiguracionByPacienteAndTipo(req: Request, res: Response): Promise<void> {
        try {
            const paciente = parseInt(req.params.paciente);
            const tipo = req.params.tipo;
            if (isNaN(paciente) || paciente <= 0 || !tipo) {
                res.status(400).json({ error: "Parámetros inválidos" });
                return;
            }
            const config = await this.appService.getConfiguracionByPacienteAndTipo(paciente, tipo);
            if (!config) {
                res.status(404).json({ error: "Configuración no encontrada" });
                return;
            }
            res.status(200).json(config);
        } catch (error) {
            console.error("Error al obtener configuración por paciente y tipo:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getConfiguracionByMedicoAndTipo(req: Request, res: Response): Promise<void> {
        try {
            const medico = parseInt(req.params.medico);
            const tipo = req.params.tipo;
            if (isNaN(medico) || medico <= 0 || !tipo) {
                res.status(400).json({ error: "Parámetros inválidos" });
                return;
            }
            const config = await this.appService.getConfiguracionByMedicoAndTipo(medico, tipo);
            if (!config) {
                res.status(404).json({ error: "Configuración no encontrada" });
                return;
            }
            res.status(200).json(config);
        } catch (error) {
            console.error("Error al obtener configuración por médico y tipo:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async updateConfiguracion(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID debe ser un número positivo" });
                return;
            }
            const updateData: Partial<ConfiguracionNotificaciones> = req.body;
            const success = await this.appService.updateConfiguracion(id, updateData);
            if (success) {
                res.status(200).json({ message: "Configuración actualizada exitosamente" });
            } else {
                res.status(404).json({ error: "Configuración no encontrada" });
            }
        } catch (error) {
            console.error("Error al actualizar configuración:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async deleteConfiguracion(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID debe ser un número positivo" });
                return;
            }
            const success = await this.appService.deleteConfiguracion(id);
            if (success) {
                res.status(200).json({ message: "Configuración eliminada exitosamente" });
            } else {
                res.status(404).json({ error: "Configuración no encontrada" });
            }
        } catch (error) {
            console.error("Error al eliminar configuración:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }
} 