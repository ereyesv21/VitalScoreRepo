import { Router } from 'express';
import { EnfermedadesAdapter } from '../adapter/EnfermedadesAdapter';
import { EnfermedadesApplicationService } from '../../application/EnfermedadesApplicationService';
import { EnfermedadesController } from '../controller/EnfermedadesController';
import { authenticateToken } from '../web/authMiddleware';

const router = Router();

// Inicialización de las capas
const enfermedadesAdapter = new EnfermedadesAdapter();
const enfermedadesAppService = new EnfermedadesApplicationService(enfermedadesAdapter);
const enfermedadesController = new EnfermedadesController(enfermedadesAppService);

// Definir las rutas con manejo de errores y autenticación

// POST /api/enfermedad - Crear nueva enfermedad
router.post('/enfermedad', authenticateToken, async (req, res) => {
    await enfermedadesController.createEnfermedad(req, res);
});

// GET /api/enfermedades - Obtener todas las enfermedades
router.get('/enfermedades', authenticateToken, async (req, res) => {
    await enfermedadesController.getAllEnfermedades(req, res);
});

// GET /api/enfermedad/:id - Obtener enfermedad por ID
router.get('/enfermedad/:id', authenticateToken, async (req, res) => {
    await enfermedadesController.getEnfermedadById(req, res);
});

// GET /api/enfermedades/nombre/:nombre - Obtener enfermedades por nombre
router.get('/enfermedades/nombre/:nombre', authenticateToken, async (req, res) => {
    await enfermedadesController.getEnfermedadesByNombre(req, res);
});

// GET /api/enfermedades/categoria/:categoria - Obtener enfermedades por categoría
router.get('/enfermedades/categoria/:categoria', authenticateToken, async (req, res) => {
    await enfermedadesController.getEnfermedadesByCategoria(req, res);
});

// GET /api/enfermedades/estado/:estado - Obtener enfermedades por estado
router.get('/enfermedades/estado/:estado', authenticateToken, async (req, res) => {
    await enfermedadesController.getEnfermedadesByEstado(req, res);
});

// PUT /api/enfermedad/:id - Actualizar enfermedad
router.put('/enfermedad/:id', authenticateToken, async (req, res) => {
    await enfermedadesController.updateEnfermedad(req, res);
});

// DELETE /api/enfermedad/:id - Eliminar enfermedad
router.delete('/enfermedad/:id', authenticateToken, async (req, res) => {
    await enfermedadesController.deleteEnfermedad(req, res);
});

export default router; 