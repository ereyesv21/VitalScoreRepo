import { Router } from 'express';
import { EpsAdapter } from '../adapter/EpsAdapter';
import { EpsApplicationService } from '../../application/EpsApplicationService';
import { EpsController } from '../controller/EpsController';
import { authenticateToken } from '../web/authMiddleware';

const router = Router();

// Inicialización de las capas
const epsAdapter = new EpsAdapter();
const epsAppService = new EpsApplicationService(epsAdapter);
const epsController = new EpsController(epsAppService);

// Ruta pública para obtener todas las EPS (necesaria para registro)
router.get('/public/eps', async (req, res) => {
    try {
        await epsController.getAllEps(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las EPS', error });
    }
});

// Definir las rutas con manejo de errores y autenticación

router.post('/eps', authenticateToken, async (req, res) => {
    try {
        await epsController.createEps(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error en la creación de la EPS', error });
    }
});

router.get('/eps', authenticateToken, async (req, res) => {
    try {
        await epsController.getAllEps(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las EPS', error });
    }
});

router.get('/eps/:id', authenticateToken, async (req, res) => {
    try {
        await epsController.getEpsById(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la EPS por ID', error });
    }
});

router.get('/eps/nombre/:nombre', authenticateToken, async (req, res) => {
    try {
        await epsController.getEpsByNombre(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la EPS por nombre', error });
    }
});

router.put('/eps/:id', authenticateToken, async (req, res) => {
    try {
        await epsController.updateEps(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la EPS', error });
    }
});

router.delete('/eps/:id', authenticateToken, async (req, res) => {
    try {
        await epsController.deleteEps(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la EPS', error });
    }
});

export default router; 