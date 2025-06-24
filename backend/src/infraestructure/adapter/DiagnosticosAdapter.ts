import { DiagnosticosPort } from "../../domain/DiagnosticosPort";
import { Diagnostico as DiagnosticoEntity } from "../entities/Diagnosticos";
import { Diagnosticos as DiagnosticoDomain } from "../../domain/Diagnosticos";
import { Repository, Between, In, LessThan } from "typeorm";
import { AppDataSource } from "../config/data-base";
import { Paciente } from "../entities/Pacientes";
import { Medico } from "../entities/Medico";
import { CitaMedica } from "../entities/CitasMedicas";

export class DiagnosticosAdapter implements DiagnosticosPort {
    private diagnosticoRepository: Repository<DiagnosticoEntity>;

    constructor() {
        this.diagnosticoRepository = AppDataSource.getRepository(DiagnosticoEntity);
    }

    private toDomain(entity: DiagnosticoEntity): DiagnosticoDomain {
        return {
            id_diagnostico: entity.id_diagnostico,
            paciente: entity.paciente ? entity.paciente.id_paciente : 0,
            medico: entity.medico ? entity.medico.id_medico : 0,
            cita: entity.cita ? entity.cita.id_cita : null,
            enfermedad: entity.enfermedad ?? null,
            diagnostico: entity.diagnostico,
            observaciones: entity.observaciones,
            fecha_diagnostico: entity.fecha_diagnostico,
            estado: entity.estado,
            fecha_creacion: entity.fecha_creacion
        };
    }

    private toEntity(domain: Omit<DiagnosticoDomain, "id_diagnostico" | "fecha_creacion">, pacienteEntity: Paciente, medicoEntity: Medico, citaEntity: CitaMedica | null): Omit<DiagnosticoEntity, "id_diagnostico" | "fecha_creacion"> {
        const entity = new DiagnosticoEntity();
        entity.paciente = pacienteEntity;
        entity.medico = medicoEntity;
        entity.cita = citaEntity;
        entity.enfermedad = domain.enfermedad ?? null;
        entity.diagnostico = domain.diagnostico;
        entity.observaciones = domain.observaciones;
        entity.fecha_diagnostico = domain.fecha_diagnostico;
        entity.estado = domain.estado;
        return entity;
    }

    private async fixSequenceIfNeeded(): Promise<void> {
        try {
            const queryRunner = this.diagnosticoRepository.manager.connection.createQueryRunner();
            await queryRunner.connect();
            const maxIdResult = await queryRunner.query(
                'SELECT COALESCE(MAX(id_diagnostico), 0) as max_id FROM "vitalscore"."Diagnosticos"'
            );
            const maxId = parseInt(maxIdResult[0]?.max_id || '0');
            await queryRunner.query(
                `SELECT setval('"vitalscore"."Diagnosticos_id_diagnostico_seq"', ${maxId + 1}, false)`
            );
            await queryRunner.release();
        } catch (error) {
            console.warn("No se pudo corregir la secuencia automáticamente:", error);
        }
    }

    async createDiagnostico(diagnostico: Omit<DiagnosticoDomain, "id_diagnostico" | "fecha_creacion">): Promise<number> {
        try {
            await this.fixSequenceIfNeeded();
            const pacienteRepository = this.diagnosticoRepository.manager.getRepository(Paciente);
            const pacienteEntity = await pacienteRepository.findOne({ where: { id_paciente: diagnostico.paciente } });
            if (!pacienteEntity) throw new Error("Paciente no encontrado");
            const medicoRepository = this.diagnosticoRepository.manager.getRepository(Medico);
            const medicoEntity = await medicoRepository.findOne({ where: { id_medico: diagnostico.medico } });
            if (!medicoEntity) throw new Error("Médico no encontrado");
            let citaEntity: CitaMedica | null = null;
            if (diagnostico.cita) {
                const citaRepository = this.diagnosticoRepository.manager.getRepository(CitaMedica);
                citaEntity = await citaRepository.findOne({ where: { id_cita: diagnostico.cita } });
                if (!citaEntity) throw new Error("Cita médica no encontrada");
            }
            const entity = this.toEntity(diagnostico, pacienteEntity, medicoEntity, citaEntity) as DiagnosticoEntity;
            const newDiagnostico = await this.diagnosticoRepository.save(entity);
            return newDiagnostico.id_diagnostico;
        } catch (error) {
            console.error("Error creating diagnóstico:", error);
            throw new Error("Failed to create diagnóstico");
        }
    }

