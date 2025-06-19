import { Request, Response } from "express";
import { Historial_Puntos } from "../../domain/HistorialPuntos";
import { HistorialPuntosApplicationService } from "../../application/HistorialPuntosApplicationService";

export class HistorialPuntosController {
    private readonly historialPuntosApplicationService: HistorialPuntosApplicationService;

    constructor(historialPuntosApplicationService: HistorialPuntosApplicationService) {
        this.historialPuntosApplicationService = historialPuntosApplicationService;
    }

    async createHistorial(req: Request, res: Response): Promise<void> {
        try {
            const { paciente, puntos, fecha_registro, descripcion } = req.body;

            if (!paciente || typeof paciente !== 'number' || paciente <= 0) {
                res.status(400).json({ error: "El campo 'paciente' es requerido y debe ser un número positivo" });
                return;
            }
            if (typeof puntos !== 'number') {
                res.status(400).json({ error: "El campo 'puntos' es requerido y debe ser un número" });
                return;
            }
            if (!fecha_registro) {
                res.status(400).json({ error: "El campo 'fecha_registro' es requerido" });
                return;
            }
            if (!descripcion || typeof descripcion !== 'string' || descripcion.trim().length === 0) {
                res.status(400).json({ error: "El campo 'descripcion' es requerido y debe ser una cadena de texto" });
                return;
            }
            if (descripcion.length > 500) {
                res.status(400).json({ error: "La descripción no puede exceder 500 caracteres" });
                return;
            }

            const historialData: Omit<Historial_Puntos, "id_historial"> = {
                paciente,
                puntos,
                fecha_registro: new Date(fecha_registro),
                descripcion: descripcion.trim()
            };

            const idHistorial = await this.historialPuntosApplicationService.createHistorial(historialData);
            res.status(201).json({
                message: "Historial de puntos creado exitosamente",
                id_historial: idHistorial
            });
        } catch (error) {
            console.error("Error al crear historial de puntos:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getAllHistoriales(req: Request, res: Response): Promise<void> {
        try {
            const historiales = await this.historialPuntosApplicationService.getAllHistoriales();
            res.status(200).json(historiales);
        } catch (error) {
            console.error("Error al obtener historiales:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getHistorialById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID del historial debe ser un número positivo" });
                return;
            }

            const historial = await this.historialPuntosApplicationService.getHistorialById(id);

            if (!historial) {
                res.status(404).json({ error: "Historial de puntos no encontrado" });
                return;
            }

            res.status(200).json(historial);
        } catch (error) {
            console.error("Error al obtener historial por ID:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async updateHistorial(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID del historial debe ser un número positivo" });
                return;
            }

            const { paciente, puntos, fecha_registro, descripcion } = req.body;
            const updateData: Partial<Historial_Puntos> = {};

            if (paciente !== undefined) {
                if (typeof paciente !== 'number' || paciente <= 0) {
                    res.status(400).json({ error: "El ID del paciente debe ser un número positivo" });
                    return;
                }
                updateData.paciente = paciente;
            }
            if (puntos !== undefined) {
                if (typeof puntos !== 'number') {
                    res.status(400).json({ error: "El campo 'puntos' debe ser un número" });
                    return;
                }
                updateData.puntos = puntos;
            }
            if (fecha_registro !== undefined) {
                const fecha = new Date(fecha_registro);
                if (isNaN(fecha.getTime())) {
                    res.status(400).json({ error: "La fecha de registro debe tener un formato válido" });
                    return;
                }
                updateData.fecha_registro = fecha;
            }
            if (descripcion !== undefined) {
                if (typeof descripcion !== 'string' || descripcion.trim().length === 0) {
                    res.status(400).json({ error: "La descripción debe ser una cadena de texto no vacía" });
                    return;
                }
                if (descripcion.length > 500) {
                    res.status(400).json({ error: "La descripción no puede exceder 500 caracteres" });
                    return;
                }
                updateData.descripcion = descripcion.trim();
            }

            const success = await this.historialPuntosApplicationService.updateHistorial(id, updateData);

            if (!success) {
                res.status(404).json({ error: "Historial de puntos no encontrado" });
                return;
            }

            res.status(200).json({ message: "Historial de puntos actualizado exitosamente" });
        } catch (error) {
            console.error("Error al actualizar historial:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async deleteHistorial(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID del historial debe ser un número positivo" });
                return;
            }

            const success = await this.historialPuntosApplicationService.deleteHistorial(id);

            if (!success) {
                res.status(404).json({ error: "Historial de puntos no encontrado" });
                return;
            }

            res.status(200).json({ message: "Historial de puntos eliminado exitosamente" });
        } catch (error) {
            console.error("Error al eliminar historial:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getHistorialesByPaciente(req: Request, res: Response): Promise<void> {
        try {
            const paciente = parseInt(req.params.paciente);

            if (isNaN(paciente) || paciente <= 0) {
                res.status(400).json({ error: "El ID del paciente debe ser un número positivo" });
                return;
            }

            const historiales = await this.historialPuntosApplicationService.getHistorialesByPaciente(paciente);
            res.status(200).json(historiales);
        } catch (error) {
            console.error("Error al obtener historiales por paciente:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getHistorialesByFecha(req: Request, res: Response): Promise<void> {
        try {
            const { fechaInicio, fechaFin } = req.query;

            if (!fechaInicio || !fechaFin) {
                res.status(400).json({ error: "Los parámetros 'fechaInicio' y 'fechaFin' son requeridos" });
                return;
            }

            const inicio = new Date(fechaInicio as string);
            const fin = new Date(fechaFin as string);

            if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
                res.status(400).json({ error: "Las fechas deben tener un formato válido" });
                return;
            }

            const historiales = await this.historialPuntosApplicationService.getHistorialesByFecha(inicio, fin);
            res.status(200).json(historiales);
        } catch (error) {
            console.error("Error al obtener historiales por fecha:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getHistorialesByPuntos(req: Request, res: Response): Promise<void> {
        try {
            const puntos = parseInt(req.params.puntos);

            if (isNaN(puntos)) {
                res.status(400).json({ error: "El campo 'puntos' debe ser un número" });
                return;
            }

            const historiales = await this.historialPuntosApplicationService.getHistorialesByPuntos(puntos);
            res.status(200).json(historiales);
        } catch (error) {
            console.error("Error al obtener historiales por puntos:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getHistorialesPorRangoPuntos(req: Request, res: Response): Promise<void> {
        try {
            const { puntosMin, puntosMax } = req.query;

            if (puntosMin === undefined || puntosMax === undefined) {
                res.status(400).json({ error: "Los parámetros 'puntosMin' y 'puntosMax' son requeridos" });
                return;
            }

            const min = parseInt(puntosMin as string);
            const max = parseInt(puntosMax as string);

            if (isNaN(min) || isNaN(max)) {
                res.status(400).json({ error: "Los parámetros de puntos deben ser números" });
                return;
            }

            const historiales = await this.historialPuntosApplicationService.getHistorialesPorRangoPuntos(min, max);
            res.status(200).json(historiales);
        } catch (error) {
            console.error("Error al obtener historiales por rango de puntos:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }
}
