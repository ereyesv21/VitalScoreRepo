import { Router } from 'express';
import { MedicamentosAdapter } from '../adapter/MedicamentosAdapter';
import { MedicamentosApplicationService } from '../../application/MedicamentosApplicationService';
import { MedicamentosController } from '../controller/MedicamentosController';
import { authenticateToken } from '../web/authMiddleware';

const router = Router();

// Inicialización de las capas
const medicamentosAdapter = new MedicamentosAdapter();
const medicamentosAppService = new MedicamentosApplicationService(medicamentosAdapter);
const medicamentosController = new MedicamentosController(medicamentosAppService);

// Definir las rutas con manejo de errores y autenticación

// POST /api/medicamento - Crear nuevo medicamento
router.post('/medicamento', authenticateToken, async (req, res) => {
    await medicamentosController.create(req, res);
});

// GET /api/medicamentos - Obtener todos los medicamentos
router.get('/medicamentos', authenticateToken, async (req, res) => {
    await medicamentosController.getAll(req, res);
});

// GET /api/medicamento/:id - Obtener medicamento por ID
router.get('/medicamento/:id', authenticateToken, async (req, res) => {
    await medicamentosController.getById(req, res);
});

// GET /api/medicamentos/nombre/:nombre - Obtener medicamento por nombre
router.get('/medicamentos/nombre/:nombre', authenticateToken, async (req, res) => {
    await medicamentosController.getByNombre(req, res);
});

// GET /api/medicamentos/estado/:estado - Obtener medicamentos por estado
router.get('/medicamentos/estado/:estado', authenticateToken, async (req, res) => {
    await medicamentosController.getByEstado(req, res);
});

// PUT /api/medicamento/:id - Actualizar medicamento
router.put('/medicamento/:id', authenticateToken, async (req, res) => {
    await medicamentosController.update(req, res);
});

// DELETE /api/medicamento/:id - Eliminar medicamento
router.delete('/medicamento/:id', authenticateToken, async (req, res) => {
    await medicamentosController.delete(req, res);
});

export default router; 