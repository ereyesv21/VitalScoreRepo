import { Router } from 'express';
import { PacientesAdapter } from '../adapter/PacientesAdapter';
import { PacientesApplicationService } from '../../application/PacientesApplicationService';
import { PacientesController } from '../controller/PacientesController';
import { authenticateToken } from '../web/authMiddleware';
import { UsuariosAdapter } from '../adapter/UsuariosAdapter';
import { EpsAdapter } from '../adapter/EpsAdapter';

const router = Router();

// Inicialización de las capas
const pacientesAdapter = new PacientesAdapter();
const usuariosAdapter = new UsuariosAdapter();
const epsAdapter = new EpsAdapter();
const pacientesAppService = new PacientesApplicationService(pacientesAdapter, usuariosAdapter, epsAdapter);
const pacientesController = new PacientesController(pacientesAppService);

// Definir las rutas con manejo de errores y autenticación

router.post('/paciente', authenticateToken, async (req, res) => {
    try {
        await pacientesController.createPaciente(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error en la creación del paciente', error });
    }
});

router.get('/pacientes', authenticateToken, async (req, res) => {
    try {
        await pacientesController.getAllPacientes(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los pacientes', error });
    }
});

router.get('/paciente/current', authenticateToken, async (req, res) => {
    console.log('--> DEBUG: Entrando al manejador de la ruta /paciente/current');
    try {
        await pacientesController.getCurrentPaciente(req, res);
    } catch (error) {
        console.error('--> DEBUG: Error en la ruta /paciente/current:', error);
        res.status(500).json({ message: 'Error al obtener paciente actual', error: (error as Error).message });
    }
});

router.get('/paciente/:id', authenticateToken, async (req, res) => {
    try {
        await pacientesController.getPacienteById(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el paciente por ID', error });
    }
});

router.get('/paciente/usuario/:usuario', authenticateToken, async (req, res) => {
    try {
        await pacientesController.getPacienteByUsuario(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener paciente por usuario', error });
    }
});

router.get('/paciente/eps/:eps', authenticateToken, async (req, res) => {
    try {
        await pacientesController.getPacienteByEps(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener pacientes por EPS', error });
    }
});

router.get('/paciente/puntos/:puntos', authenticateToken, async (req, res) => {
    try {
        await pacientesController.getPacientesByPuntos(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener pacientes por puntos', error });
    }
});

router.put('/paciente/:id', authenticateToken, async (req, res) => {
    try {
        await pacientesController.updatePaciente(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el paciente', error });
    }
});

router.put('/paciente/:id/racha', authenticateToken, async (req, res) => {
    try {
        await pacientesController.actualizarRacha(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la racha del paciente', error });
    }
});

router.delete('/paciente/:id', authenticateToken, async (req, res) => {
    try {
        await pacientesController.deletePaciente(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el paciente', error });
    }
});

// Rutas específicas para gestión de puntos
router.post('/paciente/:id/puntos/agregar', authenticateToken, async (req, res) => {
    try {
        await pacientesController.addPuntos(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar puntos al paciente', error });
    }
});

router.post('/paciente/:id/puntos/sustraer', authenticateToken, async (req, res) => {
    try {
        await pacientesController.subtractPuntos(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al sustraer puntos del paciente', error });
    }
});

// Rutas para filtros especiales
router.get('/pacientes/puntos-altos', authenticateToken, async (req, res) => {
    try {
        await pacientesController.getPacientesConPuntosAltos(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener pacientes con puntos altos', error });
    }
});

router.get('/pacientes/puntos-bajos', authenticateToken, async (req, res) => {
    try {
        await pacientesController.getPacientesConPuntosBajos(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener pacientes con puntos bajos', error });
    }
});

export default router;
