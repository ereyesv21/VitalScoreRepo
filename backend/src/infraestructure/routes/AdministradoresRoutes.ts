import { Router } from 'express';
import { AdministradoresAdapter } from '../adapter/AdministradoresAdapter';
import { AdministradoresApplicationService } from '../../application/AdministradoresApplicationService';
import { AdministradoresController } from '../controller/AdministradoresController';
import { authenticateToken } from '../web/authMiddleware';

const router = Router();

// Inicialización de las capas
const administradoresAdapter = new AdministradoresAdapter();
// NOTA: Debes pasar el port de usuarios al service, aquí se asume que tienes un adapter de usuarios disponible
import { UsuariosAdapter } from '../adapter/UsuariosAdapter';
const usuariosAdapter = new UsuariosAdapter();
const administradoresAppService = new AdministradoresApplicationService(administradoresAdapter, usuariosAdapter);
const administradoresController = new AdministradoresController(administradoresAppService);

// Rutas CRUD y búsqueda
router.post('/administrador', authenticateToken, async (req, res) => {
    await administradoresController.createAdministrador(req, res);
});

router.get('/administradores', authenticateToken, async (req, res) => {
    await administradoresController.getAllAdministradores(req, res);
});

router.get('/administrador/:id', authenticateToken, async (req, res) => {
    await administradoresController.getAdministradorById(req, res);
});

router.get('/administrador/usuario/:usuario', authenticateToken, async (req, res) => {
    await administradoresController.getAdministradorByUsuario(req, res);
});

router.put('/administrador/:id', authenticateToken, async (req, res) => {
    await administradoresController.updateAdministrador(req, res);
});

router.delete('/administrador/:id', authenticateToken, async (req, res) => {
    await administradoresController.deleteAdministrador(req, res);
});

export default router;
