import { CanjesPort } from "../../domain/CanjesPort";
import { Canje as CanjeEntity } from "../entities/Canjes";
import { Canjes as CanjeDomain } from "../../domain/Canjes";
import { Repository, Between } from "typeorm";
import { AppDataSource } from "../config/data-base";
import { Paciente } from "../entities/Pacientes";
import { Recompensa } from "../entities/Recompensas";

export class CanjesAdapter implements CanjesPort {
    private canjeRepository: Repository<CanjeEntity>;

    constructor() {
        this.canjeRepository = AppDataSource.getRepository(CanjeEntity);
    }

    // Transforma la entidad de infraestructura al modelo de dominio
    private toDomain(canjeEntity: CanjeEntity): CanjeDomain {
        return {
            id_canje: canjeEntity.id_canje,
            paciente: canjeEntity.paciente ? canjeEntity.paciente.id_paciente : 0,
            recompensa: canjeEntity.recompensa ? canjeEntity.recompensa.id_recompensa : 0,
            puntos_utilizados: canjeEntity.puntos_utilizados,
            fecha_canje: canjeEntity.fecha_canje,
            estado: canjeEntity.estado
        };
    }

    // Transforma el modelo de dominio a la entidad de infraestructura
    private toEntity(
        canjeDomain: Omit<CanjeDomain, "id_canje">,
        pacienteEntity: Paciente,
        recompensaEntity: Recompensa
    ): Omit<CanjeEntity, "id_canje"> {
        const canjeEntity = new CanjeEntity();
        canjeEntity.paciente = pacienteEntity;
        canjeEntity.recompensa = recompensaEntity;
        canjeEntity.puntos_utilizados = canjeDomain.puntos_utilizados;
        canjeEntity.fecha_canje = canjeDomain.fecha_canje;
        canjeEntity.estado = canjeDomain.estado;
        return canjeEntity;
    }

    // Corrige la secuencia de PostgreSQL si es necesario
    private async fixSequenceIfNeeded(): Promise<void> {
        try {
            const queryRunner = this.canjeRepository.manager.connection.createQueryRunner();
            await queryRunner.connect();
            const maxIdResult = await queryRunner.query(
                'SELECT COALESCE(MAX(id_canje), 0) as max_id FROM "vitalscore"."Canjes"'
            );
            const maxId = parseInt(maxIdResult[0]?.max_id || '0');
            await queryRunner.query(
                `SELECT setval('"vitalscore"."Canjes_id_canje_seq"', ${maxId + 1}, false)`
            );
            await queryRunner.release();
        } catch (error) {
            console.warn("No se pudo corregir la secuencia automáticamente:", error);
        }
    }

    async createCanje(canje: Omit<CanjeDomain, "id_canje">): Promise<number> {
        try {
            await this.fixSequenceIfNeeded();

            const pacienteRepository = this.canjeRepository.manager.getRepository(Paciente);
            const recompensaRepository = this.canjeRepository.manager.getRepository(Recompensa);

            const pacienteEntity = await pacienteRepository.findOne({ where: { id_paciente: canje.paciente } });
            if (!pacienteEntity) throw new Error("Paciente no encontrado");

            const recompensaEntity = await recompensaRepository.findOne({ where: { id_recompensa: canje.recompensa } });
            if (!recompensaEntity) throw new Error("Recompensa no encontrada");

            const canjeEntity = this.toEntity(canje, pacienteEntity, recompensaEntity) as CanjeEntity;
            const newCanje = await this.canjeRepository.save(canjeEntity);
            return newCanje.id_canje;
        } catch (error) {
            console.error("Error creating canje:", error);
            throw new Error("Failed to create canje");
        }
    }

