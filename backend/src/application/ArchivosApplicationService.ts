import { ArchivosPort } from "../domain/ArchivosPort";
import { Archivos } from "../domain/Archivos";
import { PacientePort } from "../domain/PacientePort";

export class ArchivosApplicationService {
    private readonly archivosPort: ArchivosPort;
    private readonly pacientePort: PacientePort;

    constructor(archivosPort: ArchivosPort, pacientePort: PacientePort) {
        this.archivosPort = archivosPort;
        this.pacientePort = pacientePort;
    }

    async createArchivo(archivoData: Omit<Archivos, "id_archivo">): Promise<number> {
        // Validar que el paciente existe
        const pacienteExistente = await this.pacientePort.getPacienteById(archivoData.paciente);
        if (!pacienteExistente) {
            throw new Error("El paciente especificado no existe");
        }
        // Validar tipo
        if (!archivoData.tipo || typeof archivoData.tipo !== 'string') {
            throw new Error("El tipo de archivo es requerido y debe ser una cadena de texto");
        }
        // Validar url_archivo
        if (!archivoData.url_archivo || typeof archivoData.url_archivo !== 'string') {
            throw new Error("La URL del archivo es requerida y debe ser una cadena de texto");
        }
        // Validar fecha_subida
        if (!archivoData.fecha_subida || isNaN(new Date(archivoData.fecha_subida).getTime())) {
            throw new Error("La fecha de subida es inválida");
        }
        return await this.archivosPort.createArchivo(archivoData);
    }

    async updateArchivo(id: number, archivoData: Partial<Archivos>): Promise<boolean> {
        // Validar que el archivo existe
        const archivoExistente = await this.archivosPort.getArchivoById(id);
        if (!archivoExistente) {
            throw new Error("El archivo no existe");
        }
        // Si se actualiza el paciente, validar que existe
        if (archivoData.paciente && archivoData.paciente !== archivoExistente.paciente) {
            const pacienteExistente = await this.pacientePort.getPacienteById(archivoData.paciente);
            if (!pacienteExistente) {
                throw new Error("El paciente especificado no existe");
            }
        }
        // Si se actualiza la fecha, validar
        if (archivoData.fecha_subida !== undefined && isNaN(new Date(archivoData.fecha_subida).getTime())) {
            throw new Error("La fecha de subida es inválida");
        }
        // Si se actualiza la url_archivo, validar
        if (archivoData.url_archivo !== undefined && (!archivoData.url_archivo || typeof archivoData.url_archivo !== 'string')) {
            throw new Error("La URL del archivo debe ser una cadena de texto no vacía");
        }
        // Si se actualiza el tipo, validar
        if (archivoData.tipo !== undefined && (!archivoData.tipo || typeof archivoData.tipo !== 'string')) {
            throw new Error("El tipo de archivo debe ser una cadena de texto no vacía");
        }
        return await this.archivosPort.updateArchivo(id, archivoData);
    }

    async deleteArchivo(id: number): Promise<boolean> {
        // Validar que el archivo existe
        const archivoExistente = await this.archivosPort.getArchivoById(id);
        if (!archivoExistente) {
            throw new Error("El archivo no existe");
        }
        return await this.archivosPort.deleteArchivo(id);
    }

    async getArchivoById(id: number): Promise<Archivos | null> {
        return await this.archivosPort.getArchivoById(id);
    }

    async getAllArchivos(): Promise<Archivos[]> {
        return await this.archivosPort.getAllArchivos();
    }

    async getArchivosByPaciente(paciente: number): Promise<Archivos[]> {
        // Validar existencia de paciente
        const existe = await this.pacientePort.getPacienteById(paciente);
        if (!existe) {
            throw new Error("El paciente especificado no existe");
        }
        return await this.archivosPort.getArchivosByPaciente(paciente);
    }

    async getArchivosByFecha(fechaInicio: Date, fechaFin: Date): Promise<Archivos[]> {
        // Validar fechas
        if (!fechaInicio || !fechaFin || isNaN(new Date(fechaInicio).getTime()) || isNaN(new Date(fechaFin).getTime())) {
            throw new Error("Las fechas de inicio y fin son requeridas y deben ser válidas");
        }
        if (fechaInicio >= fechaFin) {
            throw new Error("La fecha de inicio debe ser anterior a la fecha de fin");
        }
        return await this.archivosPort.getArchivosByFecha(fechaInicio, fechaFin);
    }
}
