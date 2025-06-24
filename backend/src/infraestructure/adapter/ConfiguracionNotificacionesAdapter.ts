import { ConfiguracionNotificacionesPort } from "../../domain/ConfiguracionNotificacionesPort";
import { ConfiguracionNotificacion as ConfiguracionNotificacionEntity } from "../entities/ConfiguracionNotificaciones";
import { ConfiguracionNotificaciones as ConfiguracionNotificacionDomain } from "../../domain/ConfiguracionNotificaciones";
import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-base";
import { Paciente } from "../entities/Pacientes";
import { Medico } from "../entities/Medico";

export class ConfiguracionNotificacionesAdapter implements ConfiguracionNotificacionesPort {
    private configuracionRepository: Repository<ConfiguracionNotificacionEntity>;

    constructor() {
        this.configuracionRepository = AppDataSource.getRepository(ConfiguracionNotificacionEntity);
    }

    private toDomain(entity: ConfiguracionNotificacionEntity): ConfiguracionNotificacionDomain {
        return {
            id_configuracion: entity.id_configuracion,
            paciente: entity.paciente ? entity.paciente.id_paciente : null,
            medico: entity.medico ? entity.medico.id_medico : null,
            tipo_notificacion: entity.tipo_notificacion,
            activo: entity.activo,
            hora_inicio: entity.hora_inicio,
            hora_fin: entity.hora_fin,
            dias_semana: entity.dias_semana,
            fecha_creacion: entity.fecha_creacion
        };
    }

    private toEntity(domain: Omit<ConfiguracionNotificacionDomain, "id_configuracion" | "fecha_creacion">, pacienteEntity: Paciente | null, medicoEntity: Medico | null): Omit<ConfiguracionNotificacionEntity, "id_configuracion" | "fecha_creacion"> {
        const entity = new ConfiguracionNotificacionEntity();
        entity.paciente = pacienteEntity;
        entity.medico = medicoEntity;
        entity.tipo_notificacion = domain.tipo_notificacion;
        entity.activo = domain.activo;
        entity.hora_inicio = domain.hora_inicio;
        entity.hora_fin = domain.hora_fin;
        entity.dias_semana = domain.dias_semana;
        return entity;
    }

    private async fixSequenceIfNeeded(): Promise<void> {
        try {
            const queryRunner = this.configuracionRepository.manager.connection.createQueryRunner();
            await queryRunner.connect();
            const maxIdResult = await queryRunner.query(
                'SELECT COALESCE(MAX(id_configuracion), 0) as max_id FROM "vitalscore"."Configuracion_Notificaciones"'
            );
            const maxId = parseInt(maxIdResult[0]?.max_id || '0');
            await queryRunner.query(
                `SELECT setval('"vitalscore"."Configuracion_Notificaciones_id_configuracion_seq"', ${maxId + 1}, false)`
            );
            await queryRunner.release();
        } catch (error) {
            console.warn("No se pudo corregir la secuencia automáticamente:", error);
        }
    }

    async createConfiguracion(config: Omit<ConfiguracionNotificacionDomain, "id_configuracion" | "fecha_creacion">): Promise<number> {
        try {
            await this.fixSequenceIfNeeded();
            let pacienteEntity: Paciente | null = null;
            let medicoEntity: Medico | null = null;
            if (config.paciente) {
                const pacienteRepository = this.configuracionRepository.manager.getRepository(Paciente);
                pacienteEntity = await pacienteRepository.findOne({ where: { id_paciente: config.paciente } });
                if (!pacienteEntity) throw new Error("Paciente no encontrado");
            }
            if (config.medico) {
                const medicoRepository = this.configuracionRepository.manager.getRepository(Medico);
                medicoEntity = await medicoRepository.findOne({ where: { id_medico: config.medico } });
                if (!medicoEntity) throw new Error("Médico no encontrado");
            }
            const entity = this.toEntity(config, pacienteEntity, medicoEntity) as ConfiguracionNotificacionEntity;
            const newConfig = await this.configuracionRepository.save(entity);
            return newConfig.id_configuracion;
        } catch (error) {
            console.error("Error creating configuración notificación:", error);
            throw new Error("Failed to create configuración notificación");
        }
    }

