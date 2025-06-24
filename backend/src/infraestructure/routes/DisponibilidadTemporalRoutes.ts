import { Router } from 'express';
import { DisponibilidadTemporalAdapter } from '../adapter/DisponibilidadTemporalAdapter';
import { DisponibilidadTemporalApplicationService } from '../../application/DisponibilidadTemporalApplicationService';
import { DisponibilidadTemporalController } from '../controller/DisponibilidadTemporalController';
import { authenticateToken } from '../web/authMiddleware';

const router = Router();

// Inicialización de las capas
const disponibilidadTemporalAdapter = new DisponibilidadTemporalAdapter();
const disponibilidadTemporalAppService = new DisponibilidadTemporalApplicationService(disponibilidadTemporalAdapter);
const disponibilidadTemporalController = new DisponibilidadTemporalController(disponibilidadTemporalAppService);

// Definir las rutas con manejo de errores y autenticación

// POST /api/disponibilidad-temporal - Crear nueva disponibilidad temporal
router.post('/disponibilidad-temporal', authenticateToken, async (req, res) => {
    await disponibilidadTemporalController.createDisponibilidadTemporal(req, res);
});

// GET /api/disponibilidad-temporal - Obtener todas las disponibilidades temporales
router.get('/disponibilidad-temporal', authenticateToken, async (req, res) => {
    await disponibilidadTemporalController.getAllDisponibilidadesTemporales(req, res);
});

// GET /api/disponibilidad-temporal/:id - Obtener disponibilidad temporal por ID
router.get('/disponibilidad-temporal/:id', authenticateToken, async (req, res) => {
    await disponibilidadTemporalController.getDisponibilidadTemporalById(req, res);
});

// GET /api/disponibilidad-temporal/medico/:medicoId - Obtener disponibilidades por médico
router.get('/disponibilidad-temporal/medico/:medicoId', authenticateToken, async (req, res) => {
    await disponibilidadTemporalController.getDisponibilidadesByMedico(req, res);
});

// GET /api/disponibilidad-temporal/fechas - Obtener disponibilidades por rango de fechas
router.get('/disponibilidad-temporal/fechas', authenticateToken, async (req, res) => {
    await disponibilidadTemporalController.getDisponibilidadesByFechas(req, res);
});

// PUT /api/disponibilidad-temporal/:id - Actualizar disponibilidad temporal
router.put('/disponibilidad-temporal/:id', authenticateToken, async (req, res) => {
    await disponibilidadTemporalController.updateDisponibilidadTemporal(req, res);
});

// DELETE /api/disponibilidad-temporal/:id - Eliminar disponibilidad temporal
router.delete('/disponibilidad-temporal/:id', authenticateToken, async (req, res) => {
    await disponibilidadTemporalController.deleteDisponibilidadTemporal(req, res);
});

export default router; 