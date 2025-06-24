import { Router } from 'express';
import { DiagnosticosAdapter } from '../adapter/DiagnosticosAdapter';
import { DiagnosticosApplicationService } from '../../application/DiagnosticosApplicationService';
import { DiagnosticosController } from '../controller/DiagnosticosController';
import { authenticateToken } from '../web/authMiddleware';
import { PacientesAdapter } from '../adapter/PacientesAdapter';
import { MedicoAdapter } from '../adapter/MedicoAdapter';
import { CitasMedicasAdapter } from '../adapter/CitasMedicasAdapter';

const router = Router();

const diagnosticosAdapter = new DiagnosticosAdapter();
const pacientesAdapter = new PacientesAdapter();
const medicoAdapter = new MedicoAdapter();
const citasMedicasAdapter = new CitasMedicasAdapter();
const appService = new DiagnosticosApplicationService(diagnosticosAdapter, pacientesAdapter, medicoAdapter, citasMedicasAdapter);
const controller = new DiagnosticosController(appService);

router.post('/diagnostico', authenticateToken, async (req, res) => {
    await controller.createDiagnostico(req, res);
});

router.get('/diagnosticos', authenticateToken, async (req, res) => {
    await controller.getAllDiagnosticos(req, res);
});

router.get('/diagnostico/:id', authenticateToken, async (req, res) => {
    await controller.getDiagnosticoById(req, res);
});

router.get('/diagnosticos/paciente/:paciente', authenticateToken, async (req, res) => {
    await controller.getDiagnosticosByPaciente(req, res);
});

router.get('/diagnosticos/medico/:medico', authenticateToken, async (req, res) => {
    await controller.getDiagnosticosByMedico(req, res);
});

router.get('/diagnosticos/cita/:cita', authenticateToken, async (req, res) => {
    await controller.getDiagnosticosByCita(req, res);
});

router.get('/diagnosticos/enfermedad/:enfermedad', authenticateToken, async (req, res) => {
    await controller.getDiagnosticosByEnfermedad(req, res);
});

router.get('/diagnosticos/estado/:estado', authenticateToken, async (req, res) => {
    await controller.getDiagnosticosByEstado(req, res);
});

router.get('/diagnosticos/fecha/:fecha', authenticateToken, async (req, res) => {
    await controller.getDiagnosticosByFecha(req, res);
});

router.get('/diagnosticos/paciente/:paciente/estado/:estado', authenticateToken, async (req, res) => {
    await controller.getDiagnosticosByPacienteAndEstado(req, res);
});

router.get('/diagnosticos/medico/:medico/estado/:estado', authenticateToken, async (req, res) => {
    await controller.getDiagnosticosByMedicoAndEstado(req, res);
});

router.put('/diagnostico/:id', authenticateToken, async (req, res) => {
    await controller.updateDiagnostico(req, res);
});

router.delete('/diagnostico/:id', authenticateToken, async (req, res) => {
    await controller.deleteDiagnostico(req, res);
});

router.get('/diagnosticos/activos', authenticateToken, async (req, res) => {
    await controller.getDiagnosticosActivos(req, res);
});

router.get('/diagnosticos/recientes', authenticateToken, async (req, res) => {
    await controller.getDiagnosticosRecientes(req, res);
});

router.post('/diagnostico/:id/resuelto', authenticateToken, async (req, res) => {
    await controller.marcarComoResuelto(req, res);
});

router.post('/diagnostico/:id/pendiente', authenticateToken, async (req, res) => {
    await controller.marcarComoPendiente(req, res);
});

router.post('/diagnostico/:id/activar', authenticateToken, async (req, res) => {
    await controller.activarDiagnostico(req, res);
});

router.post('/diagnostico/:id/desactivar', authenticateToken, async (req, res) => {
    await controller.desactivarDiagnostico(req, res);
});

export default router; 