    async updateDiagnostico(id: number, diagnostico: Partial<DiagnosticoDomain>): Promise<boolean> {
        try {
            const existing = await this.diagnosticoRepository.findOne({ where: { id_diagnostico: id }, relations: ["paciente", "medico", "cita"] });
            if (!existing) return false;
            if (diagnostico.diagnostico !== undefined) existing.diagnostico = diagnostico.diagnostico;
            if (diagnostico.observaciones !== undefined) existing.observaciones = diagnostico.observaciones;
            if (diagnostico.fecha_diagnostico !== undefined) existing.fecha_diagnostico = diagnostico.fecha_diagnostico;
            if (diagnostico.estado !== undefined) existing.estado = diagnostico.estado;
            if (diagnostico.enfermedad !== undefined) existing.enfermedad = diagnostico.enfermedad;
            if (diagnostico.paciente !== undefined) {
                const pacienteRepository = this.diagnosticoRepository.manager.getRepository(Paciente);
                const pacienteEntity = await pacienteRepository.findOne({ where: { id_paciente: diagnostico.paciente } });
                if (!pacienteEntity) throw new Error("Paciente no encontrado");
                existing.paciente = pacienteEntity;
            }
            if (diagnostico.medico !== undefined) {
                const medicoRepository = this.diagnosticoRepository.manager.getRepository(Medico);
                const medicoEntity = await medicoRepository.findOne({ where: { id_medico: diagnostico.medico } });
                if (!medicoEntity) throw new Error("Médico no encontrado");
                existing.medico = medicoEntity;
            }
            if (diagnostico.cita !== undefined) {
                if (diagnostico.cita === null) {
                    existing.cita = null;
                } else {
                    const citaRepository = this.diagnosticoRepository.manager.getRepository(CitaMedica);
                    const citaEntity = await citaRepository.findOne({ where: { id_cita: diagnostico.cita } });
                    if (!citaEntity) throw new Error("Cita médica no encontrada");
                    existing.cita = citaEntity;
                }
            }
            await this.diagnosticoRepository.save(existing);
            return true;
        } catch (error) {
            console.error("Error updating diagnóstico:", error);
            throw new Error("Failed to update diagnóstico");
        }
    }

    async deleteDiagnostico(id: number): Promise<boolean> {
        try {
            const existing = await this.diagnosticoRepository.findOne({ where: { id_diagnostico: id } });
            if (!existing) return false;
            await this.diagnosticoRepository.remove(existing);
            return true;
        } catch (error) {
            console.error("Error deleting diagnóstico:", error);
            throw new Error("Failed to delete diagnóstico");
        }
    }

    async getDiagnosticoById(id: number): Promise<DiagnosticoDomain | null> {
        try {
            const diagnostico = await this.diagnosticoRepository.findOne({ where: { id_diagnostico: id }, relations: ["paciente", "medico", "cita"] });
            return diagnostico ? this.toDomain(diagnostico) : null;
        } catch (error) {
            console.error("Error fetching diagnóstico by ID:", error);
            throw new Error("Failed to fetch diagnóstico by ID");
        }
    }

    async getAllDiagnosticos(): Promise<DiagnosticoDomain[]> {
        try {
            const diagnosticos = await this.diagnosticoRepository.find({ relations: ["paciente", "medico", "cita"] });
            return diagnosticos.map(d => this.toDomain(d));
        } catch (error) {
            console.error("Error fetching all diagnósticos:", error);
            throw new Error("Failed to fetch all diagnósticos");
        }
    }

    async getDiagnosticosByPaciente(paciente: number): Promise<DiagnosticoDomain[]> {
        try {
            const diagnosticos = await this.diagnosticoRepository.find({ where: { paciente: { id_paciente: paciente } }, relations: ["paciente", "medico", "cita"] });
            return diagnosticos.map(d => this.toDomain(d));
        } catch (error) {
            console.error("Error fetching diagnósticos by paciente:", error);
            throw new Error("Failed to fetch diagnósticos by paciente");
        }
    }

    async getDiagnosticosByMedico(medico: number): Promise<DiagnosticoDomain[]> {
        try {
            const diagnosticos = await this.diagnosticoRepository.find({ where: { medico: { id_medico: medico } }, relations: ["paciente", "medico", "cita"] });
            return diagnosticos.map(d => this.toDomain(d));
        } catch (error) {
            console.error("Error fetching diagnósticos by medico:", error);
            throw new Error("Failed to fetch diagnósticos by medico");
        }
    }

