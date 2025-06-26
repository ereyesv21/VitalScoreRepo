import express, {Request, Response} from 'express';
import cors from 'cors';
import usuariosRoutes from '../routes/UsuariosRoutes';
import epsRoutes from '../routes/EpsRoutes';
import medicoRoutes from '../routes/MedicoRoutes';
import pacientesRoutes from '../routes/PacientesRoutes';
import planRoutes from '../routes/PlanesRoutes';
import tareasRoutes from '../routes/TareasRoutes';
import historialPuntosRoutes from '../routes/HistorialPuntosRoutes';
import pacientesMedicosRoutes from '../routes/PacientMedicosRoutes';
import archivosRoutes from '../routes/ArchivosRoutes';
import administradoresRoutes from '../routes/AdministradoresRoutes';
import recompensasRoutes from '../routes/RecompensasRoutes';
import canjesRoutes from '../routes/CanjesRoutes';
import notificacionesRoutes from '../routes/NotificacionesRoutes';
import citasMedicasRoutes from '../routes/CitasMedicasRoutes';
import configuracionNotificacionesRoutes from '../routes/ConfiguracionNotificacionesRoutes';
import diagnosticosRoutes from '../routes/DiagnosticosRoutes';
import disponibilidadTemporalRoutes from '../routes/DisponibilidadTemporalRoutes';
import enfermedadesRoutes from '../routes/EnfermedadesRoutes';
import especialidadesRoutes from '../routes/EspecialidadesRoutes';
import historialTareasRoutes from '../routes/HistorialTareasRoutes';
import horariosMedicosRoutes from '../routes/HorariosMedicosRoutes';
import horariosMedicosDetalladosRoutes from '../routes/HorariosMedicosDetalladosRoutes';
import medicamentosRoutes from '../routes/MedicamentosRoutes';
import prescripcionesRoutes from '../routes/PrescripcionesRoutes';
import tareasPacientesRoutes from '../routes/TareasPacientesRoutes';

class app{
    //declarar atributos 
    private app: express.Application;

    constructor(){
        this.app =express();
        this.middleware(); //llamamos al metodo middleware
        this.routes();
    }

    private middleware():void{
        this.app.use(cors()); // Enable CORS for all routes
        this.app.use(express.json()); //hace una especi de casteo a especie json sin esto los datos que vengan seran datos null
    }

    private routes():void{
        this.app.use("/api", usuariosRoutes);
        this.app.use("/api", epsRoutes);
        this.app.use("/api", medicoRoutes);
        this.app.use("/api", pacientesRoutes);
        this.app.use("/api", planRoutes);
        this.app.use("/api", tareasRoutes);
        this.app.use("/api", historialPuntosRoutes);
        this.app.use("/api", pacientesMedicosRoutes);
        this.app.use("/api", archivosRoutes);
        this.app.use("/api", administradoresRoutes);
        this.app.use("/api", recompensasRoutes);
        this.app.use("/api", canjesRoutes);
        this.app.use("/api", notificacionesRoutes);
        this.app.use("/api", citasMedicasRoutes);
        this.app.use("/api", configuracionNotificacionesRoutes);
        this.app.use("/api", diagnosticosRoutes);
        this.app.use("/api", disponibilidadTemporalRoutes);
        this.app.use("/api", enfermedadesRoutes);
        this.app.use("/api", especialidadesRoutes);
        this.app.use("/api", historialTareasRoutes);
        this.app.use("/api", horariosMedicosRoutes);
        this.app.use("/api", horariosMedicosDetalladosRoutes);
        this.app.use("/api", medicamentosRoutes);
        this.app.use("/api", prescripcionesRoutes);
        this.app.use("/api", tareasPacientesRoutes);
    }

    getApp(){
        return this.app
    }
}


export default new app().getApp();