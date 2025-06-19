import { Router } from 'express';
import { TareasAdapter } from '../adapter/TareasAdapter';
import { TareasApplicationService } from '../../application/TareasApplicationService';
import { TareasController } from '../controller/TareasController';
import { authenticateToken } from '../web/authMiddleware';
import { PlanesAdapter } from '../adapter/PlanesAdapter';

const router = Router();

// Inicialización de las capas
const tareasAdapter = new TareasAdapter();
const planesAdapter = new PlanesAdapter();
const tareasAppService = new TareasApplicationService(tareasAdapter, planesAdapter);
const tareasController = new TareasController(tareasAppService);

// Definir las rutas con manejo de errores y autenticación

router.post('/tarea', authenticateToken, async (req, res) => {
    try {
        await tareasController.createTarea(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error en la creación de la tarea', error });
    }
});

router.get('/tareas', authenticateToken, async (req, res) => {
    try {
        await tareasController.getAllTareas(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las tareas', error });
    }
});

router.get('/tarea/:id', authenticateToken, async (req, res) => {
    try {
        await tareasController.getTareaById(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la tarea por ID', error });
    }
});

router.get('/tarea/plan/:plan', authenticateToken, async (req, res) => {
    try {
        await tareasController.getTareasByPlan(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener tareas por plan', error });
    }
});

router.get('/tarea/estado/:estado', authenticateToken, async (req, res) => {
    try {
        await tareasController.getTareasByEstado(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener tareas por estado', error });
    }
});

router.get('/tareas/por-fecha', authenticateToken, async (req, res) => {
    try {
        await tareasController.getTareasPorFecha(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener tareas por fecha', error });
    }
});

router.put('/tarea/:id', authenticateToken, async (req, res) => {
    try {
        await tareasController.updateTarea(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la tarea', error });
    }
});

router.delete('/tarea/:id', authenticateToken, async (req, res) => {
    try {
        await tareasController.deleteTarea(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la tarea', error });
    }
});

export default router;
