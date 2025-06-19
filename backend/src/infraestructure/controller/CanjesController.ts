import { Request, Response } from "express";
import { CanjesApplicationService } from "../../application/CanjesApplicationService";
import { Canjes } from "../../domain/Canjes";

export class CanjesController {
    private readonly canjesApplicationService: CanjesApplicationService;

    constructor(canjesApplicationService: CanjesApplicationService) {
        this.canjesApplicationService = canjesApplicationService;
    }

    async createCanje(req: Request, res: Response): Promise<void> {
        try {
            const { paciente, recompensa, puntos_utilizados, fecha_canje, estado } = req.body;

            if (!paciente || typeof paciente !== "number") {
                res.status(400).json({ error: "El campo 'paciente' es requerido y debe ser un número" });
                return;
            }
            if (!recompensa || typeof recompensa !== "number") {
                res.status(400).json({ error: "El campo 'recompensa' es requerido y debe ser un número" });
                return;
            }
            if (!puntos_utilizados || typeof puntos_utilizados !== "number") {
                res.status(400).json({ error: "El campo 'puntos_utilizados' es requerido y debe ser un número" });
                return;
            }
            if (!fecha_canje) {
                res.status(400).json({ error: "El campo 'fecha_canje' es requerido" });
                return;
            }
            if (!estado || typeof estado !== "string") {
                res.status(400).json({ error: "El campo 'estado' es requerido y debe ser una cadena de texto" });
                return;
            }

            const canjeData: Omit<Canjes, "id_canje"> = {
                paciente,
                recompensa,
                puntos_utilizados,
                fecha_canje: new Date(fecha_canje),
                estado: estado.trim()
            };

            const idCanje = await this.canjesApplicationService.createCanje(canjeData);
            res.status(201).json({
                message: "Canje creado exitosamente",
                id_canje: idCanje
            });
        } catch (error) {
            console.error("Error al crear canje:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getAllCanjes(req: Request, res: Response): Promise<void> {
        try {
            const canjes = await this.canjesApplicationService.getAllCanjes();
            res.status(200).json(canjes);
        } catch (error) {
            console.error("Error al obtener canjes:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getCanjeById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID del canje debe ser un número positivo" });
                return;
            }

            const canje = await this.canjesApplicationService.getCanjeById(id);

            if (!canje) {
                res.status(404).json({ error: "Canje no encontrado" });
                return;
            }

            res.status(200).json(canje);
        } catch (error) {
            console.error("Error al obtener canje por ID:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getCanjesByPaciente(req: Request, res: Response): Promise<void> {
        try {
            const paciente = parseInt(req.params.paciente);

            if (isNaN(paciente) || paciente <= 0) {
                res.status(400).json({ error: "El ID del paciente debe ser un número positivo" });
                return;
            }

            const canjes = await this.canjesApplicationService.getCanjesByPaciente(paciente);
            res.status(200).json(canjes);
        } catch (error) {
            console.error("Error al obtener canjes por paciente:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getCanjesByEstado(req: Request, res: Response): Promise<void> {
        try {
            const { estado } = req.params;

            if (!estado || typeof estado !== "string") {
                res.status(400).json({ error: "El estado es requerido y debe ser una cadena de texto" });
                return;
            }

            const canjes = await this.canjesApplicationService.getCanjesByEstado(estado);
            res.status(200).json(canjes);
        } catch (error) {
            console.error("Error al obtener canjes por estado:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getCanjesPorFecha(req: Request, res: Response): Promise<void> {
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

            const canjes = await this.canjesApplicationService.getCanjesPorFecha(inicio, fin);
            res.status(200).json(canjes);
        } catch (error) {
            console.error("Error al obtener canjes por fecha:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getCanjesPorPuntos(req: Request, res: Response): Promise<void> {
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

            const canjes = await this.canjesApplicationService.getCanjesPorPuntos(min, max);
            res.status(200).json(canjes);
        } catch (error) {
            console.error("Error al obtener canjes por puntos:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async updateCanje(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID del canje debe ser un número positivo" });
                return;
            }

            const { paciente, recompensa, puntos_utilizados, fecha_canje, estado } = req.body;
            const updateData: Partial<Canjes> = {};

            if (paciente !== undefined) {
                if (typeof paciente !== "number" || paciente <= 0) {
                    res.status(400).json({ error: "El ID del paciente debe ser un número positivo" });
                    return;
                }
                updateData.paciente = paciente;
            }
            if (recompensa !== undefined) {
                if (typeof recompensa !== "number" || recompensa <= 0) {
                    res.status(400).json({ error: "El ID de la recompensa debe ser un número positivo" });
                    return;
                }
                updateData.recompensa = recompensa;
            }
            if (puntos_utilizados !== undefined) {
                if (typeof puntos_utilizados !== "number" || puntos_utilizados <= 0) {
                    res.status(400).json({ error: "Los puntos utilizados deben ser un número positivo" });
                    return;
                }
                updateData.puntos_utilizados = puntos_utilizados;
            }
            if (fecha_canje !== undefined) {
                const fecha = new Date(fecha_canje);
                if (isNaN(fecha.getTime())) {
                    res.status(400).json({ error: "La fecha de canje debe tener un formato válido" });
                    return;
                }
                updateData.fecha_canje = fecha;
            }
            if (estado !== undefined) {
                if (typeof estado !== "string" || estado.trim().length === 0) {
                    res.status(400).json({ error: "El estado no puede estar vacío" });
                    return;
                }
                updateData.estado = estado.trim();
            }

            const success = await this.canjesApplicationService.updateCanje(id, updateData);

            if (!success) {
                res.status(404).json({ error: "Canje no encontrado" });
                return;
            }

            res.status(200).json({ message: "Canje actualizado exitosamente" });
        } catch (error) {
            console.error("Error al actualizar canje:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async deleteCanje(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID del canje debe ser un número positivo" });
                return;
            }

            const success = await this.canjesApplicationService.deleteCanje(id);

            if (!success) {
                res.status(404).json({ error: "Canje no encontrado" });
                return;
            }

            res.status(200).json({ message: "Canje eliminado exitosamente" });
        } catch (error) {
            console.error("Error al eliminar canje:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }
}
