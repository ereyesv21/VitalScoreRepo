import { Request, Response } from "express";
import { PacientMedicosApplicationService } from "../../application/PacientMedicosApplicationService";
import { Pacientes_Medicos } from "../../domain/PacientMedicos";

export class PacientMedicosController {
    private readonly pacientMedicosApplicationService: PacientMedicosApplicationService;

    constructor(pacientMedicosApplicationService: PacientMedicosApplicationService) {
        this.pacientMedicosApplicationService = pacientMedicosApplicationService;
    }

    async createRelacion(req: Request, res: Response): Promise<void> {
        try {
            const { Paciente, Medico, fecha_asignacion } = req.body;

            // Validaciones de entrada
            if (!Paciente || typeof Paciente !== 'number') {
                res.status(400).json({ error: "El campo 'Paciente' es requerido y debe ser un número" });
                return;
            }

            if (!Medico || typeof Medico !== 'number') {
                res.status(400).json({ error: "El campo 'Medico' es requerido y debe ser un número" });
                return;
            }

            if (!fecha_asignacion) {
                res.status(400).json({ error: "El campo 'fecha_asignacion' es requerido" });
                return;
            }

            if (Paciente <= 0) {
                res.status(400).json({ error: "El ID del paciente debe ser un número positivo" });
                return;
            }

            if (Medico <= 0) {
                res.status(400).json({ error: "El ID del médico debe ser un número positivo" });
                return;
            }

            const relacionData: Omit<Pacientes_Medicos, "id"> = {
                Paciente,
                Medico,
                fecha_asignacion: new Date(fecha_asignacion)
            };

            const idRelacion = await this.pacientMedicosApplicationService.createRelacion(relacionData);
            res.status(201).json({ 
                message: "Relación paciente-médico creada exitosamente", 
                id: idRelacion 
            });
        } catch (error) {
            console.error("Error al crear relación paciente-médico:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getAllRelaciones(req: Request, res: Response): Promise<void> {
        try {
            const relaciones = await this.pacientMedicosApplicationService.getAllRelaciones();
            res.status(200).json(relaciones);
        } catch (error) {
            console.error("Error al obtener relaciones:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getRelacionById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID de la relación debe ser un número positivo" });
                return;
            }

            const relacion = await this.pacientMedicosApplicationService.getRelacionById(id);
            
            if (!relacion) {
                res.status(404).json({ error: "Relación paciente-médico no encontrada" });
                return;
            }

            res.status(200).json(relacion);
        } catch (error) {
            console.error("Error al obtener relación por ID:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async updateRelacion(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID de la relación debe ser un número positivo" });
                return;
            }

            const { Paciente, Medico, fecha_asignacion } = req.body;
            const updateData: Partial<Pacientes_Medicos> = {};

            // Validar y agregar campos solo si están presentes
            if (Paciente !== undefined) {
                if (typeof Paciente !== 'number' || Paciente <= 0) {
                    res.status(400).json({ error: "El ID del paciente debe ser un número positivo" });
                    return;
                }
                updateData.Paciente = Paciente;
            }

            if (Medico !== undefined) {
                if (typeof Medico !== 'number' || Medico <= 0) {
                    res.status(400).json({ error: "El ID del médico debe ser un número positivo" });
                    return;
                }
                updateData.Medico = Medico;
            }

            if (fecha_asignacion !== undefined) {
                const fecha = new Date(fecha_asignacion);
                if (isNaN(fecha.getTime())) {
                    res.status(400).json({ error: "La fecha de asignación debe tener un formato válido" });
                    return;
                }
                updateData.fecha_asignacion = fecha;
            }

            const success = await this.pacientMedicosApplicationService.updateRelacion(id, updateData);
            
            if (!success) {
                res.status(404).json({ error: "Relación paciente-médico no encontrada" });
                return;
            }

            res.status(200).json({ message: "Relación paciente-médico actualizada exitosamente" });
        } catch (error) {
            console.error("Error al actualizar relación:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async deleteRelacion(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID de la relación debe ser un número positivo" });
                return;
            }

            const success = await this.pacientMedicosApplicationService.deleteRelacion(id);
            
            if (!success) {
                res.status(404).json({ error: "Relación paciente-médico no encontrada" });
                return;
            }

            res.status(200).json({ message: "Relación paciente-médico eliminada exitosamente" });
        } catch (error) {
            console.error("Error al eliminar relación:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getRelacionesByPaciente(req: Request, res: Response): Promise<void> {
        try {
            const paciente = parseInt(req.params.paciente);
            
            if (isNaN(paciente) || paciente <= 0) {
                res.status(400).json({ error: "El ID del paciente debe ser un número positivo" });
                return;
            }

            const relaciones = await this.pacientMedicosApplicationService.getRelacionesByPaciente(paciente);
            res.status(200).json(relaciones);
        } catch (error) {
            console.error("Error al obtener relaciones por paciente:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getRelacionesByMedico(req: Request, res: Response): Promise<void> {
        try {
            const medico = parseInt(req.params.medico);
            
            if (isNaN(medico) || medico <= 0) {
                res.status(400).json({ error: "El ID del médico debe ser un número positivo" });
                return;
            }

            const relaciones = await this.pacientMedicosApplicationService.getRelacionesByMedico(medico);
            res.status(200).json(relaciones);
        } catch (error) {
            console.error("Error al obtener relaciones por médico:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getRelacionesPorFecha(req: Request, res: Response): Promise<void> {
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

            const relaciones = await this.pacientMedicosApplicationService.getRelacionesPorFecha(inicio, fin);
            res.status(200).json(relaciones);
        } catch (error) {
            console.error("Error al obtener relaciones por fecha:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }
}
