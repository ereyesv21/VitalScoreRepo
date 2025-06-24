import { Router } from 'express';
import { ConfiguracionNotificacionesAdapter } from '../adapter/ConfiguracionNotificacionesAdapter';
import { ConfiguracionNotificacionesApplicationService } from '../../application/ConfiguracionNotificacionesApplicationService';
import { ConfiguracionNotificacionesController } from '../controller/ConfiguracionNotificacionesController';
import { authenticateToken } from '../web/authMiddleware';
import { PacientesAdapter } from '../adapter/PacientesAdapter';
import { MedicoAdapter } from '../adapter/MedicoAdapter';

const router = Router();

const configuracionAdapter = new ConfiguracionNotificacionesAdapter();
const pacientesAdapter = new PacientesAdapter();
const medicoAdapter = new MedicoAdapter();
const appService = new ConfiguracionNotificacionesApplicationService(configuracionAdapter, pacientesAdapter, medicoAdapter);
const controller = new ConfiguracionNotificacionesController(appService);

router.post('/configuracion-notificacion', authenticateToken, async (req, res) => {
    await controller.createConfiguracion(req, res);
});

router.get('/configuraciones-notificaciones', authenticateToken, async (req, res) => {
    await controller.getAllConfiguraciones(req, res);
});

router.get('/configuracion-notificacion/:id', authenticateToken, async (req, res) => {
    await controller.getConfiguracionById(req, res);
});

router.get('/configuraciones-notificaciones/paciente/:paciente', authenticateToken, async (req, res) => {
    await controller.getConfiguracionesByPaciente(req, res);
});

router.get('/configuraciones-notificaciones/medico/:medico', authenticateToken, async (req, res) => {
    await controller.getConfiguracionesByMedico(req, res);
});

router.get('/configuracion-notificacion/paciente/:paciente/tipo/:tipo', authenticateToken, async (req, res) => {
    await controller.getConfiguracionByPacienteAndTipo(req, res);
});

router.get('/configuracion-notificacion/medico/:medico/tipo/:tipo', authenticateToken, async (req, res) => {
    await controller.getConfiguracionByMedicoAndTipo(req, res);
});

router.put('/configuracion-notificacion/:id', authenticateToken, async (req, res) => {
    await controller.updateConfiguracion(req, res);
});

router.delete('/configuracion-notificacion/:id', authenticateToken, async (req, res) => {
    await controller.deleteConfiguracion(req, res);
});

export default router; 