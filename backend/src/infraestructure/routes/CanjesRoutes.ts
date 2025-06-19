import { Router } from 'express';
import { CanjesAdapter } from '../adapter/CanjesAdapter';
import { CanjesApplicationService } from '../../application/CanjesApplicationService';
import { CanjesController } from '../controller/CanjesController';
import { authenticateToken } from '../web/authMiddleware';
import { PacientesAdapter } from '../adapter/PacientesAdapter';
import { RecompensasAdapter } from '../adapter/RecompensasAdapter';

const router = Router();

// Inicialización de las capas
const canjesAdapter = new CanjesAdapter();
const pacientesAdapter = new PacientesAdapter();
const recompensasAdapter = new RecompensasAdapter();
const canjesAppService = new CanjesApplicationService(
    canjesAdapter,
    pacientesAdapter,
    recompensasAdapter
);
const canjesController = new CanjesController(canjesAppService);

// Rutas CRUD y de consulta
router.post('/canje', authenticateToken, async (req, res) => {
    await canjesController.createCanje(req, res);
});

router.get('/canjes', authenticateToken, async (req, res) => {
    await canjesController.getAllCanjes(req, res);
});

router.get('/canje/:id', authenticateToken, async (req, res) => {
    await canjesController.getCanjeById(req, res);
});

router.put('/canje/:id', authenticateToken, async (req, res) => {
    await canjesController.updateCanje(req, res);
});

router.delete('/canje/:id', authenticateToken, async (req, res) => {
    await canjesController.deleteCanje(req, res);
});

// Filtros y búsquedas
router.get('/canjes/paciente/:paciente', authenticateToken, async (req, res) => {
    await canjesController.getCanjesByPaciente(req, res);
});

router.get('/canjes/estado/:estado', authenticateToken, async (req, res) => {
    await canjesController.getCanjesByEstado(req, res);
});

router.get('/canjes/por-fecha', authenticateToken, async (req, res) => {
    await canjesController.getCanjesPorFecha(req, res);
});

router.get('/canjes/por-puntos', authenticateToken, async (req, res) => {
    await canjesController.getCanjesPorPuntos(req, res);
});

export default router;
