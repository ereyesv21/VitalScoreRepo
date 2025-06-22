import { Request, Response } from "express";
import { PacientesApplicationService } from "../../application/PacientesApplicationService";
import { Pacientes } from "../../domain/Paciente";

export class PacientesController {
    private readonly pacientesApplicationService: PacientesApplicationService;

    constructor(pacientesApplicationService: PacientesApplicationService) {
        this.pacientesApplicationService = pacientesApplicationService;
    }

    async createPaciente(req: Request, res: Response): Promise<void> {
        try {
            const { usuario, id_eps, puntos } = req.body;

            // Validaciones de entrada
            if (!usuario || typeof usuario !== 'number') {
                res.status(400).json({ error: "El campo 'usuario' es requerido y debe ser un número" });
                return;
            }

            if (!id_eps || typeof id_eps !== 'number') {
                res.status(400).json({ error: "El campo 'id_eps' es requerido y debe ser un número" });
                return;
            }

            if (puntos === undefined || typeof puntos !== 'number') {
                res.status(400).json({ error: "El campo 'puntos' es requerido y debe ser un número" });
                return;
            }

            if (usuario <= 0) {
                res.status(400).json({ error: "El ID del usuario debe ser un número positivo" });
                return;
            }

            if (id_eps <= 0) {
                res.status(400).json({ error: "El ID de la EPS debe ser un número positivo" });
                return;
            }

            const pacienteData: Omit<Pacientes, "id_paciente"> = {
                usuario,
                id_eps,
                puntos
            };

            const idPaciente = await this.pacientesApplicationService.createPaciente(pacienteData);
            res.status(201).json({ 
                message: "Paciente creado exitosamente", 
                id_paciente: idPaciente 
            });
        } catch (error) {
            console.error("Error al crear paciente:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getAllPacientes(req: Request, res: Response): Promise<void> {
        try {
            const pacientes = await this.pacientesApplicationService.getAllPacientes();
            res.status(200).json(pacientes);
        } catch (error) {
            console.error("Error al obtener pacientes:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getPacienteById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID del paciente debe ser un número positivo" });
                return;
            }

            const paciente = await this.pacientesApplicationService.getPacienteById(id);
            
            if (!paciente) {
                res.status(404).json({ error: "Paciente no encontrado" });
                return;
            }

            res.status(200).json(paciente);
        } catch (error) {
            console.error("Error al obtener paciente por ID:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getPacienteByUsuario(req: Request, res: Response): Promise<void> {
        try {
            const usuario = parseInt(req.params.usuario);
            
            if (isNaN(usuario) || usuario <= 0) {
                res.status(400).json({ error: "El ID del usuario debe ser un número positivo" });
                return;
            }

            const paciente = await this.pacientesApplicationService.getPacienteByUsuario(usuario);
            
            if (!paciente) {
                res.status(404).json({ error: "Paciente no encontrado para este usuario" });
                return;
            }

            res.status(200).json(paciente);
        } catch (error) {
            console.error("Error al obtener paciente por usuario:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getCurrentPaciente(req: Request, res: Response): Promise<void> {
        try {
            // Obtener el ID del usuario del token JWT
            const userId = (req as any).user.id;
            
            if (!userId) {
                res.status(401).json({ error: "Usuario no autenticado" });
                return;
            }

            const paciente = await this.pacientesApplicationService.getPacienteCompletoByUsuario(userId);
            
            if (!paciente) {
                res.status(404).json({ error: "Paciente no encontrado para este usuario" });
                return;
            }

            res.status(200).json(paciente);
        } catch (error) {
            console.error("Error al obtener paciente actual:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getPacienteByEps(req: Request, res: Response): Promise<void> {
        try {
            const eps = parseInt(req.params.eps);
            
            if (isNaN(eps) || eps <= 0) {
                res.status(400).json({ error: "El ID de la EPS debe ser un número positivo" });
                return;
            }

            const pacientes = await this.pacientesApplicationService.getPacienteByEps(eps);
            res.status(200).json(pacientes);
        } catch (error) {
            console.error("Error al obtener pacientes por EPS:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getPacientesByPuntos(req: Request, res: Response): Promise<void> {
        try {
            const puntos = parseInt(req.params.puntos);
            
            if (isNaN(puntos) || puntos < 0) {
                res.status(400).json({ error: "Los puntos deben ser un número no negativo" });
                return;
            }

            const pacientes = await this.pacientesApplicationService.getPacientesByPuntos(puntos);
            res.status(200).json(pacientes);
        } catch (error) {
            console.error("Error al obtener pacientes por puntos:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async updatePaciente(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID del paciente debe ser un número positivo" });
                return;
            }

            const { usuario, id_eps, puntos } = req.body;
            const updateData: Partial<Pacientes> = {};

            // Validar y agregar campos solo si están presentes
            if (usuario !== undefined) {
                if (typeof usuario !== 'number' || usuario <= 0) {
                    res.status(400).json({ error: "El ID del usuario debe ser un número positivo" });
                    return;
                }
                updateData.usuario = usuario;
            }

            if (id_eps !== undefined) {
                if (typeof id_eps !== 'number' || id_eps <= 0) {
                    res.status(400).json({ error: "El ID de la EPS debe ser un número positivo" });
                    return;
                }
                updateData.id_eps = id_eps;
            }

            if (puntos !== undefined) {
                if (typeof puntos !== 'number') {
                    res.status(400).json({ error: "Los puntos deben ser un número" });
                    return;
                }
                updateData.puntos = puntos;
            }

            const success = await this.pacientesApplicationService.updatePaciente(id, updateData);
            
            if (!success) {
                res.status(404).json({ error: "Paciente no encontrado" });
                return;
            }

            res.status(200).json({ message: "Paciente actualizado exitosamente" });
        } catch (error) {
            console.error("Error al actualizar paciente:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async deletePaciente(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID del paciente debe ser un número positivo" });
                return;
            }

            const success = await this.pacientesApplicationService.deletePaciente(id);
            
            if (!success) {
                res.status(404).json({ error: "Paciente no encontrado" });
                return;
            }

            res.status(200).json({ message: "Paciente eliminado exitosamente" });
        } catch (error) {
            console.error("Error al eliminar paciente:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    // Métodos específicos para gestión de puntos

    async addPuntos(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { puntos } = req.body;
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID del paciente debe ser un número positivo" });
                return;
            }

            if (!puntos || typeof puntos !== 'number' || puntos <= 0) {
                res.status(400).json({ error: "Los puntos a agregar deben ser un número positivo" });
                return;
            }

            const success = await this.pacientesApplicationService.addPuntos(id, puntos);
            
            if (!success) {
                res.status(404).json({ error: "Paciente no encontrado" });
                return;
            }

            res.status(200).json({ message: `${puntos} puntos agregados exitosamente` });
        } catch (error) {
            console.error("Error al agregar puntos:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async subtractPuntos(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { puntos } = req.body;
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID del paciente debe ser un número positivo" });
                return;
            }

            if (!puntos || typeof puntos !== 'number' || puntos <= 0) {
                res.status(400).json({ error: "Los puntos a sustraer deben ser un número positivo" });
                return;
            }

            const success = await this.pacientesApplicationService.subtractPuntos(id, puntos);
            
            if (!success) {
                res.status(404).json({ error: "Paciente no encontrado" });
                return;
            }

            res.status(200).json({ message: `${puntos} puntos sustraídos exitosamente` });
        } catch (error) {
            console.error("Error al sustraer puntos:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getPacientesConPuntosAltos(req: Request, res: Response): Promise<void> {
        try {
            const limiteMinimo = req.query.limite ? parseInt(req.query.limite as string) : 1000;
            
            if (isNaN(limiteMinimo) || limiteMinimo < 0) {
                res.status(400).json({ error: "El límite mínimo debe ser un número no negativo" });
                return;
            }

            const pacientes = await this.pacientesApplicationService.getPacientesConPuntosAltos(limiteMinimo);
            res.status(200).json(pacientes);
        } catch (error) {
            console.error("Error al obtener pacientes con puntos altos:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getPacientesConPuntosBajos(req: Request, res: Response): Promise<void> {
        try {
            const limiteMaximo = req.query.limite ? parseInt(req.query.limite as string) : 100;
            
            if (isNaN(limiteMaximo) || limiteMaximo < 0) {
                res.status(400).json({ error: "El límite máximo debe ser un número no negativo" });
                return;
            }

            const pacientes = await this.pacientesApplicationService.getPacientesConPuntosBajos(limiteMaximo);
            res.status(200).json(pacientes);
        } catch (error) {
            console.error("Error al obtener pacientes con puntos bajos:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async actualizarRacha(req: Request, res: Response): Promise<void> {
        try {
            const pacienteId = parseInt(req.params.id);

            if (isNaN(pacienteId) || pacienteId <= 0) {
                res.status(400).json({ error: "El ID del paciente debe ser un número positivo" });
                return;
            }

            const resultado = await this.pacientesApplicationService.actualizarRacha(pacienteId);
            res.status(200).json(resultado);

        } catch (error) {
            console.error("Error al actualizar la racha:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }
}
