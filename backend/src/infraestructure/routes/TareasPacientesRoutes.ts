import { Router } from 'express';
import { TareasPacientesAdapter } from '../adapter/TareasPacientesAdapter';
import { TareasPacientesApplicationService } from '../../application/TareasPacientesApplicationService';
import { TareasPacientesController } from '../controller/TareasPacientesController';
import { authenticateToken } from '../web/authMiddleware';

const router = Router();

const adapter = new TareasPacientesAdapter();
const service = new TareasPacientesApplicationService(adapter);
const controller = new TareasPacientesController(service);

// Asignar tarea a paciente
router.post('/tareas-paciente', authenticateToken, (req, res) => controller.asignarTarea(req, res));

// Obtener tareas de un paciente
router.get('/tareas-paciente/:pacienteId', authenticateToken, (req, res) => controller.getTareasPorPaciente(req, res));

// Marcar tarea como completada
router.put('/tareas-paciente/:id/completar', authenticateToken, (req, res) => controller.marcarComoCompletada(req, res));

export default router; 