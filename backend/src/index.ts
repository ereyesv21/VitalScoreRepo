import "./infraestructure/config/enviroment-vars";
import app from './infraestructure/web/app';
import { ServerBootstrap } from './infraestructure/boostrap/server.boostrap';
import { connectDB } from './infraestructure/config/data-base';

const server = new ServerBootstrap(app);
//inicio el servidor y maneja errores de inicializacion'

((async () =>{
        try{
            await connectDB();
            const instances = [server.init()];
            await Promise.all(instances)
        }catch(error){
            console.error(error);
            process.exit(1); //termina el proceso si hay un error
        }
    })
)();