    async updateConfiguracion(id: number, config: Partial<ConfiguracionNotificacionDomain>): Promise<boolean> {
        try {
            const existing = await this.configuracionRepository.findOne({ where: { id_configuracion: id }, relations: ["paciente", "medico"] });
            if (!existing) return false;
            if (config.tipo_notificacion !== undefined) existing.tipo_notificacion = config.tipo_notificacion;
            if (config.activo !== undefined) existing.activo = config.activo;
            if (config.hora_inicio !== undefined) existing.hora_inicio = config.hora_inicio;
            if (config.hora_fin !== undefined) existing.hora_fin = config.hora_fin;
            if (config.dias_semana !== undefined) existing.dias_semana = config.dias_semana;
            if (config.paciente !== undefined) {
                if (config.paciente === null) {
                    existing.paciente = null;
                } else {
                    const pacienteRepository = this.configuracionRepository.manager.getRepository(Paciente);
                    const pacienteEntity = await pacienteRepository.findOne({ where: { id_paciente: config.paciente } });
                    if (!pacienteEntity) throw new Error("Paciente no encontrado");
                    existing.paciente = pacienteEntity;
                }
            }
            if (config.medico !== undefined) {
                if (config.medico === null) {
                    existing.medico = null;
                } else {
                    const medicoRepository = this.configuracionRepository.manager.getRepository(Medico);
                    const medicoEntity = await medicoRepository.findOne({ where: { id_medico: config.medico } });
                    if (!medicoEntity) throw new Error("Médico no encontrado");
                    existing.medico = medicoEntity;
                }
            }
            await this.configuracionRepository.save(existing);
            return true;
        } catch (error) {
            console.error("Error updating configuración notificación:", error);
            throw new Error("Failed to update configuración notificación");
        }
    }

    async deleteConfiguracion(id: number): Promise<boolean> {
        try {
            const existing = await this.configuracionRepository.findOne({ where: { id_configuracion: id } });
            if (!existing) return false;
            await this.configuracionRepository.remove(existing);
            return true;
        } catch (error) {
            console.error("Error deleting configuración notificación:", error);
            throw new Error("Failed to delete configuración notificación");
        }
    }

    async getConfiguracionById(id: number): Promise<ConfiguracionNotificacionDomain | null> {
        try {
            const config = await this.configuracionRepository.findOne({ where: { id_configuracion: id }, relations: ["paciente", "medico"] });
            return config ? this.toDomain(config) : null;
        } catch (error) {
            console.error("Error fetching configuración notificación by ID:", error);
            throw new Error("Failed to fetch configuración notificación by ID");
        }
    }

    async getAllConfiguraciones(): Promise<ConfiguracionNotificacionDomain[]> {
        try {
            const configs = await this.configuracionRepository.find({ relations: ["paciente", "medico"] });
            return configs.map(config => this.toDomain(config));
        } catch (error) {
            console.error("Error fetching all configuraciones notificación:", error);
            throw new Error("Failed to fetch all configuraciones notificación");
        }
    }

    async getConfiguracionesByPaciente(paciente: number): Promise<ConfiguracionNotificacionDomain[]> {
        try {
            const configs = await this.configuracionRepository.find({ where: { paciente: { id_paciente: paciente } }, relations: ["paciente", "medico"] });
            return configs.map(config => this.toDomain(config));
        } catch (error) {
            console.error("Error fetching configuraciones by paciente:", error);
            throw new Error("Failed to fetch configuraciones by paciente");
        }
    }

    async getConfiguracionesByMedico(medico: number): Promise<ConfiguracionNotificacionDomain[]> {
        try {
            const configs = await this.configuracionRepository.find({ where: { medico: { id_medico: medico } }, relations: ["paciente", "medico"] });
            return configs.map(config => this.toDomain(config));
        } catch (error) {
            console.error("Error fetching configuraciones by medico:", error);
            throw new Error("Failed to fetch configuraciones by medico");
        }
    }

    async getConfiguracionByPacienteAndTipo(paciente: number, tipo: string): Promise<ConfiguracionNotificacionDomain | null> {
        try {
            const config = await this.configuracionRepository.findOne({ where: { paciente: { id_paciente: paciente }, tipo_notificacion: tipo }, relations: ["paciente", "medico"] });
            return config ? this.toDomain(config) : null;
        } catch (error) {
            console.error("Error fetching configuración by paciente and tipo:", error);
            throw new Error("Failed to fetch configuración by paciente and tipo");
        }
    }

    async getConfiguracionByMedicoAndTipo(medico: number, tipo: string): Promise<ConfiguracionNotificacionDomain | null> {
        try {
            const config = await this.configuracionRepository.findOne({ where: { medico: { id_medico: medico }, tipo_notificacion: tipo }, relations: ["paciente", "medico"] });
            return config ? this.toDomain(config) : null;
        } catch (error) {
            console.error("Error fetching configuración by medico and tipo:", error);
            throw new Error("Failed to fetch configuración by medico and tipo");
        }
    }
} 