import { Router } from 'express';
import { NotificacionesAdapter } from '../adapter/NotificacionesAdapter';
import { NotificacionesApplicationService } from '../../application/NotificacionesApplicationService';
import { NotificacionesController } from '../controller/NotificacionesController';
import { PacientesAdapter } from '../adapter/PacientesAdapter';
import { authenticateToken } from '../web/authMiddleware';

const router = Router();

// Inicialización de las capas
const notificacionesAdapter = new NotificacionesAdapter();
const pacientesAdapter = new PacientesAdapter();
const notificacionesAppService = new NotificacionesApplicationService(
    notificacionesAdapter,
    pacientesAdapter
);
const notificacionesController = new NotificacionesController(notificacionesAppService);

// Rutas CRUD básicas
router.post('/notificacion', authenticateToken, async (req, res) => {
    await notificacionesController.createNotificacion(req, res);
});

router.get('/notificaciones', authenticateToken, async (req, res) => {
    await notificacionesController.getAllNotificaciones(req, res);
});

router.get('/notificacion/:id', authenticateToken, async (req, res) => {
    await notificacionesController.getNotificacionById(req, res);
});

router.put('/notificacion/:id', authenticateToken, async (req, res) => {
    await notificacionesController.updateNotificacion(req, res);
});

router.delete('/notificacion/:id', authenticateToken, async (req, res) => {
    await notificacionesController.deleteNotificacion(req, res);
});

// Rutas de consulta por filtros
router.get('/notificaciones/paciente/:paciente', authenticateToken, async (req, res) => {
    await notificacionesController.getNotificacionesByPaciente(req, res);
});

// Rutas de consulta por fecha
router.post('/notificaciones/por-fecha', authenticateToken, async (req, res) => {
    await notificacionesController.getNotificacionesPorFecha(req, res);
});

export default router; 