import { Request, Response } from "express";
import { RecompensasApplicationService } from "../../application/RecompensasApplicationService";
import { Recompensas } from "../../domain/Recompensas";

export class RecompensasController {
    private readonly recompensasApplicationService: RecompensasApplicationService;

    constructor(recompensasApplicationService: RecompensasApplicationService) {
        this.recompensasApplicationService = recompensasApplicationService;
    }

    async createRecompensa(req: Request, res: Response): Promise<void> {
        try {
            const { proveedor, nombre, descripcion, puntos_necesarios, fecha_creacion, estado } = req.body;

            // Validaciones de entrada
            if (!proveedor || typeof proveedor !== 'number') {
                res.status(400).json({ error: "El campo 'proveedor' es requerido y debe ser un número" });
                return;
            }
            if (!nombre || typeof nombre !== 'string') {
                res.status(400).json({ error: "El campo 'nombre' es requerido y debe ser una cadena de texto" });
                return;
            }
            if (!descripcion || typeof descripcion !== 'string') {
                res.status(400).json({ error: "El campo 'descripcion' es requerido y debe ser una cadena de texto" });
                return;
            }
            if (!puntos_necesarios || typeof puntos_necesarios !== 'number') {
                res.status(400).json({ error: "El campo 'puntos_necesarios' es requerido y debe ser un número" });
                return;
            }
            if (!fecha_creacion) {
                res.status(400).json({ error: "El campo 'fecha_creacion' es requerido" });
                return;
            }
            if (!estado || typeof estado !== 'string') {
                res.status(400).json({ error: "El campo 'estado' es requerido y debe ser una cadena de texto" });
                return;
            }

            const recompensaData: Omit<Recompensas, "id_recompensa"> = {
                proveedor,
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                puntos_necesarios,
                fecha_creacion: new Date(fecha_creacion),
                estado: estado.trim()
            };

            const idRecompensa = await this.recompensasApplicationService.createRecompensa(recompensaData);
            res.status(201).json({
                message: "Recompensa creada exitosamente",
                id_recompensa: idRecompensa
            });
        } catch (error) {
            console.error("Error al crear recompensa:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getAllRecompensas(req: Request, res: Response): Promise<void> {
        try {
            const recompensas = await this.recompensasApplicationService.getAllRecompensas();
            res.status(200).json(recompensas);
        } catch (error) {
            console.error("Error al obtener recompensas:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getRecompensaById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID de la recompensa debe ser un número positivo" });
                return;
            }

            const recompensa = await this.recompensasApplicationService.getRecompensaById(id);

            if (!recompensa) {
                res.status(404).json({ error: "Recompensa no encontrada" });
                return;
            }

            res.status(200).json(recompensa);
        } catch (error) {
            console.error("Error al obtener recompensa por ID:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getRecompensasByProveedor(req: Request, res: Response): Promise<void> {
        try {
            const proveedor = parseInt(req.params.proveedor);

            if (isNaN(proveedor) || proveedor <= 0) {
                res.status(400).json({ error: "El ID del proveedor debe ser un número positivo" });
                return;
            }

            const recompensas = await this.recompensasApplicationService.getRecompensasByProveedor(proveedor);
            res.status(200).json(recompensas);
        } catch (error) {
            console.error("Error al obtener recompensas por proveedor:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getRecompensasByEstado(req: Request, res: Response): Promise<void> {
        try {
            const { estado } = req.params;

            if (!estado || typeof estado !== 'string') {
                res.status(400).json({ error: "El estado es requerido y debe ser una cadena de texto" });
                return;
            }

            const recompensas = await this.recompensasApplicationService.getRecompensasByEstado(estado);
            res.status(200).json(recompensas);
        } catch (error) {
            console.error("Error al obtener recompensas por estado:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getRecompensasPorPuntos(req: Request, res: Response): Promise<void> {
        try {
            const { puntosMin, puntosMax } = req.query;

            if (!puntosMin || !puntosMax) {
                res.status(400).json({ error: "Los parámetros 'puntosMin' y 'puntosMax' son requeridos" });
                return;
            }

            const min = parseInt(puntosMin as string);
            const max = parseInt(puntosMax as string);

            if (isNaN(min) || isNaN(max)) {
                res.status(400).json({ error: "Los parámetros de puntos deben ser números" });
                return;
            }

            const recompensas = await this.recompensasApplicationService.getRecompensasPorPuntos(min, max);
            res.status(200).json(recompensas);
        } catch (error) {
            console.error("Error al obtener recompensas por puntos:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getRecompensasPorFecha(req: Request, res: Response): Promise<void> {
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

            const recompensas = await this.recompensasApplicationService.getRecompensasPorFecha(inicio, fin);
            res.status(200).json(recompensas);
        } catch (error) {
            console.error("Error al obtener recompensas por fecha:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async updateRecompensa(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID de la recompensa debe ser un número positivo" });
                return;
            }

            const { proveedor, nombre, descripcion, puntos_necesarios, fecha_creacion, estado } = req.body;
            const updateData: Partial<Recompensas> = {};

            if (proveedor !== undefined) {
                if (typeof proveedor !== 'number' || proveedor <= 0) {
                    res.status(400).json({ error: "El ID del proveedor debe ser un número positivo" });
                    return;
                }
                updateData.proveedor = proveedor;
            }
            if (nombre !== undefined) {
                if (typeof nombre !== 'string' || nombre.trim().length === 0) {
                    res.status(400).json({ error: "El nombre de la recompensa no puede estar vacío" });
                    return;
                }
                updateData.nombre = nombre.trim();
            }
            if (descripcion !== undefined) {
                if (typeof descripcion !== 'string' || descripcion.trim().length === 0) {
                    res.status(400).json({ error: "La descripción de la recompensa no puede estar vacía" });
                    return;
                }
                updateData.descripcion = descripcion.trim();
            }
            if (puntos_necesarios !== undefined) {
                if (typeof puntos_necesarios !== 'number' || puntos_necesarios <= 0) {
                    res.status(400).json({ error: "Los puntos necesarios deben ser un número positivo" });
                    return;
                }
                updateData.puntos_necesarios = puntos_necesarios;
            }
            if (fecha_creacion !== undefined) {
                const fecha = new Date(fecha_creacion);
                if (isNaN(fecha.getTime())) {
                    res.status(400).json({ error: "La fecha de creación debe tener un formato válido" });
                    return;
                }
                updateData.fecha_creacion = fecha;
            }
            if (estado !== undefined) {
                if (typeof estado !== 'string' || estado.trim().length === 0) {
                    res.status(400).json({ error: "El estado no puede estar vacío" });
                    return;
                }
                updateData.estado = estado.trim();
            }

            const success = await this.recompensasApplicationService.updateRecompensa(id, updateData);

            if (!success) {
                res.status(404).json({ error: "Recompensa no encontrada" });
                return;
            }

            res.status(200).json({ message: "Recompensa actualizada exitosamente" });
        } catch (error) {
            console.error("Error al actualizar recompensa:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async deleteRecompensa(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID de la recompensa debe ser un número positivo" });
                return;
            }

            const success = await this.recompensasApplicationService.deleteRecompensa(id);

            if (!success) {
                res.status(404).json({ error: "Recompensa no encontrada" });
                return;
            }

            res.status(200).json({ message: "Recompensa eliminada exitosamente" });
        } catch (error) {
            console.error("Error al eliminar recompensa:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    // Métodos específicos para gestión de estados

    async activarRecompensa(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID de la recompensa debe ser un número positivo" });
                return;
            }

            const success = await this.recompensasApplicationService.activarRecompensa(id);

            if (!success) {
                res.status(404).json({ error: "Recompensa no encontrada" });
                return;
            }

            res.status(200).json({ message: "Recompensa activada exitosamente" });
        } catch (error) {
            console.error("Error al activar recompensa:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async desactivarRecompensa(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID de la recompensa debe ser un número positivo" });
                return;
            }

            const success = await this.recompensasApplicationService.desactivarRecompensa(id);

            if (!success) {
                res.status(404).json({ error: "Recompensa no encontrada" });
                return;
            }

            res.status(200).json({ message: "Recompensa desactivada exitosamente" });
        } catch (error) {
            console.error("Error al desactivar recompensa:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async marcarComoAgotada(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID de la recompensa debe ser un número positivo" });
                return;
            }

            const success = await this.recompensasApplicationService.marcarComoAgotada(id);

            if (!success) {
                res.status(404).json({ error: "Recompensa no encontrada" });
                return;
            }

            res.status(200).json({ message: "Recompensa marcada como agotada exitosamente" });
        } catch (error) {
            console.error("Error al marcar recompensa como agotada:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getRecompensasDisponibles(req: Request, res: Response): Promise<void> {
        try {
            const recompensas = await this.recompensasApplicationService.getRecompensasDisponibles();
            res.status(200).json(recompensas);
        } catch (error) {
            console.error("Error al obtener recompensas disponibles:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getRecompensasPorRangoDePuntos(req: Request, res: Response): Promise<void> {
        try {
            const { puntosMin, puntosMax } = req.query;

            if (!puntosMin || !puntosMax) {
                res.status(400).json({ error: "Los parámetros 'puntosMin' y 'puntosMax' son requeridos" });
                return;
            }

            const min = parseInt(puntosMin as string);
            const max = parseInt(puntosMax as string);

            if (isNaN(min) || isNaN(max)) {
                res.status(400).json({ error: "Los parámetros de puntos deben ser números" });
                return;
            }

            const recompensas = await this.recompensasApplicationService.getRecompensasPorRangoDePuntos(min, max);
            res.status(200).json(recompensas);
        } catch (error) {
            console.error("Error al obtener recompensas por rango de puntos:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }
}
