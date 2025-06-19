import { Router } from 'express';
import { PlanesAdapter } from '../adapter/PlanesAdapter';
import { PlanesApplicationService } from '../../application/PlanesApplicationService';
import { PlanesController } from '../controller/PlanesController';
import { authenticateToken } from '../web/authMiddleware';
import { PacientesAdapter } from '../adapter/PacientesAdapter';
import { MedicoAdapter } from '../adapter/MedicoAdapter';

const router = Router();

// Inicialización de las capas
const planesAdapter = new PlanesAdapter();
const pacientesAdapter = new PacientesAdapter();
const medicoAdapter = new MedicoAdapter();
const planesAppService = new PlanesApplicationService(planesAdapter, pacientesAdapter, medicoAdapter);
const planesController = new PlanesController(planesAppService);

// Definir las rutas con manejo de errores y autenticación

router.post('/plan', authenticateToken, async (req, res) => {
    try {
        await planesController.createPlan(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error en la creación del plan', error });
    }
});

router.get('/planes', authenticateToken, async (req, res) => {
    try {
        await planesController.getAllPlanes(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los planes', error });
    }
});

router.get('/plan/:id', authenticateToken, async (req, res) => {
    try {
        await planesController.getPlanById(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el plan por ID', error });
    }
});

router.get('/plan/paciente/:paciente', authenticateToken, async (req, res) => {
    try {
        await planesController.getPlanesByPaciente(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener planes por paciente', error });
    }
});

router.get('/plan/medico/:medico', authenticateToken, async (req, res) => {
    try {
        await planesController.getPlanesByMedico(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener planes por médico', error });
    }
});

router.get('/plan/estado/:estado', authenticateToken, async (req, res) => {
    try {
        await planesController.getPlanesByEstado(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener planes por estado', error });
    }
});

router.get('/planes/activos', authenticateToken, async (req, res) => {
    try {
        await planesController.getPlanesActivos(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener planes activos', error });
    }
});

router.get('/planes/por-fecha', authenticateToken, async (req, res) => {
    try {
        await planesController.getPlanesPorFecha(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener planes por fecha', error });
    }
});

router.put('/plan/:id', authenticateToken, async (req, res) => {
    try {
        await planesController.updatePlan(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el plan', error });
    }
});

router.delete('/plan/:id', authenticateToken, async (req, res) => {
    try {
        await planesController.deletePlan(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el plan', error });
    }
});

// Rutas específicas para gestión de estados
router.post('/plan/:id/activar', authenticateToken, async (req, res) => {
    try {
        await planesController.activarPlan(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al activar el plan', error });
    }
});

router.post('/plan/:id/desactivar', authenticateToken, async (req, res) => {
    try {
        await planesController.desactivarPlan(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al desactivar el plan', error });
    }
});

router.post('/plan/:id/completar', authenticateToken, async (req, res) => {
    try {
        await planesController.completarPlan(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al completar el plan', error });
    }
});

router.post('/plan/:id/cancelar', authenticateToken, async (req, res) => {
    try {
        await planesController.cancelarPlan(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al cancelar el plan', error });
    }
});

// Rutas para filtros especiales
router.get('/planes/vencidos', authenticateToken, async (req, res) => {
    try {
        await planesController.getPlanesVencidos(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener planes vencidos', error });
    }
});

router.get('/planes/proximos-vencer', authenticateToken, async (req, res) => {
    try {
        await planesController.getPlanesProximosAVencer(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener planes próximos a vencer', error });
    }
});

router.get('/planes/rango-fechas', authenticateToken, async (req, res) => {
    try {
        await planesController.getPlanesPorRangoDeFechas(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener planes por rango de fechas', error });
    }
});

export default router;
