import { Router } from 'express';
import { HistorialTareasAdapter } from '../adapter/HistorialTareasAdapter';
import { HistorialTareasApplicationService } from '../../application/HistorialTareasApplicationService';
import { HistorialTareasController } from '../controller/HistorialTareasController';
import { authenticateToken } from '../web/authMiddleware';

const router = Router();

// Inicialización de las capas
const historialTareasAdapter = new HistorialTareasAdapter();
const historialTareasAppService = new HistorialTareasApplicationService(historialTareasAdapter);
const historialTareasController = new HistorialTareasController(historialTareasAppService);

// Definir las rutas con manejo de errores y autenticación

// POST /api/historial-tarea - Crear nuevo historial de tarea
router.post('/historial-tarea', authenticateToken, async (req, res) => {
    await historialTareasController.createHistorialTarea(req, res);
});

// GET /api/historial-tareas - Obtener todos los historiales
router.get('/historial-tareas', authenticateToken, async (req, res) => {
    await historialTareasController.getAllHistorialTareas(req, res);
});

// GET /api/historial-tarea/:id - Obtener historial por ID
router.get('/historial-tarea/:id', authenticateToken, async (req, res) => {
    await historialTareasController.getHistorialTareaById(req, res);
});

// GET /api/historial-tareas/paciente/:pacienteId - Obtener historiales por paciente
router.get('/historial-tareas/paciente/:pacienteId', authenticateToken, async (req, res) => {
    await historialTareasController.getHistorialTareasByPaciente(req, res);
});

// GET /api/historial-tareas/tarea/:tareaId - Obtener historiales por tarea
router.get('/historial-tareas/tarea/:tareaId', authenticateToken, async (req, res) => {
    await historialTareasController.getHistorialTareasByTarea(req, res);
});

// GET /api/historial-tareas/fecha/:fecha - Obtener historiales por fecha
router.get('/historial-tareas/fecha/:fecha', authenticateToken, async (req, res) => {
    await historialTareasController.getHistorialTareasByFecha(req, res);
});

// PUT /api/historial-tarea/:id - Actualizar historial
router.put('/historial-tarea/:id', authenticateToken, async (req, res) => {
    await historialTareasController.updateHistorialTarea(req, res);
});

// DELETE /api/historial-tarea/:id - Eliminar historial
router.delete('/historial-tarea/:id', authenticateToken, async (req, res) => {
    await historialTareasController.deleteHistorialTarea(req, res);
});

export default router; 