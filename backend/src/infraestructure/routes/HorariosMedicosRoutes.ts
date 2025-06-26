import { Router } from 'express';
import { HorariosMedicosAdapter } from '../adapter/HorariosMedicosAdapter';
import { HorariosMedicosApplicationService } from '../../application/HorariosMedicosApplicationService';
import { HorariosMedicosController } from '../controller/HorariosMedicosController';
import { authenticateToken } from '../web/authMiddleware';
import { CitasMedicasAdapter } from '../adapter/CitasMedicasAdapter';

const router = Router();

// Inicialización de las capas
const horariosMedicosAdapter = new HorariosMedicosAdapter();
const citasMedicasAdapter = new CitasMedicasAdapter();
const horariosMedicosAppService = new HorariosMedicosApplicationService(horariosMedicosAdapter, citasMedicasAdapter);
const horariosMedicosController = new HorariosMedicosController(horariosMedicosAppService);

// Definir las rutas con manejo de errores y autenticación

// POST /api/horario-medico - Crear nuevo horario médico
router.post('/horario-medico', authenticateToken, async (req, res) => {
    await horariosMedicosController.createHorarioMedico(req, res);
});

// GET /api/horarios-medicos - Obtener todos los horarios
router.get('/horarios-medicos', authenticateToken, async (req, res) => {
    await horariosMedicosController.getAllHorariosMedicos(req, res);
});

// GET /api/horario-medico/:id - Obtener horario por ID
router.get('/horario-medico/:id', authenticateToken, async (req, res) => {
    await horariosMedicosController.getHorarioMedicoById(req, res);
});

// GET /api/horarios-medicos/medico/:medicoId - Obtener horarios por médico
router.get('/horarios-medicos/medico/:medicoId', authenticateToken, async (req, res) => {
    await horariosMedicosController.getHorariosByMedico(req, res);
});

// GET /api/horarios-medicos/dia/:diaSemana - Obtener horarios por día de la semana
router.get('/horarios-medicos/dia/:diaSemana', authenticateToken, async (req, res) => {
    await horariosMedicosController.getHorariosByDiaSemana(req, res);
});

// GET /api/horarios-medicos/medico/:medicoId/dia/:diaSemana - Obtener horarios por médico y día
router.get('/horarios-medicos/medico/:medicoId/dia/:diaSemana', authenticateToken, async (req, res) => {
    await horariosMedicosController.getHorariosByMedicoAndDia(req, res);
});

// PUT /api/horario-medico/:id - Actualizar horario
router.put('/horario-medico/:id', authenticateToken, async (req, res) => {
    await horariosMedicosController.updateHorarioMedico(req, res);
});

// DELETE /api/horario-medico/:id - Eliminar horario
router.delete('/horario-medico/:id', authenticateToken, async (req, res) => {
    await horariosMedicosController.deleteHorarioMedico(req, res);
});

// NUEVO ENDPOINT: Obtener horarios disponibles de un médico para una fecha
router.get('/horarios-medicos/:medicoId/disponibilidad', authenticateToken, async (req, res) => {
    await horariosMedicosController.getDisponibilidadByMedicoYFecha(req, res);
});

export default router; 