import { ArchivosPort } from "../../domain/ArchivosPort";
import { Archivo as ArchivoEntity } from "../entities/Archivos";
import { Archivos as ArchivoDomain } from "../../domain/Archivos";
import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-base";
import { Paciente } from "../entities/Pacientes";

export class ArchivosAdapter implements ArchivosPort {
    private archivoRepository: Repository<ArchivoEntity>;

    constructor() {
        this.archivoRepository = AppDataSource.getRepository(ArchivoEntity);
    }

    // Transforma la entidad de infraestructura al modelo de dominio
    private toDomain(archivoEntity: ArchivoEntity): ArchivoDomain {
        return {
            id_archivo: archivoEntity.id_archivo,
            paciente: archivoEntity.paciente ? archivoEntity.paciente.id_paciente : 0,
            tipo: archivoEntity.tipo,
            url_archivo: archivoEntity.url_archivo,
            fecha_subida: archivoEntity.fecha_subida
        };
    }

    // Transforma el modelo de dominio a la entidad de infraestructura
    private async toEntity(archivoDomain: Omit<ArchivoDomain, "id_archivo">): Promise<Omit<ArchivoEntity, "id_archivo">> {
        const archivoEntity = new ArchivoEntity();
        const pacienteRepo = this.archivoRepository.manager.getRepository(Paciente);
        const pacienteEntity = await pacienteRepo.findOne({ where: { id_paciente: archivoDomain.paciente } });
        if (!pacienteEntity) throw new Error("Paciente no encontrado");
        archivoEntity.paciente = pacienteEntity;
        archivoEntity.tipo = archivoDomain.tipo;
        archivoEntity.url_archivo = archivoDomain.url_archivo;
        archivoEntity.fecha_subida = archivoDomain.fecha_subida;
        return archivoEntity;
    }

    async createArchivo(archivo: Omit<ArchivoDomain, "id_archivo">): Promise<number> {
        try {
            const archivoEntity = await this.toEntity(archivo) as ArchivoEntity;
            const newArchivo = await this.archivoRepository.save(archivoEntity);
            return newArchivo.id_archivo;
        } catch (error) {
            console.error("Error creating archivo:", error);
            throw new Error("Failed to create archivo");
        }
    }

    async updateArchivo(id: number, archivo: Partial<ArchivoDomain>): Promise<boolean> {
        try {
            const existingArchivo = await this.archivoRepository.findOne({ where: { id_archivo: id }, relations: ["paciente"] });
            if (!existingArchivo) return false;

            if (archivo.paciente) {
                const pacienteRepo = this.archivoRepository.manager.getRepository(Paciente);
                const pacienteEntity = await pacienteRepo.findOne({ where: { id_paciente: archivo.paciente } });
                if (!pacienteEntity) throw new Error("Paciente no encontrado");
                existingArchivo.paciente = pacienteEntity;
            }
            if (archivo.tipo !== undefined) existingArchivo.tipo = archivo.tipo;
            if (archivo.url_archivo !== undefined) existingArchivo.url_archivo = archivo.url_archivo;
            if (archivo.fecha_subida !== undefined) existingArchivo.fecha_subida = archivo.fecha_subida;

            await this.archivoRepository.save(existingArchivo);
            return true;
        } catch (error) {
            console.error("Error updating archivo:", error);
            throw new Error("Failed to update archivo");
        }
    }

    async deleteArchivo(id: number): Promise<boolean> {
        try {
            const existingArchivo = await this.archivoRepository.findOne({ where: { id_archivo: id } });
            if (!existingArchivo) return false;
            await this.archivoRepository.remove(existingArchivo);
            return true;
        } catch (error) {
            console.error("Error deleting archivo:", error);
            throw new Error("Failed to delete archivo");
        }
    }

    async getArchivoById(id: number): Promise<ArchivoDomain | null> {
        try {
            const archivo = await this.archivoRepository.findOne({ where: { id_archivo: id }, relations: ["paciente"] });
            return archivo ? this.toDomain(archivo) : null;
        } catch (error) {
            console.error("Error fetching archivo by ID:", error);
            throw new Error("Failed to fetch archivo by ID");
        }
    }

    async getAllArchivos(): Promise<ArchivoDomain[]> {
        try {
            const archivos = await this.archivoRepository.find({ relations: ["paciente"] });
            return archivos.map(archivo => this.toDomain(archivo));
        } catch (error) {
            console.error("Error fetching all archivos:", error);
            throw new Error("Failed to fetch all archivos");
        }
    }

    async getArchivosByPaciente(paciente: number): Promise<ArchivoDomain[]> {
        try {
            const archivos = await this.archivoRepository.find({
                where: { paciente: { id_paciente: paciente } },
                relations: ["paciente"]
            });
            return archivos.map(archivo => this.toDomain(archivo));
        } catch (error) {
            console.error("Error fetching archivos by paciente:", error);
            throw new Error("Failed to fetch archivos by paciente");
        }
    }

    async getArchivosByFecha(fechaInicio: Date, fechaFin: Date): Promise<ArchivoDomain[]> {
        try {
            const archivos = await this.archivoRepository
                .createQueryBuilder("archivo")
                .leftJoinAndSelect("archivo.paciente", "paciente")
                .where("archivo.fecha_subida >= :fechaInicio AND archivo.fecha_subida <= :fechaFin", { fechaInicio, fechaFin })
                .getMany();
            return archivos.map(archivo => this.toDomain(archivo));
        } catch (error) {
            console.error("Error fetching archivos by fecha:", error);
            throw new Error("Failed to fetch archivos by fecha");
        }
    }
}
