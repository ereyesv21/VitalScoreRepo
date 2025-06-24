import { Router } from 'express';
import { EspecialidadesAdapter } from '../adapter/EspecialidadesAdapter';
import { EspecialidadesApplicationService } from '../../application/EspecialidadesApplicationService';
import { EspecialidadesController } from '../controller/EspecialidadesController';
import { authenticateToken } from '../web/authMiddleware';

const router = Router();

// Inicialización de las capas
const especialidadesAdapter = new EspecialidadesAdapter();
const especialidadesAppService = new EspecialidadesApplicationService(especialidadesAdapter);
const especialidadesController = new EspecialidadesController(especialidadesAppService);

// Definir las rutas con manejo de errores y autenticación

// POST /api/especialidad - Crear nueva especialidad
router.post('/especialidad', authenticateToken, async (req, res) => {
    await especialidadesController.createEspecialidad(req, res);
});

// GET /api/especialidades - Obtener todas las especialidades
router.get('/especialidades', async (req, res) => {
    await especialidadesController.getAllEspecialidades(req, res);
});

// GET /api/especialidad/:id - Obtener especialidad por ID
router.get('/especialidad/:id', authenticateToken, async (req, res) => {
    await especialidadesController.getEspecialidadById(req, res);
});

// GET /api/especialidades/nombre/:nombre - Obtener especialidad por nombre
router.get('/especialidades/nombre/:nombre', authenticateToken, async (req, res) => {
    await especialidadesController.getEspecialidadByNombre(req, res);
});

// GET /api/especialidades/estado/:estado - Obtener especialidades por estado
router.get('/especialidades/estado/:estado', authenticateToken, async (req, res) => {
    await especialidadesController.getEspecialidadesByEstado(req, res);
});

// PUT /api/especialidad/:id - Actualizar especialidad
router.put('/especialidad/:id', authenticateToken, async (req, res) => {
    await especialidadesController.updateEspecialidad(req, res);
});

// DELETE /api/especialidad/:id - Eliminar especialidad
router.delete('/especialidad/:id', authenticateToken, async (req, res) => {
    await especialidadesController.deleteEspecialidad(req, res);
});

export default router; 