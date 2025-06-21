/**
 * Este modulo se encarga de:
 * cargar variables de entorno desde un archivo .env usando dotenv
 * validarlas con joi para asegurarse de que tengan los formatos esperados 
 * exportarlas como un objeto tipado para uso e la aplicacion
 */

import * as joi from 'joi';
import dotenv from 'dotenv';
dotenv.config();

//ReturnEnviromentVars: define el tipo de las variables de entorno que la aplicacion utilizara
export type ReturnEnviromentVars = {
    PORT: number;  
    DB_HOST: string;
    DB_PORT:number;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string; 
    DB_SCHEMA: string; // Agregado para el esquema de la base de datos
}

/**
 * ValidationEnvironmentVars: Estructura que almacena el resultado de la validacion de las variables de entorno
 */

type ValidationEnvironmentVars = {
    error: joi.ValidationError | undefined;
    value: ReturnEnviromentVars;
}

function validateEnvVars(vars:NodeJS.ProcessEnv): ValidationEnvironmentVars{
    const envSchema = joi.object({
        PORT: joi.number().required(),
        DB_HOST: joi.string().required(),
        DB_PORT: joi.number().default(5432),
        DB_USER: joi.string().required(),
        DB_PASSWORD: joi.string().allow("").optional(),
        DB_NAME: joi.string().required(),
        DB_SCHEMA: joi.string().required()
    }).unknown(true);

    const {error, value} = envSchema.validate(vars);
    return{error,value}
}

const loadEnvVars = (): ReturnEnviromentVars => {
    const result = validateEnvVars(process.env);
    if(result.error){
        throw new Error(`Error al cargar las variables de entorno: ${result.error.message}`);
    }
    const value= result.value;
    return {
        PORT: value.PORT,
        DB_HOST: value.DB_HOST,
        DB_PORT: value.DB_PORT,
        DB_USER: value.DB_USER,
        DB_PASSWORD: value.DB_PASSWORD,
        DB_NAME: value.DB_NAME,
        DB_SCHEMA: value.DB_SCHEMA
    }
}