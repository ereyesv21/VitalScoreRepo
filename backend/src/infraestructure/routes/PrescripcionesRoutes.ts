import { Router } from 'express';
import { PrescripcionesAdapter } from '../adapter/PrescripcionesAdapter';
import { PrescripcionesApplicationService } from '../../application/PrescripcionesApplicationService';
import { PrescripcionesController } from '../controller/PrescripcionesController';
import { authenticateToken } from '../web/authMiddleware';

const router = Router();

// Inicialización de las capas
const prescripcionesAdapter = new PrescripcionesAdapter();
const prescripcionesAppService = new PrescripcionesApplicationService(prescripcionesAdapter);
const prescripcionesController = new PrescripcionesController(prescripcionesAppService);

// Definir las rutas con manejo de errores y autenticación

// POST /api/prescripcion - Crear nueva prescripción
router.post('/prescripcion', authenticateToken, async (req, res) => {
    await prescripcionesController.create(req, res);
});

// GET /api/prescripciones - Obtener todas las prescripciones
router.get('/prescripciones', authenticateToken, async (req, res) => {
    await prescripcionesController.getAll(req, res);
});

// GET /api/prescripcion/:id - Obtener prescripción por ID
router.get('/prescripcion/:id', authenticateToken, async (req, res) => {
    await prescripcionesController.getById(req, res);
});

// GET /api/prescripciones/paciente/:pacienteId - Obtener prescripciones por paciente
router.get('/prescripciones/paciente/:pacienteId', authenticateToken, async (req, res) => {
    await prescripcionesController.getByPaciente(req, res);
});

// GET /api/prescripciones/medico/:medicoId - Obtener prescripciones por médico
router.get('/prescripciones/medico/:medicoId', authenticateToken, async (req, res) => {
    await prescripcionesController.getByMedico(req, res);
});

// GET /api/prescripciones/cita/:citaId - Obtener prescripciones por cita
router.get('/prescripciones/cita/:citaId', authenticateToken, async (req, res) => {
    await prescripcionesController.getByCita(req, res);
});

// GET /api/prescripciones/medicamento/:medicamentoId - Obtener prescripciones por medicamento
router.get('/prescripciones/medicamento/:medicamentoId', authenticateToken, async (req, res) => {
    await prescripcionesController.getByMedicamento(req, res);
});

// GET /api/prescripciones/estado/:estado - Obtener prescripciones por estado
router.get('/prescripciones/estado/:estado', authenticateToken, async (req, res) => {
    await prescripcionesController.getByEstado(req, res);
});

// GET /api/prescripciones/fechas - Obtener prescripciones por rango de fechas
router.get('/prescripciones/fechas', authenticateToken, async (req, res) => {
    await prescripcionesController.getByFechas(req, res);
});

// PUT /api/prescripcion/:id - Actualizar prescripción
router.put('/prescripcion/:id', authenticateToken, async (req, res) => {
    await prescripcionesController.update(req, res);
});

// DELETE /api/prescripcion/:id - Eliminar prescripción
router.delete('/prescripcion/:id', authenticateToken, async (req, res) => {
    await prescripcionesController.delete(req, res);
});

export default router; 