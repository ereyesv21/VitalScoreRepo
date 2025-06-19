import { Router } from 'express';
import { RecompensasAdapter } from '../adapter/RecompensasAdapter';
import { RecompensasApplicationService } from '../../application/RecompensasApplicationService';
import { RecompensasController } from '../controller/RecompensasController';
import { authenticateToken } from '../web/authMiddleware';
import { EpsAdapter } from '../adapter/EpsAdapter';

const router = Router();

// Inicialización de las capas
const recompensasAdapter = new RecompensasAdapter();
const epsAdapter = new EpsAdapter();
const recompensasAppService = new RecompensasApplicationService(recompensasAdapter, epsAdapter);
const recompensasController = new RecompensasController(recompensasAppService);

// Definir las rutas con manejo de errores y autenticación

// Rutas CRUD básicas
router.post('/recompensa', authenticateToken, async (req, res) => {
    try {
        await recompensasController.createRecompensa(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error en la creación de la recompensa', error });
    }
});

router.get('/recompensas', authenticateToken, async (req, res) => {
    try {
        await recompensasController.getAllRecompensas(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las recompensas', error });
    }
});

router.get('/recompensa/:id', authenticateToken, async (req, res) => {
    try {
        await recompensasController.getRecompensaById(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la recompensa por ID', error });
    }
});

router.put('/recompensa/:id', authenticateToken, async (req, res) => {
    try {
        await recompensasController.updateRecompensa(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la recompensa', error });
    }
});

router.delete('/recompensa/:id', authenticateToken, async (req, res) => {
    try {
        await recompensasController.deleteRecompensa(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la recompensa', error });
    }
});

// Rutas de consulta específicas
router.get('/recompensa/proveedor/:proveedor', authenticateToken, async (req, res) => {
    try {
        await recompensasController.getRecompensasByProveedor(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener recompensas por proveedor', error });
    }
});

router.get('/recompensa/estado/:estado', authenticateToken, async (req, res) => {
    try {
        await recompensasController.getRecompensasByEstado(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener recompensas por estado', error });
    }
});

router.get('/recompensas/por-puntos', authenticateToken, async (req, res) => {
    try {
        await recompensasController.getRecompensasPorPuntos(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener recompensas por puntos', error });
    }
});

router.get('/recompensas/por-fecha', authenticateToken, async (req, res) => {
    try {
        await recompensasController.getRecompensasPorFecha(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener recompensas por fecha', error });
    }
});

// Rutas de gestión de estados
router.patch('/recompensa/:id/activar', authenticateToken, async (req, res) => {
    try {
        await recompensasController.activarRecompensa(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al activar la recompensa', error });
    }
});

router.patch('/recompensa/:id/desactivar', authenticateToken, async (req, res) => {
    try {
        await recompensasController.desactivarRecompensa(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al desactivar la recompensa', error });
    }
});

router.patch('/recompensa/:id/agotar', authenticateToken, async (req, res) => {
    try {
        await recompensasController.marcarComoAgotada(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al marcar la recompensa como agotada', error });
    }
});

// Rutas de consulta especializadas
router.get('/recompensas/disponibles', authenticateToken, async (req, res) => {
    try {
        await recompensasController.getRecompensasDisponibles(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener recompensas disponibles', error });
    }
});

router.get('/recompensas/rango-puntos', authenticateToken, async (req, res) => {
    try {
        await recompensasController.getRecompensasPorRangoDePuntos(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener recompensas por rango de puntos', error });
    }
});

export default router;
