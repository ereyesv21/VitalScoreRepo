import { Router } from 'express';
import { MedicoAdapter } from '../adapter/MedicoAdapter';
import { MedicoApplicationService } from '../../application/MedicoApplicationService';
import { MedicoController } from '../controller/MedicoController';
import { authenticateToken } from '../web/authMiddleware';
import { UsuariosAdapter } from '../adapter/UsuariosAdapter';
import { EpsAdapter } from '../adapter/EpsAdapter';

const router = Router();

// Inicialización de las capas
const medicoAdapter = new MedicoAdapter();
const usuariosAdapter = new UsuariosAdapter();
const epsAdapter = new EpsAdapter();
const medicoAppService = new MedicoApplicationService(medicoAdapter, usuariosAdapter, epsAdapter);
const medicoController = new MedicoController(medicoAppService);

// Definir las rutas con manejo de errores y autenticación

router.post('/medico', authenticateToken, async (req, res) => {
    try {
        await medicoController.createMedico(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error en la creación del médico', error });
    }
});

router.get('/medicos', authenticateToken, async (req, res) => {
    try {
        await medicoController.getAllMedicos(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los médicos', error });
    }
});

router.get('/medico/:id', authenticateToken, async (req, res) => {
    try {
        await medicoController.getMedicoById(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el médico por ID', error });
    }
});

router.get('/medico/especialidad/:especialidad', authenticateToken, async (req, res) => {
    try {
        await medicoController.getMedicoByEspecialidad(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener médicos por especialidad', error });
    }
});

router.get('/medico/usuario/:usuario', authenticateToken, async (req, res) => {
    try {
        await medicoController.getMedicoByUsuario(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener médico por usuario', error });
    }
});

router.get('/medico/eps/:eps', authenticateToken, async (req, res) => {
    try {
        await medicoController.getMedicoByEps(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener médicos por EPS', error });
    }
});

router.put('/medico/:id', authenticateToken, async (req, res) => {
    try {
        await medicoController.updateMedico(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el médico', error });
    }
});

router.delete('/medico/:id', authenticateToken, async (req, res) => {
    try {
        await medicoController.deleteMedico(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el médico', error });
    }
});

export default router;
