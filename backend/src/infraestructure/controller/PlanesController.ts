import { Request, Response } from "express";
import { PlanesApplicationService } from "../../application/PlanesApplicationService";
import { Planes } from "../../domain/Planes";

export class PlanesController {
    private readonly planesApplicationService: PlanesApplicationService;

    constructor(planesApplicationService: PlanesApplicationService) {
        this.planesApplicationService = planesApplicationService;
    }

    async createPlan(req: Request, res: Response): Promise<void> {
        try {
            const { paciente, medico, descripcion, fecha_inicio, fecha_fin, estado } = req.body;

            // Validaciones de entrada
            if (!paciente || typeof paciente !== 'number') {
                res.status(400).json({ error: "El campo 'paciente' es requerido y debe ser un número" });
                return;
            }

            if (!medico || typeof medico !== 'number') {
                res.status(400).json({ error: "El campo 'medico' es requerido y debe ser un número" });
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

            if (paciente <= 0) {
                res.status(400).json({ error: "El ID del paciente debe ser un número positivo" });
                return;
            }

            if (medico <= 0) {
                res.status(400).json({ error: "El ID del médico debe ser un número positivo" });
                return;
            }

            if (descripcion.trim().length === 0) {
                res.status(400).json({ error: "La descripción no puede estar vacía" });
                return;
            }

            if (descripcion.length > 500) {
                res.status(400).json({ error: "La descripción no puede exceder 500 caracteres" });
                return;
            }

            const planData: Omit<Planes, "id_plan"> = {
                paciente,
                medico,
                descripcion: descripcion.trim(),
                fecha_inicio: new Date(fecha_inicio),
                fecha_fin: new Date(fecha_fin),
                estado: estado.trim()
            };

            const idPlan = await this.planesApplicationService.createPlan(planData);
            res.status(201).json({ 
                message: "Plan creado exitosamente", 
                id_plan: idPlan 
            });
        } catch (error) {
            console.error("Error al crear plan:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getAllPlanes(req: Request, res: Response): Promise<void> {
        try {
            const planes = await this.planesApplicationService.getAllPlanes();
            res.status(200).json(planes);
        } catch (error) {
            console.error("Error al obtener planes:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getPlanById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID del plan debe ser un número positivo" });
                return;
            }

            const plan = await this.planesApplicationService.getPlanById(id);
            
            if (!plan) {
                res.status(404).json({ error: "Plan no encontrado" });
                return;
            }

            res.status(200).json(plan);
        } catch (error) {
            console.error("Error al obtener plan por ID:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getPlanesByPaciente(req: Request, res: Response): Promise<void> {
        try {
            const paciente = parseInt(req.params.paciente);
            
            if (isNaN(paciente) || paciente <= 0) {
                res.status(400).json({ error: "El ID del paciente debe ser un número positivo" });
                return;
            }

            const planes = await this.planesApplicationService.getPlanesByPaciente(paciente);
            res.status(200).json(planes);
        } catch (error) {
            console.error("Error al obtener planes por paciente:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getPlanesByMedico(req: Request, res: Response): Promise<void> {
        try {
            const medico = parseInt(req.params.medico);
            
            if (isNaN(medico) || medico <= 0) {
                res.status(400).json({ error: "El ID del médico debe ser un número positivo" });
                return;
            }

            const planes = await this.planesApplicationService.getPlanesByMedico(medico);
            res.status(200).json(planes);
        } catch (error) {
            console.error("Error al obtener planes por médico:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getPlanesByEstado(req: Request, res: Response): Promise<void> {
        try {
            const { estado } = req.params;
            
            if (!estado || typeof estado !== 'string') {
                res.status(400).json({ error: "El estado es requerido y debe ser una cadena de texto" });
                return;
            }

            const planes = await this.planesApplicationService.getPlanesByEstado(estado);
            res.status(200).json(planes);
        } catch (error) {
            console.error("Error al obtener planes por estado:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getPlanesActivos(req: Request, res: Response): Promise<void> {
        try {
            const planes = await this.planesApplicationService.getPlanesActivos();
            res.status(200).json(planes);
        } catch (error) {
            console.error("Error al obtener planes activos:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getPlanesPorFecha(req: Request, res: Response): Promise<void> {
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

            const planes = await this.planesApplicationService.getPlanesPorFecha(inicio, fin);
            res.status(200).json(planes);
        } catch (error) {
            console.error("Error al obtener planes por fecha:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async updatePlan(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID del plan debe ser un número positivo" });
                return;
            }

            const { paciente, medico, descripcion, fecha_inicio, fecha_fin, estado } = req.body;
            const updateData: Partial<Planes> = {};

            // Validar y agregar campos solo si están presentes
            if (paciente !== undefined) {
                if (typeof paciente !== 'number' || paciente <= 0) {
                    res.status(400).json({ error: "El ID del paciente debe ser un número positivo" });
                    return;
                }
                updateData.paciente = paciente;
            }

            if (medico !== undefined) {
                if (typeof medico !== 'number' || medico <= 0) {
                    res.status(400).json({ error: "El ID del médico debe ser un número positivo" });
                    return;
                }
                updateData.medico = medico;
            }

            if (descripcion !== undefined) {
                if (typeof descripcion !== 'string') {
                    res.status(400).json({ error: "La descripción debe ser una cadena de texto" });
                    return;
                }
                if (descripcion.trim().length === 0) {
                    res.status(400).json({ error: "La descripción no puede estar vacía" });
                    return;
                }
                if (descripcion.length > 500) {
                    res.status(400).json({ error: "La descripción no puede exceder 500 caracteres" });
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
                if (typeof estado !== 'string') {
                    res.status(400).json({ error: "El estado debe ser una cadena de texto" });
                    return;
                }
                updateData.estado = estado.trim();
            }

            const success = await this.planesApplicationService.updatePlan(id, updateData);
            
            if (!success) {
                res.status(404).json({ error: "Plan no encontrado" });
                return;
            }

            res.status(200).json({ message: "Plan actualizado exitosamente" });
        } catch (error) {
            console.error("Error al actualizar plan:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async deletePlan(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID del plan debe ser un número positivo" });
                return;
            }

            const success = await this.planesApplicationService.deletePlan(id);
            
            if (!success) {
                res.status(404).json({ error: "Plan no encontrado" });
                return;
            }

            res.status(200).json({ message: "Plan eliminado exitosamente" });
        } catch (error) {
            console.error("Error al eliminar plan:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    // Métodos específicos para gestión de estados

    async activarPlan(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID del plan debe ser un número positivo" });
                return;
            }

            const success = await this.planesApplicationService.activarPlan(id);
            
            if (!success) {
                res.status(404).json({ error: "Plan no encontrado" });
                return;
            }

            res.status(200).json({ message: "Plan activado exitosamente" });
        } catch (error) {
            console.error("Error al activar plan:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async desactivarPlan(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID del plan debe ser un número positivo" });
                return;
            }

            const success = await this.planesApplicationService.desactivarPlan(id);
            
            if (!success) {
                res.status(404).json({ error: "Plan no encontrado" });
                return;
            }

            res.status(200).json({ message: "Plan desactivado exitosamente" });
        } catch (error) {
            console.error("Error al desactivar plan:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async completarPlan(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID del plan debe ser un número positivo" });
                return;
            }

            const success = await this.planesApplicationService.completarPlan(id);
            
            if (!success) {
                res.status(404).json({ error: "Plan no encontrado" });
                return;
            }

            res.status(200).json({ message: "Plan completado exitosamente" });
        } catch (error) {
            console.error("Error al completar plan:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async cancelarPlan(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID del plan debe ser un número positivo" });
                return;
            }

            const success = await this.planesApplicationService.cancelarPlan(id);
            
            if (!success) {
                res.status(404).json({ error: "Plan no encontrado" });
                return;
            }

            res.status(200).json({ message: "Plan cancelado exitosamente" });
        } catch (error) {
            console.error("Error al cancelar plan:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    // Métodos para filtros especiales

    async getPlanesVencidos(req: Request, res: Response): Promise<void> {
        try {
            const planes = await this.planesApplicationService.getPlanesVencidos();
            res.status(200).json(planes);
        } catch (error) {
            console.error("Error al obtener planes vencidos:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getPlanesProximosAVencer(req: Request, res: Response): Promise<void> {
        try {
            const diasLimite = req.query.dias ? parseInt(req.query.dias as string) : 7;
            
            if (isNaN(diasLimite) || diasLimite <= 0) {
                res.status(400).json({ error: "El número de días debe ser un número positivo" });
                return;
            }

            const planes = await this.planesApplicationService.getPlanesProximosAVencer(diasLimite);
            res.status(200).json(planes);
        } catch (error) {
            console.error("Error al obtener planes próximos a vencer:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getPlanesPorRangoDeFechas(req: Request, res: Response): Promise<void> {
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

            const planes = await this.planesApplicationService.getPlanesPorRangoDeFechas(inicio, fin);
            res.status(200).json(planes);
        } catch (error) {
            console.error("Error al obtener planes por rango de fechas:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }
}
