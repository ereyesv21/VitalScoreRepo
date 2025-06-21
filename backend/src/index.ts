import "./infraestructure/config/enviroment-vars";
import app from './infraestructure/web/app';
import { ServerBootstrap } from './infraestructure/boostrap/server.boostrap';
import { connectDB } from './infraestructure/config/data-base';

const server = new ServerBootstrap(app);
//inicio el servidor y maneja errores de inicializacion'

((async () =>{
        try{
            // 1. Conectar a la base de datos PRIMERO
            await connectDB();
            
            // 2. Iniciar el servidor DESPUÉS de que la conexión sea exitosa
            await server.init();

        }catch(error){
            console.error('Error durante la inicialización:', error);
            process.exit(1); //termina el proceso si hay un error
        }
    })
)();