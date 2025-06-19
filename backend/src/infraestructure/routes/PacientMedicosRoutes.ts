import { Router } from 'express';
import { PacientMedicosAdapter } from '../adapter/PacientMedicosAdapter';
import { PacientMedicosApplicationService } from '../../application/PacientMedicosApplicationService';
import { PacientMedicosController } from '../controller/PacientMedicosController';
import { authenticateToken } from '../web/authMiddleware';
import { PacientesAdapter } from '../adapter/PacientesAdapter';
import { MedicoAdapter } from '../adapter/MedicoAdapter';

const router = Router();

// Inicialización de las capas
const pacientMedicosAdapter = new PacientMedicosAdapter();
const pacientesAdapter = new PacientesAdapter();
const medicoAdapter = new MedicoAdapter();
const pacientMedicosAppService = new PacientMedicosApplicationService(
    pacientMedicosAdapter, 
    pacientesAdapter, 
    medicoAdapter
);
const pacientMedicosController = new PacientMedicosController(pacientMedicosAppService);

// Definir las rutas con manejo de errores y autenticación

router.post('/relacion', authenticateToken, async (req, res) => {
    try {
        await pacientMedicosController.createRelacion(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error en la creación de la relación paciente-médico', error });
    }
});

router.get('/relaciones', authenticateToken, async (req, res) => {
    try {
        await pacientMedicosController.getAllRelaciones(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las relaciones', error });
    }
});

router.get('/relacion/:id', authenticateToken, async (req, res) => {
    try {
        await pacientMedicosController.getRelacionById(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la relación por ID', error });
    }
});

router.get('/relacion/paciente/:paciente', authenticateToken, async (req, res) => {
    try {
        await pacientMedicosController.getRelacionesByPaciente(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener relaciones por paciente', error });
    }
});

router.get('/relacion/medico/:medico', authenticateToken, async (req, res) => {
    try {
        await pacientMedicosController.getRelacionesByMedico(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener relaciones por médico', error });
    }
});

router.get('/relaciones/por-fecha', authenticateToken, async (req, res) => {
    try {
        await pacientMedicosController.getRelacionesPorFecha(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener relaciones por fecha', error });
    }
});

router.put('/relacion/:id', authenticateToken, async (req, res) => {
    try {
        await pacientMedicosController.updateRelacion(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la relación', error });
    }
});

router.delete('/relacion/:id', authenticateToken, async (req, res) => {
    try {
        await pacientMedicosController.deleteRelacion(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la relación', error });
    }
});

export default router;
