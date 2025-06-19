import express, {Request, Response} from 'express';
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

class app{
    //declarar atributos 
    private app: express.Application;

    constructor(){
        this.app =express();
        this.middleware(); //llamamos al metodo middleware
        this.routes();
    }

    private middleware():void{
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

    }

    getApp(){
        return this.app
    }
}


export default new app().getApp();