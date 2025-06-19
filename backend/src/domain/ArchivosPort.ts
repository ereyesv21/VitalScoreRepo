import { Archivos } from "./Archivos";

export interface ArchivosPort {
    createArchivo(archivo: Omit<Archivos, 'id_archivo'>): Promise<number>;
    updateArchivo(id: number, archivo: Partial<Archivos>): Promise<boolean>;
    deleteArchivo(id: number): Promise<boolean>;
    getArchivoById(id: number): Promise<Archivos | null>;
    getAllArchivos(): Promise<Archivos[]>;
    getArchivosByPaciente(paciente: number): Promise<Archivos[]>;
    getArchivosByFecha(fechaInicio: Date, fechaFin: Date): Promise<Archivos[]>;
}
