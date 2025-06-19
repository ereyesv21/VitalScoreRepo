import { NotificacionesPort } from "../../domain/NotificacionesPort";
import { Notificacion as NotificacionEntity } from "../entities/Notificaciones";
import { Notificaciones as NotificacionDomain } from "../../domain/Notificaciones";
import { Repository, Between } from "typeorm";
import { AppDataSource } from "../config/data-base";
import { Paciente } from "../entities/Pacientes";

export class NotificacionesAdapter implements NotificacionesPort {
    private notificacionRepository: Repository<NotificacionEntity>;

    constructor() {
        this.notificacionRepository = AppDataSource.getRepository(NotificacionEntity);
    }

    // Transforma la entidad de infraestructura al modelo de dominio
    private toDomain(notificacionEntity: NotificacionEntity): NotificacionDomain {
        return {
            id_notificacion: notificacionEntity.id_notificacion,
            paciente: notificacionEntity.paciente ? notificacionEntity.paciente.id_paciente : 0,
            mensaje: notificacionEntity.mensaje,
            fecha_envio: notificacionEntity.fecha_envio
        };
    }

    // Transforma el modelo de dominio a la entidad de infraestructura
    private toEntity(
        notificacionDomain: Omit<NotificacionDomain, "id_notificacion">,
        pacienteEntity: Paciente
    ): Omit<NotificacionEntity, "id_notificacion"> {
        const notificacionEntity = new NotificacionEntity();
        notificacionEntity.paciente = pacienteEntity;
        notificacionEntity.mensaje = notificacionDomain.mensaje;
        notificacionEntity.fecha_envio = notificacionDomain.fecha_envio;
        return notificacionEntity;
    }

    // Método para corregir la secuencia si es necesario
    private async fixSequenceIfNeeded(): Promise<void> {
        try {
            const queryRunner = this.notificacionRepository.manager.connection.createQueryRunner();
            await queryRunner.connect();
            
            const maxIdResult = await queryRunner.query(
                'SELECT COALESCE(MAX(id_notificacion), 0) as max_id FROM "vitalscore"."Notificaciones"'
            );
            const maxId = parseInt(maxIdResult[0]?.max_id || '0');
            
            await queryRunner.query(
                `SELECT setval('"vitalscore"."Notificaciones_id_notificacion_seq"', ${maxId + 1}, false)`
            );
            
            await queryRunner.release();
        } catch (error) {
            console.warn("No se pudo corregir la secuencia automáticamente:", error);
        }
    }

    async createNotificacion(notificacion: Omit<NotificacionDomain, "id_notificacion">): Promise<number> {
        try {
            await this.fixSequenceIfNeeded();

            const pacienteRepository = this.notificacionRepository.manager.getRepository(Paciente);
            const pacienteEntity = await pacienteRepository.findOne({ where: { id_paciente: notificacion.paciente } });
            if (!pacienteEntity) throw new Error("Paciente no encontrado");

            const notificacionEntity = this.toEntity(notificacion, pacienteEntity) as NotificacionEntity;
            const newNotificacion = await this.notificacionRepository.save(notificacionEntity);
            return newNotificacion.id_notificacion;
        } catch (error) {
            console.error("Error creating notificacion:", error);
            throw new Error("Failed to create notificacion");
        }
    }

    async updateNotificacion(id: number, notificacion: Partial<NotificacionDomain>): Promise<boolean> {
        try {
            const existingNotificacion = await this.notificacionRepository.findOne({
                where: { id_notificacion: id },
                relations: ["paciente"]
            });
            if (!existingNotificacion) return false;

            if (notificacion.mensaje !== undefined) existingNotificacion.mensaje = notificacion.mensaje;
            if (notificacion.fecha_envio !== undefined) existingNotificacion.fecha_envio = notificacion.fecha_envio;

            if (notificacion.paciente) {
                const pacienteRepository = this.notificacionRepository.manager.getRepository(Paciente);
                const pacienteEntity = await pacienteRepository.findOne({ where: { id_paciente: notificacion.paciente } });
                if (!pacienteEntity) throw new Error("Paciente no encontrado");
                existingNotificacion.paciente = pacienteEntity;
            }

            await this.notificacionRepository.save(existingNotificacion);
            return true;
        } catch (error) {
            console.error("Error updating notificacion:", error);
            throw new Error("Failed to update notificacion");
        }
    }

    async deleteNotificacion(id: number): Promise<boolean> {
        try {
            const existingNotificacion = await this.notificacionRepository.findOne({ where: { id_notificacion: id } });
            if (!existingNotificacion) return false;
            await this.notificacionRepository.remove(existingNotificacion);
            return true;
        } catch (error) {
            console.error("Error deleting notificacion:", error);
            throw new Error("Failed to delete notificacion");
        }
    }

    async getNotificacionById(id: number): Promise<NotificacionDomain | null> {
        try {
            const notificacion = await this.notificacionRepository.findOne({
                where: { id_notificacion: id },
                relations: ["paciente"]
            });
            return notificacion ? this.toDomain(notificacion) : null;
        } catch (error) {
            console.error("Error fetching notificacion by ID:", error);
            throw new Error("Failed to fetch notificacion by ID");
        }
    }

    async getAllNotificaciones(): Promise<NotificacionDomain[]> {
        try {
            const notificaciones = await this.notificacionRepository.find({ relations: ["paciente"] });
            return notificaciones.map(notificacion => this.toDomain(notificacion));
        } catch (error) {
            console.error("Error fetching all notificaciones:", error);
            throw new Error("Failed to fetch all notificaciones");
        }
    }

    async getNotificacionesByPaciente(paciente: number): Promise<NotificacionDomain[]> {
        try {
            const notificaciones = await this.notificacionRepository.find({
                where: { paciente: { id_paciente: paciente } },
                relations: ["paciente"],
                order: { fecha_envio: "DESC" }
            });
            return notificaciones.map(notificacion => this.toDomain(notificacion));
        } catch (error) {
            console.error("Error fetching notificaciones by paciente:", error);
            throw new Error("Failed to fetch notificaciones by paciente");
        }
    }

    async getNotificacionesPorFecha(fechaInicio: Date, fechaFin: Date): Promise<NotificacionDomain[]> {
        try {
            const notificaciones = await this.notificacionRepository.find({
                where: { fecha_envio: Between(fechaInicio, fechaFin) },
                relations: ["paciente"],
                order: { fecha_envio: "DESC" }
            });
            return notificaciones.map(notificacion => this.toDomain(notificacion));
        } catch (error) {
            console.error("Error fetching notificaciones by fecha:", error);
            throw new Error("Failed to fetch notificaciones by fecha");
        }
    }
} 