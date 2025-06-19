import { HistorialPuntosPort } from "../../domain/HistorialPuntosPort";
import { HistorialPunto as HistorialPuntoEntity } from "../entities/HistorialPuntos";
import { Historial_Puntos as HistorialPuntoDomain } from "../../domain/HistorialPuntos";
import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-base";
import { Paciente } from "../entities/Pacientes";

export class HistorialPuntosAdapter implements HistorialPuntosPort {
    private historialRepository: Repository<HistorialPuntoEntity>;

    constructor() {
        this.historialRepository = AppDataSource.getRepository(HistorialPuntoEntity);
    }

    // Transforma la entidad de infraestructura al modelo de dominio
    private toDomain(historialEntity: HistorialPuntoEntity): HistorialPuntoDomain {
        return {
            id_historial: historialEntity.id_historial,
            paciente: historialEntity.paciente ? historialEntity.paciente.id_paciente : 0,
            puntos: historialEntity.puntos,
            fecha_registro: historialEntity.fecha_registro,
            descripcion: historialEntity.descripcion
        };
    }

    // Transforma el modelo de dominio a la entidad de infraestructura
    private toEntity(historialDomain: Omit<HistorialPuntoDomain, "id_historial">, pacienteEntity: Paciente): Omit<HistorialPuntoEntity, "id_historial"> {
        const historialEntity = new HistorialPuntoEntity();
        historialEntity.paciente = pacienteEntity;
        historialEntity.puntos = historialDomain.puntos;
        historialEntity.fecha_registro = historialDomain.fecha_registro;
        historialEntity.descripcion = historialDomain.descripcion;
        return historialEntity;
    }

    // Método para corregir la secuencia si es necesario
    private async fixSequenceIfNeeded(): Promise<void> {
        try {
            const queryRunner = this.historialRepository.manager.connection.createQueryRunner();
            await queryRunner.connect();
            
            // Obtener el máximo ID actual
            const maxIdResult = await queryRunner.query(
                'SELECT COALESCE(MAX(id_historial), 0) as max_id FROM "vitalscore"."Historial_Puntos"'
            );
            const maxId = parseInt(maxIdResult[0]?.max_id || '0');
            
            // Corregir la secuencia
            await queryRunner.query(
                `SELECT setval('"vitalscore"."Historial_Puntos_id_historial_seq"', ${maxId + 1}, false)`
            );
            
            await queryRunner.release();
        } catch (error) {
            console.warn("No se pudo corregir la secuencia automáticamente:", error);
        }
    }

    async createHistorial(historial: Omit<HistorialPuntoDomain, "id_historial">): Promise<number> {
        try {
            // Intentar corregir la secuencia antes de crear
            await this.fixSequenceIfNeeded();

            // Busca el objeto Paciente por id
            const pacienteRepository = this.historialRepository.manager.getRepository(Paciente);
            const pacienteEntity = await pacienteRepository.findOne({ where: { id_paciente: historial.paciente } });
            if (!pacienteEntity) throw new Error("Paciente no encontrado");

            // Crea el historialEntity y asigna el objeto relacionado
            const historialEntity = this.toEntity(historial, pacienteEntity) as HistorialPuntoEntity;

            const newHistorial = await this.historialRepository.save(historialEntity);
            return newHistorial.id_historial;
        } catch (error) {
            console.error("Error creating historial:", error);
            throw new Error("Failed to create historial");
        }
    }

    async updateHistorial(id: number, historial: Partial<HistorialPuntoDomain>): Promise<boolean> {
        try {
            const existingHistorial = await this.historialRepository.findOne({ where: { id_historial: id }, relations: ["paciente"] });
            if (!existingHistorial) return false;

            // Actualizar solo los campos enviados
            if (historial.puntos !== undefined) existingHistorial.puntos = historial.puntos;
            if (historial.fecha_registro !== undefined) existingHistorial.fecha_registro = historial.fecha_registro;
            if (historial.descripcion !== undefined) existingHistorial.descripcion = historial.descripcion;

            // Si se actualiza el paciente, buscar la nueva entidad
            if (historial.paciente) {
                const pacienteRepository = this.historialRepository.manager.getRepository(Paciente);
                const pacienteEntity = await pacienteRepository.findOne({ where: { id_paciente: historial.paciente } });
                if (!pacienteEntity) throw new Error("Paciente no encontrado");
                existingHistorial.paciente = pacienteEntity;
            }

            await this.historialRepository.save(existingHistorial);
            return true;
        } catch (error) {
            console.error("Error updating historial:", error);
            throw new Error("Failed to update historial");
        }
    }

