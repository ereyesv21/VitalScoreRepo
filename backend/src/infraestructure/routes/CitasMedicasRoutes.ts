import { Router } from 'express';
import { CitasMedicasAdapter } from '../adapter/CitasMedicasAdapter';
import { CitasMedicasApplicationService } from '../../application/CitasMedicasApplicationService';
import { CitasMedicasController } from '../controller/CitasMedicasController';
import { authenticateToken } from '../web/authMiddleware';
import { PacientesAdapter } from '../adapter/PacientesAdapter';
import { MedicoAdapter } from '../adapter/MedicoAdapter';

const router = Router();

// Inicialización de las capas
const citasMedicasAdapter = new CitasMedicasAdapter();
const pacientesAdapter = new PacientesAdapter();
const medicoAdapter = new MedicoAdapter();
const citasMedicasAppService = new CitasMedicasApplicationService(citasMedicasAdapter, pacientesAdapter, medicoAdapter);
const citasMedicasController = new CitasMedicasController(citasMedicasAppService);

// Definir las rutas con manejo de errores y autenticación

router.post('/cita-medica', authenticateToken, async (req, res) => {
    await citasMedicasController.createCitaMedica(req, res);
});

router.get('/citas-medicas', authenticateToken, async (req, res) => {
    await citasMedicasController.getAllCitasMedicas(req, res);
});

router.get('/cita-medica/:id', authenticateToken, async (req, res) => {
    await citasMedicasController.getCitaMedicaById(req, res);
});

router.get('/citas-medicas/paciente/:paciente', authenticateToken, async (req, res) => {
    await citasMedicasController.getCitasMedicasByPaciente(req, res);
});

router.get('/citas-medicas/medico/:medico', authenticateToken, async (req, res) => {
    await citasMedicasController.getCitasMedicasByMedico(req, res);
});

router.get('/citas-medicas/estado/:estado', authenticateToken, async (req, res) => {
    await citasMedicasController.getCitasMedicasByEstado(req, res);
});

router.get('/citas-medicas/fecha/:fecha', authenticateToken, async (req, res) => {
    await citasMedicasController.getCitasMedicasByFecha(req, res);
});

router.get('/citas-medicas/medico/:medico/fecha/:fecha', authenticateToken, async (req, res) => {
    await citasMedicasController.getCitasMedicasByMedicoAndFecha(req, res);
});

router.get('/citas-medicas/paciente/:paciente/fecha/:fecha', authenticateToken, async (req, res) => {
    await citasMedicasController.getCitasMedicasByPacienteAndFecha(req, res);
});

router.put('/cita-medica/:id', authenticateToken, async (req, res) => {
    await citasMedicasController.updateCitaMedica(req, res);
});

router.delete('/cita-medica/:id', authenticateToken, async (req, res) => {
    await citasMedicasController.deleteCitaMedica(req, res);
});

// Acciones de flujo de la cita
router.post('/cita-medica/:id/cancelar', authenticateToken, async (req, res) => {
    await citasMedicasController.cancelarCita(req, res);
});

router.post('/cita-medica/:id/confirmar', authenticateToken, async (req, res) => {
    await citasMedicasController.confirmarCita(req, res);
});

router.post('/cita-medica/:id/iniciar', authenticateToken, async (req, res) => {
    await citasMedicasController.iniciarCita(req, res);
});

router.post('/cita-medica/:id/completar', authenticateToken, async (req, res) => {
    await citasMedicasController.completarCita(req, res);
});

router.post('/cita-medica/:id/no-asistio', authenticateToken, async (req, res) => {
    await citasMedicasController.marcarNoAsistio(req, res);
});

// Filtros especiales
router.get('/citas-medicas/proximas', authenticateToken, async (req, res) => {
    await citasMedicasController.getCitasMedicasProximas(req, res);
});

router.get('/citas-medicas/vencidas', authenticateToken, async (req, res) => {
    await citasMedicasController.getCitasMedicasVencidas(req, res);
});

export default router; 