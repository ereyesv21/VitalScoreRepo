import { Router } from 'express';
import { HorariosMedicosDetalladosAdapter } from '../adapter/HorariosMedicosDetalladosAdapter';
import { HorariosMedicosDetalladosApplicationService } from '../../application/HorariosMedicosDetalladosApplicationService';
import { HorariosMedicosDetalladosController } from '../controller/HorariosMedicosDetalladosController';
import { authenticateToken } from '../web/authMiddleware';

const router = Router();

// Inicialización de las capas
const horariosMedicosDetalladosAdapter = new HorariosMedicosDetalladosAdapter();
const horariosMedicosDetalladosAppService = new HorariosMedicosDetalladosApplicationService(horariosMedicosDetalladosAdapter);
const horariosMedicosDetalladosController = new HorariosMedicosDetalladosController(horariosMedicosDetalladosAppService);

// Definir las rutas con manejo de errores y autenticación

// POST /api/horario-medico-detallado - Crear nuevo horario médico detallado
router.post('/horario-medico-detallado', authenticateToken, async (req, res) => {
    await horariosMedicosDetalladosController.create(req, res);
});

// GET /api/horarios-medicos-detallados - Obtener todos los horarios detallados
router.get('/horarios-medicos-detallados', authenticateToken, async (req, res) => {
    await horariosMedicosDetalladosController.getAll(req, res);
});

// GET /api/horario-medico-detallado/:id - Obtener horario detallado por ID
router.get('/horario-medico-detallado/:id', authenticateToken, async (req, res) => {
    await horariosMedicosDetalladosController.getById(req, res);
});

// GET /api/horarios-medicos-detallados/medico/:medicoId - Obtener horarios por médico
router.get('/horarios-medicos-detallados/medico/:medicoId', authenticateToken, async (req, res) => {
    await horariosMedicosDetalladosController.getByMedico(req, res);
});

// GET /api/horarios-medicos-detallados/fecha/:fecha - Obtener horarios por fecha
router.get('/horarios-medicos-detallados/fecha/:fecha', authenticateToken, async (req, res) => {
    await horariosMedicosDetalladosController.getByFecha(req, res);
});

// GET /api/horarios-medicos-detallados/medico/:medicoId/fecha/:fecha - Obtener horarios por médico y fecha
router.get('/horarios-medicos-detallados/medico/:medicoId/fecha/:fecha', authenticateToken, async (req, res) => {
    await horariosMedicosDetalladosController.getByMedicoAndFecha(req, res);
});

// GET /api/horarios-medicos-detallados/tipo/:tipo - Obtener horarios por tipo
router.get('/horarios-medicos-detallados/tipo/:tipo', authenticateToken, async (req, res) => {
    await horariosMedicosDetalladosController.getByTipo(req, res);
});

// GET /api/horarios-medicos-detallados/estado/:estado - Obtener horarios por estado
router.get('/horarios-medicos-detallados/estado/:estado', authenticateToken, async (req, res) => {
    await horariosMedicosDetalladosController.getByEstado(req, res);
});

// PUT /api/horario-medico-detallado/:id - Actualizar horario detallado
router.put('/horario-medico-detallado/:id', authenticateToken, async (req, res) => {
    await horariosMedicosDetalladosController.update(req, res);
});

// DELETE /api/horario-medico-detallado/:id - Eliminar horario detallado
router.delete('/horario-medico-detallado/:id', authenticateToken, async (req, res) => {
    await horariosMedicosDetalladosController.delete(req, res);
});

export default router; 