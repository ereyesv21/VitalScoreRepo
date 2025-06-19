import { Router } from 'express';
import { HistorialPuntosAdapter } from '../adapter/HistorialPuntosAdapter';
import { PacientesAdapter } from '../adapter/PacientesAdapter';
import { HistorialPuntosApplicationService } from '../../application/HistorialPuntosApplicationService';
import { HistorialPuntosController } from '../controller/HistorialPuntosController';
import { authenticateToken } from '../web/authMiddleware';

const router = Router();

// Inicialización de las capas
const historialPuntosAdapter = new HistorialPuntosAdapter();
const pacientesAdapter = new PacientesAdapter();
const historialPuntosAppService = new HistorialPuntosApplicationService(historialPuntosAdapter, pacientesAdapter);
const historialPuntosController = new HistorialPuntosController(historialPuntosAppService);

// Definir las rutas con manejo de errores y autenticación

router.post('/historial', authenticateToken, async (req, res) => {
    try {
        await historialPuntosController.createHistorial(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error en la creación del historial de puntos', error });
    }
});

router.get('/historiales', authenticateToken, async (req, res) => {
    try {
        await historialPuntosController.getAllHistoriales(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los historiales de puntos', error });
    }
});

router.get('/historial/:id', authenticateToken, async (req, res) => {
    try {
        await historialPuntosController.getHistorialById(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el historial de puntos por ID', error });
    }
});

router.put('/historial/:id', authenticateToken, async (req, res) => {
    try {
        await historialPuntosController.updateHistorial(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el historial de puntos', error });
    }
});

router.delete('/historial/:id', authenticateToken, async (req, res) => {
    try {
        await historialPuntosController.deleteHistorial(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el historial de puntos', error });
    }
});

router.get('/historial/paciente/:paciente', authenticateToken, async (req, res) => {
    try {
        await historialPuntosController.getHistorialesByPaciente(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener historiales por paciente', error });
    }
});

router.get('/historial/por-fecha', authenticateToken, async (req, res) => {
    try {
        await historialPuntosController.getHistorialesByFecha(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener historiales por fecha', error });
    }
});

router.get('/historial/puntos/:puntos', authenticateToken, async (req, res) => {
    try {
        await historialPuntosController.getHistorialesByPuntos(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener historiales por puntos', error });
    }
});

router.get('/historial/rango-puntos', authenticateToken, async (req, res) => {
    try {
        await historialPuntosController.getHistorialesPorRangoPuntos(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener historiales por rango de puntos', error });
    }
});

export default router;
