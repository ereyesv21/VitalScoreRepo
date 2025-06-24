import { MedicoApplicationService } from "../../application/MedicoApplicationService";
import { Request, Response } from "express";
import { Medicos } from "../../domain/Medico";

export class MedicoController {
    private app: MedicoApplicationService;

    constructor(app: MedicoApplicationService) {
        this.app = app;
    }

    async createMedico(req: Request, res: Response): Promise<Response> {
        try {
            const { especialidad, usuario, eps } = req.body;

            // Validaciones básicas
            if (!especialidad || isNaN(Number(especialidad)))
                return res.status(400).json({ error: "La especialidad debe ser un id numérico válido" });

            if (!usuario || typeof usuario !== "number" || usuario <= 0)
                return res.status(400).json({ error: "El ID del usuario debe ser un número válido" });

            if (!eps || typeof eps !== "number" || eps <= 0)
                return res.status(400).json({ error: "El ID de la EPS debe ser un número válido" });

            const medico: Omit<Medicos, "id_medico"> = {
                especialidad: Number(especialidad),
                usuario,
                eps
            };

            const medicoId = await this.app.createMedico(medico);

            return res.status(201).json({ message: "Médico creado con éxito", medicoId });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({
                    error: "Error interno del servidor",
                    details: error.message,
                });
            }
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getMedicoById(req: Request, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: "El id debe ser un número o id invalido" });
            
            const medico = await this.app.getMedicoById(id);
            if (!medico) return res.status(404).json({ error: "Médico no encontrado" });
            
            return res.status(200).json(medico);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({
                    error: "Error interno del servidor",
                    details: error.message,
                });
            }
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getMedicoByEspecialidad(req: Request, res: Response): Promise<Response> {
        try {
            const { especialidad } = req.params;
            const especialidadId = Number(especialidad);
            if (!especialidad || isNaN(especialidadId))
                return res.status(400).json({ error: "La especialidad debe ser un id numérico válido" });

            const medicos = await this.app.getMedicoByEspecialidad(especialidadId);
            return res.status(200).json(medicos);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({
                    error: "Error interno del servidor",
                    details: error.message,
                });
            }
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getMedicoByUsuario(req: Request, res: Response): Promise<Response> {
        try {
            const usuario = parseInt(req.params.usuario);
            if (isNaN(usuario)) return res.status(400).json({ error: "El ID del usuario debe ser un número válido" });
            
            const medico = await this.app.getMedicoByUsuario(usuario);
            if (!medico) return res.status(404).json({ error: "Médico no encontrado para este usuario" });
            
            return res.status(200).json(medico);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({
                    error: "Error interno del servidor",
                    details: error.message,
                });
            }
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getMedicoByEps(req: Request, res: Response): Promise<Response> {
        try {
            const eps = parseInt(req.params.eps);
            if (isNaN(eps)) return res.status(400).json({ error: "El ID de la EPS debe ser un número válido" });
            
            const medicos = await this.app.getMedicoByEps(eps);
            return res.status(200).json(medicos);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({
                    error: "Error interno del servidor",
                    details: error.message,
                });
            }
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getAllMedicos(req: Request, res: Response): Promise<Response> {
        try {
            const medicos = await this.app.getAllMedicos();
            return res.status(200).json(medicos);
        } catch (error) {
            return res.status(500).json({ error: "Error al obtener los médicos" });
        }
    }

    async deleteMedico(req: Request, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: "El id debe ser un número o id invalido" });
            
            const deleted = await this.app.deleteMedico(id);
            if (!deleted) return res.status(404).json({ error: "Médico no encontrado" });
            
            return res.status(200).json({ message: "Médico eliminado con éxito" });
        } catch (error) {
            return res.status(500).json({ error: "Error al eliminar el médico" });
        }
    }

    async updateMedico(req: Request, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: "El id debe ser un número o id invalido" });
            
            const { especialidad, usuario, eps } = req.body;

            // Validaciones básicas para campos opcionales
            if (especialidad && isNaN(Number(especialidad)))
                return res.status(400).json({ error: "La especialidad debe ser un id numérico válido" });

            if (usuario && (typeof usuario !== "number" || usuario <= 0))
                return res.status(400).json({ error: "El ID del usuario debe ser un número válido" });

            if (eps && (typeof eps !== "number" || eps <= 0))
                return res.status(400).json({ error: "El ID de la EPS debe ser un número válido" });

            // Preparar datos para actualización
            const updateData: Partial<Medicos> = {};
            if (especialidad) updateData.especialidad = Number(especialidad);
            if (usuario) updateData.usuario = usuario;
            if (eps) updateData.eps = eps;

            // Verificar que al menos un campo se va a actualizar
            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ error: "Al menos un campo debe ser proporcionado para actualizar" });
            }

            const updated = await this.app.updateMedico(id, updateData);

            if (!updated) return res.status(404).json({ error: "Médico no encontrado" });

            return res.status(200).json({ message: "Médico actualizado con éxito", medico: updated });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({
                    error: "Error interno del servidor",
                    details: error.message,
                });
            }
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }
}
