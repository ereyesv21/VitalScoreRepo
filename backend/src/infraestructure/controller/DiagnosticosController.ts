import { Request, Response } from "express";
import { DiagnosticosApplicationService } from "../../application/DiagnosticosApplicationService";
import { Diagnosticos } from "../../domain/Diagnosticos";

export class DiagnosticosController {
    private readonly appService: DiagnosticosApplicationService;

    constructor(appService: DiagnosticosApplicationService) {
        this.appService = appService;
    }

    async createDiagnostico(req: Request, res: Response): Promise<void> {
        try {
            const { paciente, medico, cita, enfermedad, diagnostico, observaciones, fecha_diagnostico, estado } = req.body;
            if (!paciente || typeof paciente !== 'number') {
                res.status(400).json({ error: "El campo 'paciente' es requerido y debe ser un número" });
                return;
            }
            if (!medico || typeof medico !== 'number') {
                res.status(400).json({ error: "El campo 'medico' es requerido y debe ser un número" });
                return;
            }
            if (!diagnostico || typeof diagnostico !== 'string' || diagnostico.trim() === '') {
                res.status(400).json({ error: "El campo 'diagnostico' es requerido y debe ser un string no vacío" });
                return;
            }
            if (!fecha_diagnostico) {
                res.status(400).json({ error: "El campo 'fecha_diagnostico' es requerido" });
                return;
            }
            const diagData: Omit<Diagnosticos, "id_diagnostico" | "fecha_creacion"> = {
                paciente,
                medico,
                cita: cita ?? null,
                enfermedad: enfermedad ?? null,
                diagnostico,
                observaciones,
                fecha_diagnostico: new Date(fecha_diagnostico),
                estado: estado || 'activo'
            };
            const id = await this.appService.createDiagnostico(diagData);
            res.status(201).json({ message: "Diagnóstico creado exitosamente", id_diagnostico: id });
        } catch (error) {
            console.error("Error al crear diagnóstico:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getAllDiagnosticos(req: Request, res: Response): Promise<void> {
        try {
            const diags = await this.appService.getAllDiagnosticos();
            res.status(200).json(diags);
        } catch (error) {
            console.error("Error al obtener diagnósticos:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getDiagnosticoById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID debe ser un número positivo" });
                return;
            }
            const diag = await this.appService.getDiagnosticoById(id);
            if (!diag) {
                res.status(404).json({ error: "Diagnóstico no encontrado" });
                return;
            }
            res.status(200).json(diag);
        } catch (error) {
            console.error("Error al obtener diagnóstico por ID:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getDiagnosticosByPaciente(req: Request, res: Response): Promise<void> {
        try {
            const paciente = parseInt(req.params.paciente);
            if (isNaN(paciente) || paciente <= 0) {
                res.status(400).json({ error: "El ID del paciente debe ser un número positivo" });
                return;
            }
            const diags = await this.appService.getDiagnosticosByPaciente(paciente);
            res.status(200).json(diags);
        } catch (error) {
            console.error("Error al obtener diagnósticos por paciente:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getDiagnosticosByMedico(req: Request, res: Response): Promise<void> {
        try {
            const medico = parseInt(req.params.medico);
            if (isNaN(medico) || medico <= 0) {
                res.status(400).json({ error: "El ID del médico debe ser un número positivo" });
                return;
            }
            const diags = await this.appService.getDiagnosticosByMedico(medico);
            res.status(200).json(diags);
        } catch (error) {
            console.error("Error al obtener diagnósticos por médico:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getDiagnosticosByCita(req: Request, res: Response): Promise<void> {
        try {
            const cita = parseInt(req.params.cita);
            if (isNaN(cita) || cita <= 0) {
                res.status(400).json({ error: "El ID de la cita debe ser un número positivo" });
                return;
            }
            const diags = await this.appService.getDiagnosticosByCita(cita);
            res.status(200).json(diags);
        } catch (error) {
            console.error("Error al obtener diagnósticos por cita:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getDiagnosticosByEnfermedad(req: Request, res: Response): Promise<void> {
        try {
            const enfermedad = parseInt(req.params.enfermedad);
            if (isNaN(enfermedad) || enfermedad <= 0) {
                res.status(400).json({ error: "El ID de la enfermedad debe ser un número positivo" });
                return;
            }
            const diags = await this.appService.getDiagnosticosByEnfermedad(enfermedad);
            res.status(200).json(diags);
        } catch (error) {
            console.error("Error al obtener diagnósticos por enfermedad:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getDiagnosticosByEstado(req: Request, res: Response): Promise<void> {
        try {
            const estado = req.params.estado as Diagnosticos['estado'];
            if (!estado) {
                res.status(400).json({ error: "El estado es requerido" });
                return;
            }
            const diags = await this.appService.getDiagnosticosByEstado(estado);
            res.status(200).json(diags);
        } catch (error) {
            console.error("Error al obtener diagnósticos por estado:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getDiagnosticosByFecha(req: Request, res: Response): Promise<void> {
        try {
            const fecha = req.params.fecha;
            if (!fecha) {
                res.status(400).json({ error: "La fecha es requerida" });
                return;
            }
            const diags = await this.appService.getDiagnosticosByFecha(new Date(fecha));
            res.status(200).json(diags);
        } catch (error) {
            console.error("Error al obtener diagnósticos por fecha:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getDiagnosticosByPacienteAndEstado(req: Request, res: Response): Promise<void> {
        try {
            const paciente = parseInt(req.params.paciente);
            const estado = req.params.estado as Diagnosticos['estado'];
            if (isNaN(paciente) || paciente <= 0 || !estado) {
                res.status(400).json({ error: "Parámetros inválidos" });
                return;
            }
            const diags = await this.appService.getDiagnosticosByPacienteAndEstado(paciente, estado);
            res.status(200).json(diags);
        } catch (error) {
            console.error("Error al obtener diagnósticos por paciente y estado:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getDiagnosticosByMedicoAndEstado(req: Request, res: Response): Promise<void> {
        try {
            const medico = parseInt(req.params.medico);
            const estado = req.params.estado as Diagnosticos['estado'];
            if (isNaN(medico) || medico <= 0 || !estado) {
                res.status(400).json({ error: "Parámetros inválidos" });
                return;
            }
            const diags = await this.appService.getDiagnosticosByMedicoAndEstado(medico, estado);
            res.status(200).json(diags);
        } catch (error) {
            console.error("Error al obtener diagnósticos por médico y estado:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async updateDiagnostico(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID debe ser un número positivo" });
                return;
            }
            const updateData: Partial<Diagnosticos> = req.body;
            const success = await this.appService.updateDiagnostico(id, updateData);
            if (success) {
                res.status(200).json({ message: "Diagnóstico actualizado exitosamente" });
            } else {
                res.status(404).json({ error: "Diagnóstico no encontrado" });
            }
        } catch (error) {
            console.error("Error al actualizar diagnóstico:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async deleteDiagnostico(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID debe ser un número positivo" });
                return;
            }
            const success = await this.appService.deleteDiagnostico(id);
            if (success) {
                res.status(200).json({ message: "Diagnóstico eliminado exitosamente" });
            } else {
                res.status(404).json({ error: "Diagnóstico no encontrado" });
            }
        } catch (error) {
            console.error("Error al eliminar diagnóstico:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getDiagnosticosActivos(req: Request, res: Response): Promise<void> {
        try {
            const diags = await this.appService.getDiagnosticosActivos();
            res.status(200).json(diags);
        } catch (error) {
            console.error("Error al obtener diagnósticos activos:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getDiagnosticosRecientes(req: Request, res: Response): Promise<void> {
        try {
            const dias = parseInt(req.params.dias) || 7;
            if (dias <= 0) {
                res.status(400).json({ error: "El número de días debe ser positivo" });
                return;
            }
            const diags = await this.appService.getDiagnosticosRecientes(dias);
            res.status(200).json(diags);
        } catch (error) {
            console.error("Error al obtener diagnósticos recientes:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async marcarComoResuelto(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID debe ser un número positivo" });
                return;
            }
            const success = await this.appService.marcarComoResuelto(id);
            if (success) {
                res.status(200).json({ message: "Diagnóstico marcado como resuelto" });
            } else {
                res.status(404).json({ error: "Diagnóstico no encontrado" });
            }
        } catch (error) {
            console.error("Error al marcar diagnóstico como resuelto:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async marcarComoPendiente(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID debe ser un número positivo" });
                return;
            }
            const success = await this.appService.marcarComoPendiente(id);
            if (success) {
                res.status(200).json({ message: "Diagnóstico marcado como pendiente" });
            } else {
                res.status(404).json({ error: "Diagnóstico no encontrado" });
            }
        } catch (error) {
            console.error("Error al marcar diagnóstico como pendiente:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async activarDiagnostico(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID debe ser un número positivo" });
                return;
            }
            const success = await this.appService.activarDiagnostico(id);
            if (success) {
                res.status(200).json({ message: "Diagnóstico activado" });
            } else {
                res.status(404).json({ error: "Diagnóstico no encontrado" });
            }
        } catch (error) {
            console.error("Error al activar diagnóstico:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async desactivarDiagnostico(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID debe ser un número positivo" });
                return;
            }
            const success = await this.appService.desactivarDiagnostico(id);
            if (success) {
                res.status(200).json({ message: "Diagnóstico desactivado" });
            } else {
                res.status(404).json({ error: "Diagnóstico no encontrado" });
            }
        } catch (error) {
            console.error("Error al desactivar diagnóstico:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }
} 