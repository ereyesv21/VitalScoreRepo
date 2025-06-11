import express, {Request, Response} from 'express';
import userRoutes from '../routes/UsersRoutes';

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
        this.app.use("/api",userRoutes);
    }

    getApp(){
        return this.app
    }
}


export default new app().getApp();