import { Router } from 'express';
import { ArchivosAdapter } from '../adapter/ArchivosAdapter';
import { ArchivosApplicationService } from '../../application/ArchivosApplicationService';
import { ArchivosController } from '../controller/ArchivosController';
import { authenticateToken } from '../web/authMiddleware';
import { PacientesAdapter } from '../adapter/PacientesAdapter';

const router = Router();

// Inicialización de las capas
const archivosAdapter = new ArchivosAdapter();
const pacientesAdapter = new PacientesAdapter();
const archivosAppService = new ArchivosApplicationService(archivosAdapter, pacientesAdapter);
const archivosController = new ArchivosController(archivosAppService);

// Rutas CRUD y búsqueda
router.post('/archivo', authenticateToken, async (req, res) => {
    await archivosController.createArchivo(req, res);
});

router.get('/archivos', authenticateToken, async (req, res) => {
    await archivosController.getAllArchivos(req, res);
});

router.get('/archivo/:id', authenticateToken, async (req, res) => {
    await archivosController.getArchivoById(req, res);
});

router.get('/archivos/paciente/:paciente', authenticateToken, async (req, res) => {
    await archivosController.getArchivosByPaciente(req, res);
});

router.get('/archivos/fecha', authenticateToken, async (req, res) => {
    await archivosController.getArchivosByFecha(req, res);
});

router.put('/archivo/:id', authenticateToken, async (req, res) => {
    await archivosController.updateArchivo(req, res);
});

router.delete('/archivo/:id', authenticateToken, async (req, res) => {
    await archivosController.deleteArchivo(req, res);
});

export default router;
