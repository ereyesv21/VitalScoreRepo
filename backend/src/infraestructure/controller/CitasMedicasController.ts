import { Request, Response } from "express";
import { CitasMedicasApplicationService } from "../../application/CitasMedicasApplicationService";
import { CitasMedicas } from "../../domain/CitasMedicas";

export class CitasMedicasController {
    private readonly citasMedicasApplicationService: CitasMedicasApplicationService;

    constructor(citasMedicasApplicationService: CitasMedicasApplicationService) {
        this.citasMedicasApplicationService = citasMedicasApplicationService;
    }

    async createCitaMedica(req: Request, res: Response): Promise<void> {
        console.log('[CitasMedicasController] Iniciando creación de cita médica');
        console.log('[CitasMedicasController] Body recibido:', JSON.stringify(req.body, null, 2));
        
        try {
            const { paciente, medico, fecha_cita, hora_inicio, hora_fin, estado, motivo_consulta, observaciones } = req.body;

            console.log('[CitasMedicasController] Datos extraídos:', {
                paciente, medico, fecha_cita, hora_inicio, hora_fin, estado, motivo_consulta, observaciones
            });

            // Validaciones de entrada
            if (!paciente || typeof paciente !== 'number') {
                console.log('[CitasMedicasController] Error: paciente inválido');
                res.status(400).json({ error: "El campo 'paciente' es requerido y debe ser un número" });
                return;
            }

            if (!medico || typeof medico !== 'number') {
                console.log('[CitasMedicasController] Error: medico inválido');
                res.status(400).json({ error: "El campo 'medico' es requerido y debe ser un número" });
                return;
            }

            if (!fecha_cita) {
                console.log('[CitasMedicasController] Error: fecha_cita faltante');
                res.status(400).json({ error: "El campo 'fecha_cita' es requerido" });
                return;
            }

            if (!hora_inicio || typeof hora_inicio !== 'string') {
                console.log('[CitasMedicasController] Error: hora_inicio inválida');
                res.status(400).json({ error: "El campo 'hora_inicio' es requerido y debe ser una cadena" });
                return;
            }

            if (!hora_fin || typeof hora_fin !== 'string') {
                console.log('[CitasMedicasController] Error: hora_fin inválida');
                res.status(400).json({ error: "El campo 'hora_fin' es requerido y debe ser una cadena" });
                return;
            }

            if (paciente <= 0) {
                console.log('[CitasMedicasController] Error: paciente <= 0');
                res.status(400).json({ error: "El ID del paciente debe ser un número positivo" });
                return;
            }

            if (medico <= 0) {
                console.log('[CitasMedicasController] Error: medico <= 0');
                res.status(400).json({ error: "El ID del médico debe ser un número positivo" });
                return;
            }

            console.log('[CitasMedicasController] Todas las validaciones pasaron, creando objeto citaData');

            const citaData: Omit<CitasMedicas, "id_cita" | "fecha_creacion" | "fecha_modificacion"> = {
                paciente,
                medico,
                fecha_cita: fecha_cita,
                hora_inicio,
                hora_fin,
                estado: estado || 'programada',
                motivo_consulta,
                observaciones
            };

            console.log('[CitasMedicasController] citaData creado:', JSON.stringify(citaData, null, 2));
            console.log('[CitasMedicasController] Llamando a applicationService.createCitaMedica');

            const idCita = await this.citasMedicasApplicationService.createCitaMedica(citaData);
            
            console.log('[CitasMedicasController] Cita creada exitosamente con ID:', idCita);
            
            res.status(201).json({ 
                message: "Cita médica creada exitosamente", 
                id_cita: idCita 
            });
        } catch (error) {
            console.error("[CitasMedicasController] Error al crear cita médica:", error);
            console.error("[CitasMedicasController] Stack trace:", error instanceof Error ? error.stack : 'No stack trace available');
            
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getAllCitasMedicas(req: Request, res: Response): Promise<void> {
        try {
            const citas = await this.citasMedicasApplicationService.getAllCitasMedicas();
            res.status(200).json(citas);
        } catch (error) {
            console.error("Error al obtener citas médicas:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getCitaMedicaById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID de la cita debe ser un número positivo" });
                return;
            }

            const cita = await this.citasMedicasApplicationService.getCitaMedicaById(id);
            
            if (!cita) {
                res.status(404).json({ error: "Cita médica no encontrada" });
                return;
            }

            res.status(200).json(cita);
        } catch (error) {
            console.error("Error al obtener cita médica por ID:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getCitasMedicasByPaciente(req: Request, res: Response): Promise<void> {
        try {
            const paciente = parseInt(req.params.paciente);
            
            if (isNaN(paciente) || paciente <= 0) {
                res.status(400).json({ error: "El ID del paciente debe ser un número positivo" });
                return;
            }

            const citas = await this.citasMedicasApplicationService.getCitasMedicasByPaciente(paciente);
            res.status(200).json(citas);
        } catch (error) {
            console.error("Error al obtener citas médicas por paciente:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    // Nuevo método: Obtener citas del paciente actual (logueado)
    async getCitasMedicasByPacienteCurrent(req: Request, res: Response): Promise<void> {
        console.log('[CitasMedicasController] Entrando a getCitasMedicasByPacienteCurrent');
        try {
            // Obtener el ID del usuario desde el token JWT
            const userId = (req as any).user?.id;
            console.log('[CitasMedicasController] userId extraído del token:', userId);
            if (!userId) {
                res.status(401).json({ error: "Usuario no autenticado" });
                return;
            }

            // Buscar el paciente por el ID del usuario
            const paciente = await this.citasMedicasApplicationService.getPacienteByUsuario(userId);
            console.log('[CitasMedicasController] Paciente encontrado para userId', userId, ':', paciente);
            if (!paciente) {
                res.status(404).json({ error: "Paciente no encontrado para este usuario" });
                return;
            }

            const citas = await this.citasMedicasApplicationService.getCitasMedicasByPaciente(paciente.id_paciente);
            console.log('[CitasMedicasController] Citas encontradas para paciente', paciente.id_paciente, ':', citas.length);
            res.status(200).json(citas);
        } catch (error) {
            console.error("Error al obtener citas médicas del paciente actual:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getCitasMedicasByMedico(req: Request, res: Response): Promise<void> {
        try {
            const medico = parseInt(req.params.medico);
            
            if (isNaN(medico) || medico <= 0) {
                res.status(400).json({ error: "El ID del médico debe ser un número positivo" });
                return;
            }

            const citas = await this.citasMedicasApplicationService.getCitasMedicasByMedico(medico);
            res.status(200).json(citas);
        } catch (error) {
            console.error("Error al obtener citas médicas por médico:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getCitasMedicasByEstado(req: Request, res: Response): Promise<void> {
        try {
            const estado = req.params.estado as CitasMedicas['estado'];
            
            if (!estado) {
                res.status(400).json({ error: "El estado es requerido" });
                return;
            }

            const citas = await this.citasMedicasApplicationService.getCitasMedicasByEstado(estado);
            res.status(200).json(citas);
        } catch (error) {
            console.error("Error al obtener citas médicas por estado:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getCitasMedicasByFecha(req: Request, res: Response): Promise<void> {
        try {
            const fecha = req.params.fecha;
            
            if (!fecha) {
                res.status(400).json({ error: "La fecha es requerida" });
                return;
            }

            const citas = await this.citasMedicasApplicationService.getCitasMedicasByFecha(new Date(fecha));
            res.status(200).json(citas);
        } catch (error) {
            console.error("Error al obtener citas médicas por fecha:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getCitasMedicasByMedicoAndFecha(req: Request, res: Response): Promise<void> {
        try {
            const medico = parseInt(req.params.medico);
            const fecha = req.params.fecha;
            
            if (isNaN(medico) || medico <= 0) {
                res.status(400).json({ error: "El ID del médico debe ser un número positivo" });
                return;
            }

            if (!fecha) {
                res.status(400).json({ error: "La fecha es requerida" });
                return;
            }

            const citas = await this.citasMedicasApplicationService.getCitasMedicasByMedicoAndFecha(medico, new Date(fecha));
            res.status(200).json(citas);
        } catch (error) {
            console.error("Error al obtener citas médicas por médico y fecha:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getCitasMedicasByPacienteAndFecha(req: Request, res: Response): Promise<void> {
        try {
            const paciente = parseInt(req.params.paciente);
            const fecha = req.params.fecha;
            
            if (isNaN(paciente) || paciente <= 0) {
                res.status(400).json({ error: "El ID del paciente debe ser un número positivo" });
                return;
            }

            if (!fecha) {
                res.status(400).json({ error: "La fecha es requerida" });
                return;
            }

            const citas = await this.citasMedicasApplicationService.getCitasMedicasByPacienteAndFecha(paciente, new Date(fecha));
            res.status(200).json(citas);
        } catch (error) {
            console.error("Error al obtener citas médicas por paciente y fecha:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async updateCitaMedica(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID de la cita debe ser un número positivo" });
                return;
            }

            const { paciente, medico, fecha_cita, hora_inicio, hora_fin, estado, motivo_consulta, observaciones } = req.body;
            const updateData: Partial<CitasMedicas> = {};

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

            if (fecha_cita !== undefined) {
                updateData.fecha_cita = new Date(fecha_cita);
            }

            if (hora_inicio !== undefined) {
                if (typeof hora_inicio !== 'string') {
                    res.status(400).json({ error: "La hora de inicio debe ser una cadena" });
                    return;
                }
                updateData.hora_inicio = hora_inicio;
            }

            if (hora_fin !== undefined) {
                if (typeof hora_fin !== 'string') {
                    res.status(400).json({ error: "La hora de fin debe ser una cadena" });
                    return;
                }
                updateData.hora_fin = hora_fin;
            }

            if (estado !== undefined) {
                updateData.estado = estado;
            }

            if (motivo_consulta !== undefined) {
                updateData.motivo_consulta = motivo_consulta;
            }

            if (observaciones !== undefined) {
                updateData.observaciones = observaciones;
            }

            const success = await this.citasMedicasApplicationService.updateCitaMedica(id, updateData);
            
            if (success) {
                res.status(200).json({ message: "Cita médica actualizada exitosamente" });
            } else {
                res.status(404).json({ error: "Cita médica no encontrada" });
            }
        } catch (error) {
            console.error("Error al actualizar cita médica:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async deleteCitaMedica(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID de la cita debe ser un número positivo" });
                return;
            }

            const success = await this.citasMedicasApplicationService.deleteCitaMedica(id);
            
            if (success) {
                res.status(200).json({ message: "Cita médica eliminada exitosamente" });
            } else {
                res.status(404).json({ error: "Cita médica no encontrada" });
            }
        } catch (error) {
            console.error("Error al eliminar cita médica:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async cancelarCita(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { cancelado_por, motivo_cancelacion } = req.body;
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID de la cita debe ser un número positivo" });
                return;
            }

            if (!cancelado_por || typeof cancelado_por !== 'string') {
                res.status(400).json({ error: "El campo 'cancelado_por' es requerido y debe ser una cadena" });
                return;
            }

            if (!motivo_cancelacion || typeof motivo_cancelacion !== 'string') {
                res.status(400).json({ error: "El campo 'motivo_cancelacion' es requerido y debe ser una cadena" });
                return;
            }

            const success = await this.citasMedicasApplicationService.cancelarCita(id, cancelado_por, motivo_cancelacion);
            
            if (success) {
                res.status(200).json({ message: "Cita médica cancelada exitosamente" });
            } else {
                res.status(404).json({ error: "Cita médica no encontrada" });
            }
        } catch (error) {
            console.error("Error al cancelar cita médica:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async confirmarCita(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID de la cita debe ser un número positivo" });
                return;
            }

            const success = await this.citasMedicasApplicationService.confirmarCita(id);
            
            if (success) {
                res.status(200).json({ message: "Cita médica confirmada exitosamente" });
            } else {
                res.status(404).json({ error: "Cita médica no encontrada" });
            }
        } catch (error) {
            console.error("Error al confirmar cita médica:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async iniciarCita(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID de la cita debe ser un número positivo" });
                return;
            }

            const success = await this.citasMedicasApplicationService.iniciarCita(id);
            
            if (success) {
                res.status(200).json({ message: "Cita médica iniciada exitosamente" });
            } else {
                res.status(404).json({ error: "Cita médica no encontrada" });
            }
        } catch (error) {
            console.error("Error al iniciar cita médica:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async completarCita(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { observaciones } = req.body;
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID de la cita debe ser un número positivo" });
                return;
            }

            const success = await this.citasMedicasApplicationService.completarCita(id, observaciones);
            
            if (success) {
                res.status(200).json({ message: "Cita médica completada exitosamente" });
            } else {
                res.status(404).json({ error: "Cita médica no encontrada" });
            }
        } catch (error) {
            console.error("Error al completar cita médica:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async marcarNoAsistio(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: "El ID de la cita debe ser un número positivo" });
                return;
            }

            const success = await this.citasMedicasApplicationService.marcarNoAsistio(id);
            
            if (success) {
                res.status(200).json({ message: "Cita médica marcada como no asistió exitosamente" });
            } else {
                res.status(404).json({ error: "Cita médica no encontrada" });
            }
        } catch (error) {
            console.error("Error al marcar cita médica como no asistió:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getCitasMedicasProximas(req: Request, res: Response): Promise<void> {
        try {
            const dias = parseInt(req.params.dias) || 7;
            
            if (dias <= 0) {
                res.status(400).json({ error: "El número de días debe ser positivo" });
                return;
            }

            const citas = await this.citasMedicasApplicationService.getCitasMedicasProximas(dias);
            res.status(200).json(citas);
        } catch (error) {
            console.error("Error al obtener citas médicas próximas:", error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error interno del servidor" });
            }
        }
    }

    async getCitasMedicasVencidas(req: Request, res: Response): Promise<void> {
        try {
            const citas = await this.citasMedicasApplicationService.getCitasMedicasVencidas();
            res.status(200).json(citas);
        } catch (error) {
            console.error("Error al obtener citas médicas vencidas:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }
} 