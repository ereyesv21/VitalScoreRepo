import {DataSource} from 'typeorm';
import { Usuario } from '../entities/Usuarios';
import dotenv from 'dotenv';
import { EPS } from '../entities/Eps';
import { Rol } from '../entities/Rol';
import { Medico } from '../entities/Medico';
import { Paciente } from '../entities/Pacientes';
import { Plan } from '../entities/Planes';
import { HistorialPunto } from '../entities/HistorialPuntos';
import { Tarea } from '../entities/Tareas';
import { Pacientes_Medicos } from '../entities/PacientMedicos';
import { Archivo } from '../entities/Archivos';
import { Administrador } from '../entities/Administradores';
import { Recompensa } from '../entities/Recompensas';
import { Canje } from '../entities/Canjes';


dotenv.config();
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    schema: process.env.DB_SCHEMA,
    synchronize: false,
    logging: true,
    entities: [Usuario, EPS, Rol, Medico, Paciente, Plan, HistorialPunto, Tarea, Pacientes_Medicos, Archivo, Administrador, Recompensa, Canje],
});

//conectar a la base de datos
export const connectDB = async () =>{
    try{
        await AppDataSource.initialize();
        console.log("Database connected successfully");
    }catch (error) {
        console.error("Error connecting to the database:", error);
        process.exit(1); 
    }
};