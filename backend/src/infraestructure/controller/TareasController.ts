import { Request, Response } from "express";
import { TareasApplicationService } from "../../application/TareasApplicationService";
import { Tareas } from "../../domain/Tareas";

export class TareasController {
    private readonly tareasApplicationService: TareasApplicationService;

    constructor(tareasApplicationService: TareasApplicationService) {
        this.tareasApplicationService = tareasApplicationService;
    }

    async createTarea(req: Request, res: Response): Promise<void> {
        try {
            const { plan, nombre_tarea, descripcion, fecha_inicio, fecha_fin, estado } = req.body;

            // Validaciones de entrada
            if (!plan || typeof plan !== 'number') {
                res.status(400).json({ error: "El campo 'plan' es requerido y debe ser un número" });
                return;
            }
            if (!nombre_tarea || typeof nombre_tarea !== 'string') {
                res.status(400).json({ error: "El campo 'nombre_tarea' es requerido y debe ser una cadena de texto" });
                return;
            }
            if (!descripcion || typeof descripcion !== 'string') {
                res.status(400).json({ error: "El campo 'descripcion' es requerido y debe ser una cadena de texto" });
                return;
            }
            if (!fecha_inicio) {
                res.status(400).json({ error: "El campo 'fecha_inicio' es requerido" });
                return;
            }
            if (!fecha_fin) {
                res.status(400).json({ error: "El campo 'fecha_fin' es requerido" });
                return;
            }
            if (!estado || typeof estado !== 'string') {
                res.status(400).json({ error: "El campo 'estado' es requerido y debe ser una cadena de texto" });
                return;
            }

            const tareaData: Omit<Tareas, "id_tarea"> = {
                plan,
                nombre_tarea: nombre_tarea.trim(),
                descripcion: descripcion.trim(),
                fecha_inicio: new Date(fecha_inicio),
                fecha_fin: new Date(fecha_fin),
                estado: estado.trim()
            };

            const idTarea = await this.tareasApplicationService.createTarea(tareaData);
            res.status(201).json({
                message: "Tarea creada exitosamente",
                id_tarea: idTarea
            });
        } catch (error) {
            console.error("Error al crear tarea:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getAllTareas(req: Request, res: Response): Promise<void> {
        try {
            const tareas = await this.tareasApplicationService.getAllTareas();
            res.status(200).json(tareas);
        } catch (error) {
            console.error("Error al obtener tareas:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getTareaById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID de la tarea debe ser un número positivo" });
                return;
            }

            const tarea = await this.tareasApplicationService.getTareaById(id);

            if (!tarea) {
                res.status(404).json({ error: "Tarea no encontrada" });
                return;
            }

            res.status(200).json(tarea);
        } catch (error) {
            console.error("Error al obtener tarea por ID:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getTareasByPlan(req: Request, res: Response): Promise<void> {
        try {
            const plan = parseInt(req.params.plan);

            if (isNaN(plan) || plan <= 0) {
                res.status(400).json({ error: "El ID del plan debe ser un número positivo" });
                return;
            }

            const tareas = await this.tareasApplicationService.getTareasByPlan(plan);
            res.status(200).json(tareas);
        } catch (error) {
            console.error("Error al obtener tareas por plan:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getTareasByEstado(req: Request, res: Response): Promise<void> {
        try {
            const { estado } = req.params;

            if (!estado || typeof estado !== 'string') {
                res.status(400).json({ error: "El estado es requerido y debe ser una cadena de texto" });
                return;
            }

            const tareas = await this.tareasApplicationService.getTareasByEstado(estado);
            res.status(200).json(tareas);
        } catch (error) {
            console.error("Error al obtener tareas por estado:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getTareasPorFecha(req: Request, res: Response): Promise<void> {
        try {
            const { fechaInicio, fechaFin } = req.query;

            if (!fechaInicio || !fechaFin) {
                res.status(400).json({ error: "Las fechas de inicio y fin son requeridas" });
                return;
            }

            const inicio = new Date(fechaInicio as string);
            const fin = new Date(fechaFin as string);

            if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
                res.status(400).json({ error: "Las fechas deben tener un formato válido" });
                return;
            }

            const tareas = await this.tareasApplicationService.getTareasPorFecha(inicio, fin);
            res.status(200).json(tareas);
        } catch (error) {
            console.error("Error al obtener tareas por fecha:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async updateTarea(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID de la tarea debe ser un número positivo" });
                return;
            }

            const { plan, nombre_tarea, descripcion, fecha_inicio, fecha_fin, estado } = req.body;
            const updateData: Partial<Tareas> = {};

            if (plan !== undefined) {
                if (typeof plan !== 'number' || plan <= 0) {
                    res.status(400).json({ error: "El ID del plan debe ser un número positivo" });
                    return;
                }
                updateData.plan = plan;
            }
            if (nombre_tarea !== undefined) {
                if (typeof nombre_tarea !== 'string' || nombre_tarea.trim().length === 0) {
                    res.status(400).json({ error: "El nombre de la tarea no puede estar vacío" });
                    return;
                }
                updateData.nombre_tarea = nombre_tarea.trim();
            }
            if (descripcion !== undefined) {
                if (typeof descripcion !== 'string' || descripcion.trim().length === 0) {
                    res.status(400).json({ error: "La descripción de la tarea no puede estar vacía" });
                    return;
                }
                updateData.descripcion = descripcion.trim();
            }
            if (fecha_inicio !== undefined) {
                const inicio = new Date(fecha_inicio);
                if (isNaN(inicio.getTime())) {
                    res.status(400).json({ error: "La fecha de inicio debe tener un formato válido" });
                    return;
                }
                updateData.fecha_inicio = inicio;
            }
            if (fecha_fin !== undefined) {
                const fin = new Date(fecha_fin);
                if (isNaN(fin.getTime())) {
                    res.status(400).json({ error: "La fecha de fin debe tener un formato válido" });
                    return;
                }
                updateData.fecha_fin = fin;
            }
            if (estado !== undefined) {
                if (typeof estado !== 'string' || estado.trim().length === 0) {
                    res.status(400).json({ error: "El estado debe ser una cadena de texto válida" });
                    return;
                }
                updateData.estado = estado.trim();
            }

            const success = await this.tareasApplicationService.updateTarea(id, updateData);

            if (!success) {
                res.status(404).json({ error: "Tarea no encontrada" });
                return;
            }

            res.status(200).json({ message: "Tarea actualizada exitosamente" });
        } catch (error) {
            console.error("Error al actualizar tarea:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async deleteTarea(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID de la tarea debe ser un número positivo" });
                return;
            }

            const success = await this.tareasApplicationService.deleteTarea(id);

            if (!success) {
                res.status(404).json({ error: "Tarea no encontrada" });
                return;
            }

            res.status(200).json({ message: "Tarea eliminada exitosamente" });
        } catch (error) {
            console.error("Error al eliminar tarea:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }
}
