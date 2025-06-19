import express, {Request, Response} from 'express';
import usuariosRoutes from '../routes/UsuariosRoutes';
import epsRoutes from '../routes/EpsRoutes';
import medicoRoutes from '../routes/MedicoRoutes';
import pacientesRoutes from '../routes/PacientesRoutes';


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

    }

    getApp(){
        return this.app
    }
}


export default new app().getApp();