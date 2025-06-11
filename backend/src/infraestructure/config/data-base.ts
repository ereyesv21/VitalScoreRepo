import {DataSource} from 'typeorm';
import { User } from '../entities/Users';
import dotenv from 'dotenv';

dotenv.config();
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    schema: process.env.DB_SCHEMA,
    synchronize: true,
    logging: true,
    entities: [User],
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