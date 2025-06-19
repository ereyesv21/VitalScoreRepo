import { PacientMedicosPort } from "../../domain/PacientMedicosPort";
import { Pacientes_Medicos as PacientMedicoEntity } from "../entities/PacientMedicos";
import { Pacientes_Medicos as PacientMedicoDomain } from "../../domain/PacientMedicos";
import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-base";
import { Paciente } from "../entities/Pacientes";
import { Medico } from "../entities/Medico";

export class PacientMedicosAdapter implements PacientMedicosPort {
    private relacionRepository: Repository<PacientMedicoEntity>;

    constructor() {
        this.relacionRepository = AppDataSource.getRepository(PacientMedicoEntity);
    }

    // Transforma la entidad de infraestructura al modelo de dominio
    private toDomain(entity: PacientMedicoEntity): PacientMedicoDomain {
        return {
            id: entity.id,
            Paciente: entity.paciente ? entity.paciente.id_paciente : 0,
            Medico: entity.medico ? entity.medico.id_medico : 0,
            fecha_asignacion: entity.fecha_asignacion
        };
    }

    // Transforma el modelo de dominio a la entidad de infraestructura
    private async toEntity(domain: Omit<PacientMedicoDomain, "id">): Promise<Omit<PacientMedicoEntity, "id">> {
        const entity = new PacientMedicoEntity();
        const pacienteRepo = this.relacionRepository.manager.getRepository(Paciente);
        const medicoRepo = this.relacionRepository.manager.getRepository(Medico);

        const pacienteEntity = await pacienteRepo.findOne({ where: { id_paciente: domain.Paciente } });
        if (!pacienteEntity) throw new Error("Paciente no encontrado");

        const medicoEntity = await medicoRepo.findOne({ where: { id_medico: domain.Medico } });
        if (!medicoEntity) throw new Error("Médico no encontrado");

        entity.paciente = pacienteEntity;
        entity.medico = medicoEntity;
        entity.fecha_asignacion = domain.fecha_asignacion;
        return entity;
    }

    // Método para corregir la secuencia si es necesario
    private async fixSequenceIfNeeded(): Promise<void> {
        try {
            const queryRunner = this.relacionRepository.manager.connection.createQueryRunner();
            await queryRunner.connect();

            const maxIdResult = await queryRunner.query(
                'SELECT COALESCE(MAX(id), 0) as max_id FROM "vitalscore"."Pacientes_Medicos"'
            );
            const maxId = parseInt(maxIdResult[0]?.max_id || '0');

            await queryRunner.query(
                `SELECT setval('"vitalscore"."Pacientes_Medicos_id_seq"', ${maxId + 1}, false)`
            );

            await queryRunner.release();
        } catch (error) {
            console.warn("No se pudo corregir la secuencia automáticamente:", error);
        }
    }

    async createRelacion(relacion: Omit<PacientMedicoDomain, "id">): Promise<number> {
        try {
            await this.fixSequenceIfNeeded();
            const entity = await this.toEntity(relacion) as PacientMedicoEntity;
            const nuevaRelacion = await this.relacionRepository.save(entity);
            return nuevaRelacion.id;
        } catch (error) {
            console.error("Error creating relacion:", error);
            throw new Error("Failed to create relacion");
        }
    }

    async updateRelacion(id: number, relacion: Partial<PacientMedicoDomain>): Promise<boolean> {
        try {
            const existing = await this.relacionRepository.findOne({ where: { id }, relations: ["paciente", "medico"] });
            if (!existing) return false;

            if (relacion.Paciente) {
                const pacienteRepo = this.relacionRepository.manager.getRepository(Paciente);
                const pacienteEntity = await pacienteRepo.findOne({ where: { id_paciente: relacion.Paciente } });
                if (!pacienteEntity) throw new Error("Paciente no encontrado");
                existing.paciente = pacienteEntity;
            }
            if (relacion.Medico) {
                const medicoRepo = this.relacionRepository.manager.getRepository(Medico);
                const medicoEntity = await medicoRepo.findOne({ where: { id_medico: relacion.Medico } });
                if (!medicoEntity) throw new Error("Médico no encontrado");
                existing.medico = medicoEntity;
            }
            if (relacion.fecha_asignacion !== undefined) existing.fecha_asignacion = relacion.fecha_asignacion;

            await this.relacionRepository.save(existing);
            return true;
        } catch (error) {
            console.error("Error updating relacion:", error);
            throw new Error("Failed to update relacion");
        }
    }

    async deleteRelacion(id: number): Promise<boolean> {
        try {
            const existing = await this.relacionRepository.findOne({ where: { id } });
            if (!existing) return false;
            await this.relacionRepository.remove(existing);
            return true;
        } catch (error) {
            console.error("Error deleting relacion:", error);
            throw new Error("Failed to delete relacion");
        }
    }

    async getRelacionById(id: number): Promise<PacientMedicoDomain | null> {
        try {
            const entity = await this.relacionRepository.findOne({ where: { id }, relations: ["paciente", "medico"] });
            return entity ? this.toDomain(entity) : null;
        } catch (error) {
            console.error("Error fetching relacion by ID:", error);
            throw new Error("Failed to fetch relacion by ID");
        }
    }

    async getAllRelaciones(): Promise<PacientMedicoDomain[]> {
        try {
            const entities = await this.relacionRepository.find({ relations: ["paciente", "medico"] });
            return entities.map(e => this.toDomain(e));
        } catch (error) {
            console.error("Error fetching all relaciones:", error);
            throw new Error("Failed to fetch all relaciones");
        }
    }

    async getRelacionesByPaciente(paciente: number): Promise<PacientMedicoDomain[]> {
        try {
            const entities = await this.relacionRepository.find({
                where: { paciente: { id_paciente: paciente } },
                relations: ["paciente", "medico"]
            });
            return entities.map(e => this.toDomain(e));
        } catch (error) {
            console.error("Error fetching relaciones by paciente:", error);
            throw new Error("Failed to fetch relaciones by paciente");
        }
    }

    async getRelacionesByMedico(medico: number): Promise<PacientMedicoDomain[]> {
        try {
            const entities = await this.relacionRepository.find({
                where: { medico: { id_medico: medico } },
                relations: ["paciente", "medico"]
            });
            return entities.map(e => this.toDomain(e));
        } catch (error) {
            console.error("Error fetching relaciones by medico:", error);
            throw new Error("Failed to fetch relaciones by medico");
        }
    }

    async getRelacionesPorFecha(fechaInicio: Date, fechaFin: Date): Promise<PacientMedicoDomain[]> {
        try {
            const entities = await this.relacionRepository
                .createQueryBuilder("relacion")
                .leftJoinAndSelect("relacion.paciente", "paciente")
                .leftJoinAndSelect("relacion.medico", "medico")
                .where("relacion.fecha_asignacion >= :fechaInicio AND relacion.fecha_asignacion <= :fechaFin", { fechaInicio, fechaFin })
                .getMany();
            return entities.map(e => this.toDomain(e));
        } catch (error) {
            console.error("Error fetching relaciones por fecha:", error);
            throw new Error("Failed to fetch relaciones por fecha");
        }
    }
}