    async deleteHistorial(id: number): Promise<boolean> {
        try {
            const existingHistorial = await this.historialRepository.findOne({ where: { id_historial: id } });
            if (!existingHistorial) return false;
            
            // Eliminar físicamente el registro
            await this.historialRepository.remove(existingHistorial);
            return true;
        } catch (error) {
            console.error("Error deleting historial:", error);
            throw new Error("Failed to delete historial");
        }
    }

    async getHistorialById(id: number): Promise<HistorialPuntoDomain | null> {
        try {
            const historial = await this.historialRepository.findOne({ 
                where: { id_historial: id }, 
                relations: ["paciente"] 
            });
            return historial ? this.toDomain(historial) : null;
        } catch (error) {
            console.error("Error fetching historial by ID:", error);
            throw new Error("Failed to fetch historial by ID");
        }
    }

    async getAllHistoriales(): Promise<HistorialPuntoDomain[]> {
        try {
            const historiales = await this.historialRepository.find({ relations: ["paciente"] });
            return historiales.map(historial => this.toDomain(historial));
        } catch (error) {
            console.error("Error fetching all historiales:", error);
            throw new Error("Failed to fetch all historiales");
        }
    }

    async getHistorialesByPaciente(paciente: number): Promise<HistorialPuntoDomain[]> {
        try {
            const historiales = await this.historialRepository.find({ 
                where: { paciente: { id_paciente: paciente } }, 
                relations: ["paciente"] 
            });
            return historiales.map(historial => this.toDomain(historial));
        } catch (error) {
            console.error("Error fetching historiales by paciente:", error);
            throw new Error("Failed to fetch historiales by paciente");
        }
    }

    async getHistorialesByFecha(fechaInicio: Date, fechaFin: Date): Promise<HistorialPuntoDomain[]> {
        try {
            const historiales = await this.historialRepository
                .createQueryBuilder("historial")
                .leftJoinAndSelect("historial.paciente", "paciente")
                .where("historial.fecha_registro >= :fechaInicio AND historial.fecha_registro <= :fechaFin", { fechaInicio, fechaFin })
                .getMany();
            return historiales.map(historial => this.toDomain(historial));
        } catch (error) {
            console.error("Error fetching historiales by fecha:", error);
            throw new Error("Failed to fetch historiales by fecha");
        }
    }

    async getHistorialesByPuntos(puntos: number): Promise<HistorialPuntoDomain[]> {
        try {
            const historiales = await this.historialRepository.find({ 
                where: { puntos: puntos }, 
                relations: ["paciente"] 
            });
            return historiales.map(historial => this.toDomain(historial));
        } catch (error) {
            console.error("Error fetching historiales by puntos:", error);
            throw new Error("Failed to fetch historiales by puntos");
        }
    }

    async getHistorialesPorRangoPuntos(puntosMin: number, puntosMax: number): Promise<HistorialPuntoDomain[]> {
        try {
            const historiales = await this.historialRepository
                .createQueryBuilder("historial")
                .leftJoinAndSelect("historial.paciente", "paciente")
                .where("historial.puntos >= :puntosMin AND historial.puntos <= :puntosMax", { puntosMin, puntosMax })
                .getMany();
            return historiales.map(historial => this.toDomain(historial));
        } catch (error) {
            console.error("Error fetching historiales por rango de puntos:", error);
            throw new Error("Failed to fetch historiales por rango de puntos");
        }
    }
} 