    async getDiagnosticosByCita(cita: number): Promise<DiagnosticoDomain[]> {
        try {
            const diagnosticos = await this.diagnosticoRepository.find({ where: { cita: { id_cita: cita } }, relations: ["paciente", "medico", "cita"] });
            return diagnosticos.map(d => this.toDomain(d));
        } catch (error) {
            console.error("Error fetching diagnósticos by cita:", error);
            throw new Error("Failed to fetch diagnósticos by cita");
        }
    }

    async getDiagnosticosByEnfermedad(enfermedad: number): Promise<DiagnosticoDomain[]> {
        try {
            const diagnosticos = await this.diagnosticoRepository.find({ where: { enfermedad: enfermedad }, relations: ["paciente", "medico", "cita"] });
            return diagnosticos.map(d => this.toDomain(d));
        } catch (error) {
            console.error("Error fetching diagnósticos by enfermedad:", error);
            throw new Error("Failed to fetch diagnósticos by enfermedad");
        }
    }

    async getDiagnosticosByEstado(estado: DiagnosticoDomain['estado']): Promise<DiagnosticoDomain[]> {
        try {
            const diagnosticos = await this.diagnosticoRepository.find({ where: { estado: estado }, relations: ["paciente", "medico", "cita"] });
            return diagnosticos.map(d => this.toDomain(d));
        } catch (error) {
            console.error("Error fetching diagnósticos by estado:", error);
            throw new Error("Failed to fetch diagnósticos by estado");
        }
    }

    async getDiagnosticosByFecha(fecha: Date): Promise<DiagnosticoDomain[]> {
        try {
            const diagnosticos = await this.diagnosticoRepository.find({ where: { fecha_diagnostico: fecha }, relations: ["paciente", "medico", "cita"] });
            return diagnosticos.map(d => this.toDomain(d));
        } catch (error) {
            console.error("Error fetching diagnósticos by fecha:", error);
            throw new Error("Failed to fetch diagnósticos by fecha");
        }
    }

    async getDiagnosticosByPacienteAndEstado(paciente: number, estado: DiagnosticoDomain['estado']): Promise<DiagnosticoDomain[]> {
        try {
            const diagnosticos = await this.diagnosticoRepository.find({ where: { paciente: { id_paciente: paciente }, estado: estado }, relations: ["paciente", "medico", "cita"] });
            return diagnosticos.map(d => this.toDomain(d));
        } catch (error) {
            console.error("Error fetching diagnósticos by paciente and estado:", error);
            throw new Error("Failed to fetch diagnósticos by paciente and estado");
        }
    }

    async getDiagnosticosByMedicoAndEstado(medico: number, estado: DiagnosticoDomain['estado']): Promise<DiagnosticoDomain[]> {
        try {
            const diagnosticos = await this.diagnosticoRepository.find({ where: { medico: { id_medico: medico }, estado: estado }, relations: ["paciente", "medico", "cita"] });
            return diagnosticos.map(d => this.toDomain(d));
        } catch (error) {
            console.error("Error fetching diagnósticos by medico and estado:", error);
            throw new Error("Failed to fetch diagnósticos by medico and estado");
        }
    }

    async getDiagnosticosActivos(): Promise<DiagnosticoDomain[]> {
        try {
            const diagnosticos = await this.diagnosticoRepository.find({ where: { estado: 'activo' }, relations: ["paciente", "medico", "cita"] });
            return diagnosticos.map(d => this.toDomain(d));
        } catch (error) {
            console.error("Error fetching diagnósticos activos:", error);
            throw new Error("Failed to fetch diagnósticos activos");
        }
    }

    async getDiagnosticosRecientes(dias: number): Promise<DiagnosticoDomain[]> {
        try {
            const fechaFin = new Date();
            const fechaInicio = new Date();
            fechaInicio.setDate(fechaFin.getDate() - dias);
            const diagnosticos = await this.diagnosticoRepository.find({
                where: { fecha_diagnostico: Between(fechaInicio, fechaFin) },
                relations: ["paciente", "medico", "cita"]
            });
            return diagnosticos.map(d => this.toDomain(d));
        } catch (error) {
            console.error("Error fetching diagnósticos recientes:", error);
            throw new Error("Failed to fetch diagnósticos recientes");
        }
    }
} 