    async updateCanje(id: number, canje: Partial<CanjeDomain>): Promise<boolean> {
        try {
            const existingCanje = await this.canjeRepository.findOne({
                where: { id_canje: id },
                relations: ["paciente", "recompensa"]
            });
            if (!existingCanje) return false;

            if (canje.puntos_utilizados !== undefined) existingCanje.puntos_utilizados = canje.puntos_utilizados;
            if (canje.fecha_canje !== undefined) existingCanje.fecha_canje = canje.fecha_canje;
            if (canje.estado !== undefined) existingCanje.estado = canje.estado;

            if (canje.paciente) {
                const pacienteRepository = this.canjeRepository.manager.getRepository(Paciente);
                const pacienteEntity = await pacienteRepository.findOne({ where: { id_paciente: canje.paciente } });
                if (!pacienteEntity) throw new Error("Paciente no encontrado");
                existingCanje.paciente = pacienteEntity;
            }

            if (canje.recompensa) {
                const recompensaRepository = this.canjeRepository.manager.getRepository(Recompensa);
                const recompensaEntity = await recompensaRepository.findOne({ where: { id_recompensa: canje.recompensa } });
                if (!recompensaEntity) throw new Error("Recompensa no encontrada");
                existingCanje.recompensa = recompensaEntity;
            }

            await this.canjeRepository.save(existingCanje);
            return true;
        } catch (error) {
            console.error("Error updating canje:", error);
            throw new Error("Failed to update canje");
        }
    }

    async deleteCanje(id: number): Promise<boolean> {
        try {
            const existingCanje = await this.canjeRepository.findOne({ where: { id_canje: id } });
            if (!existingCanje) return false;
            await this.canjeRepository.remove(existingCanje);
            return true;
        } catch (error) {
            console.error("Error deleting canje:", error);
            throw new Error("Failed to delete canje");
        }
    }

    async getCanjeById(id: number): Promise<CanjeDomain | null> {
        try {
            const canje = await this.canjeRepository.findOne({
                where: { id_canje: id },
                relations: ["paciente", "recompensa"]
            });
            return canje ? this.toDomain(canje) : null;
        } catch (error) {
            console.error("Error fetching canje by ID:", error);
            throw new Error("Failed to fetch canje by ID");
        }
    }

    async getAllCanjes(): Promise<CanjeDomain[]> {
        try {
            const canjes = await this.canjeRepository.find({ relations: ["paciente", "recompensa"] });
            return canjes.map(canje => this.toDomain(canje));
        } catch (error) {
            console.error("Error fetching all canjes:", error);
            throw new Error("Failed to fetch all canjes");
        }
    }

    async getCanjesByPaciente(paciente: number): Promise<CanjeDomain[]> {
        try {
            const canjes = await this.canjeRepository.find({
                where: { paciente: { id_paciente: paciente } },
                relations: ["paciente", "recompensa"]
            });
            return canjes.map(canje => this.toDomain(canje));
        } catch (error) {
            console.error("Error fetching canjes by paciente:", error);
            throw new Error("Failed to fetch canjes by paciente");
        }
    }

    async getCanjesByEstado(estado: string): Promise<CanjeDomain[]> {
        try {
            const canjes = await this.canjeRepository.find({
                where: { estado },
                relations: ["paciente", "recompensa"]
            });
            return canjes.map(canje => this.toDomain(canje));
        } catch (error) {
            console.error("Error fetching canjes by estado:", error);
            throw new Error("Failed to fetch canjes by estado");
        }
    }

    async getCanjesPorFecha(fechaInicio: Date, fechaFin: Date): Promise<CanjeDomain[]> {
        try {
            const canjes = await this.canjeRepository.find({
                where: { fecha_canje: Between(fechaInicio, fechaFin) },
                relations: ["paciente", "recompensa"]
            });
            return canjes.map(canje => this.toDomain(canje));
        } catch (error) {
            console.error("Error fetching canjes by fecha:", error);
            throw new Error("Failed to fetch canjes by fecha");
        }
    }

    async getCanjesPorPuntos(puntosMin: number, puntosMax: number): Promise<CanjeDomain[]> {
        try {
            const canjes = await this.canjeRepository.find({
                where: { puntos_utilizados: Between(puntosMin, puntosMax) },
                relations: ["paciente", "recompensa"]
            });
            return canjes.map(canje => this.toDomain(canje));
        } catch (error) {
            console.error("Error fetching canjes by puntos:", error);
            throw new Error("Failed to fetch canjes by puntos");
        }
    }
}
