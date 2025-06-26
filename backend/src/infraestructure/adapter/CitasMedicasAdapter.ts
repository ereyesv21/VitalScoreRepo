import { CitasMedicasPort } from "../../domain/CitasMedicasPort";
import { CitaMedica as CitaMedicaEntity } from "../entities/CitasMedicas";
import { CitasMedicas as CitaMedicaDomain } from "../../domain/CitasMedicas";
import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-base";
import { Paciente } from "../entities/Pacientes";
import { Medico } from "../entities/Medico";
import { Especialidades } from "../entities/Especialidades";

export class CitasMedicasAdapter implements CitasMedicasPort {

    private citaMedicaRepository: Repository<CitaMedicaEntity>;

    constructor() {
        this.citaMedicaRepository = AppDataSource.getRepository(CitaMedicaEntity);
    }

    // Transforma la entidad de infraestructura al modelo de dominio
    private toDomain(citaMedicaEntity: CitaMedicaEntity): any {
        return {
            id_cita: citaMedicaEntity.id_cita,
            paciente: citaMedicaEntity.paciente ? citaMedicaEntity.paciente.id_paciente : 0,
            medico: citaMedicaEntity.medico ? citaMedicaEntity.medico.id_medico : 0,
            fecha_cita: citaMedicaEntity.fecha_cita,
            hora_inicio: citaMedicaEntity.hora_inicio,
            hora_fin: citaMedicaEntity.hora_fin,
            estado: citaMedicaEntity.estado,
            motivo_consulta: citaMedicaEntity.motivo_consulta,
            observaciones: citaMedicaEntity.observaciones,
            fecha_creacion: citaMedicaEntity.fecha_creacion,
            fecha_modificacion: citaMedicaEntity.fecha_modificacion,
            cancelado_por: citaMedicaEntity.cancelado_por,
            motivo_cancelacion: citaMedicaEntity.motivo_cancelacion,
            paciente_data: citaMedicaEntity.paciente && citaMedicaEntity.paciente.usuario ? {
                id_paciente: citaMedicaEntity.paciente.id_paciente,
                nombre: citaMedicaEntity.paciente.usuario.nombre,
                apellido: citaMedicaEntity.paciente.usuario.apellido,
                correo: citaMedicaEntity.paciente.usuario.correo
            } : null
        };
    }

    // Transforma el modelo de dominio a la entidad de infraestructura
    private toEntity(citaMedicaDomain: Omit<CitaMedicaDomain, "id_cita" | "fecha_creacion" | "fecha_modificacion">, pacienteEntity: Paciente, medicoEntity: Medico): Omit<CitaMedicaEntity, "id_cita" | "fecha_creacion" | "fecha_modificacion"> {
        const citaMedicaEntity = new CitaMedicaEntity();
        citaMedicaEntity.paciente = pacienteEntity;
        citaMedicaEntity.medico = medicoEntity;
        citaMedicaEntity.fecha_cita = citaMedicaDomain.fecha_cita;
        citaMedicaEntity.hora_inicio = citaMedicaDomain.hora_inicio;
        citaMedicaEntity.hora_fin = citaMedicaDomain.hora_fin;
        citaMedicaEntity.estado = citaMedicaDomain.estado;
        citaMedicaEntity.motivo_consulta = citaMedicaDomain.motivo_consulta;
        citaMedicaEntity.observaciones = citaMedicaDomain.observaciones;
        citaMedicaEntity.cancelado_por = citaMedicaDomain.cancelado_por;
        citaMedicaEntity.motivo_cancelacion = citaMedicaDomain.motivo_cancelacion;
        return citaMedicaEntity;
    }

    // Método para corregir la secuencia si es necesario
    private async fixSequenceIfNeeded(): Promise<void> {
        try {
            const queryRunner = this.citaMedicaRepository.manager.connection.createQueryRunner();
            await queryRunner.connect();
            
            // Obtener el máximo ID actual
            const maxIdResult = await queryRunner.query(
                'SELECT COALESCE(MAX(id_cita), 0) as max_id FROM "vitalscore"."Citas_Medicas"'
            );
            const maxId = parseInt(maxIdResult[0]?.max_id || '0');
            
            // Corregir la secuencia
            await queryRunner.query(
                `SELECT setval('"vitalscore"."Citas_Medicas_id_cita_seq"', ${maxId + 1}, false)`
            );
            
            await queryRunner.release();
        } catch (error) {
            console.warn("No se pudo corregir la secuencia automáticamente:", error);
        }
    }

    async createCitaMedica(cita: Omit<CitaMedicaDomain, "id_cita" | "fecha_creacion" | "fecha_modificacion">): Promise<number> {
        try {
            // Intentar corregir la secuencia antes de crear
            await this.fixSequenceIfNeeded();

            // Busca el objeto Paciente por id
            const pacienteRepository = this.citaMedicaRepository.manager.getRepository(Paciente);
            const pacienteEntity = await pacienteRepository.findOne({ where: { id_paciente: cita.paciente } });
            if (!pacienteEntity) throw new Error("Paciente no encontrado");

            // Busca el objeto Medico por id
            const medicoRepository = this.citaMedicaRepository.manager.getRepository(Medico);
            const medicoEntity = await medicoRepository.findOne({ where: { id_medico: cita.medico } });
            if (!medicoEntity) throw new Error("Médico no encontrado");

            // Crea la citaMedicaEntity y asigna los objetos relacionados
            const citaMedicaEntity = this.toEntity(cita, pacienteEntity, medicoEntity) as CitaMedicaEntity;

            const newCitaMedica = await this.citaMedicaRepository.save(citaMedicaEntity);
            return newCitaMedica.id_cita;
        } catch (error) {
            console.error("Error creating cita médica:", error);
            throw new Error("Failed to create cita médica");
        }
    }

    async updateCitaMedica(id: number, cita: Partial<CitaMedicaDomain>): Promise<boolean> {
        try {
            const existingCita = await this.citaMedicaRepository.findOne({ 
                where: { id_cita: id }, 
                relations: ["paciente", "medico"] 
            });
            if (!existingCita) return false;

            // Actualizar solo los campos enviados
            if (cita.fecha_cita !== undefined) existingCita.fecha_cita = cita.fecha_cita;
            if (cita.hora_inicio !== undefined) existingCita.hora_inicio = cita.hora_inicio;
            if (cita.hora_fin !== undefined) existingCita.hora_fin = cita.hora_fin;
            if (cita.estado !== undefined) existingCita.estado = cita.estado;
            if (cita.motivo_consulta !== undefined) existingCita.motivo_consulta = cita.motivo_consulta;
            if (cita.observaciones !== undefined) existingCita.observaciones = cita.observaciones;
            if (cita.cancelado_por !== undefined) existingCita.cancelado_por = cita.cancelado_por;
            if (cita.motivo_cancelacion !== undefined) existingCita.motivo_cancelacion = cita.motivo_cancelacion;

            // Si se actualiza el paciente, buscar la nueva entidad
            if (cita.paciente) {
                const pacienteRepository = this.citaMedicaRepository.manager.getRepository(Paciente);
                const pacienteEntity = await pacienteRepository.findOne({ where: { id_paciente: cita.paciente } });
                if (!pacienteEntity) throw new Error("Paciente no encontrado");
                existingCita.paciente = pacienteEntity;
            }

            // Si se actualiza el médico, buscar la nueva entidad
            if (cita.medico) {
                const medicoRepository = this.citaMedicaRepository.manager.getRepository(Medico);
                const medicoEntity = await medicoRepository.findOne({ where: { id_medico: cita.medico } });
                if (!medicoEntity) throw new Error("Médico no encontrado");
                existingCita.medico = medicoEntity;
            }

            await this.citaMedicaRepository.save(existingCita);
            return true;
        } catch (error) {
            console.error("Error updating cita médica:", error);
            throw new Error("Failed to update cita médica");
        }
    }

    async deleteCitaMedica(id: number): Promise<boolean> {
        try {
            const existingCita = await this.citaMedicaRepository.findOne({ where: { id_cita: id } });
            if (!existingCita) return false;
            
            await this.citaMedicaRepository.remove(existingCita);
            return true;
        } catch (error) {
            console.error("Error deleting cita médica:", error);
            throw new Error("Failed to delete cita médica");
        }
    }

    async getCitaMedicaById(id: number): Promise<CitaMedicaDomain | null> {
        try {
            const cita = await this.citaMedicaRepository.findOne({ 
                where: { id_cita: id }, 
                relations: ["paciente", "medico"] 
            });
            return cita ? this.toDomain(cita) : null;
        } catch (error) {
            console.error("Error fetching cita médica by ID:", error);
            throw new Error("Failed to fetch cita médica by ID");
        }
    }

    async getAllCitasMedicas(): Promise<CitaMedicaDomain[]> {
        try {
            const citas = await this.citaMedicaRepository.find({ relations: ["paciente", "medico"] });
            return citas.map(cita => this.toDomain(cita));
        } catch (error) {
            console.error("Error fetching all citas médicas:", error);
            throw new Error("Failed to fetch all citas médicas");
        }
    }

    async getCitasMedicasByPaciente(paciente: number): Promise<any[]> {
        try {
            const citas = await this.citaMedicaRepository.find({ 
                where: { paciente: { id_paciente: paciente } }, 
                relations: ["paciente", "medico", "medico.usuario", "medico.id_especialidad"],
                order: { fecha_cita: 'ASC', hora_inicio: 'ASC' }
            });
            // Filtrar las canceladas por paciente
            return citas
                .filter(cita => !(cita.estado === 'cancelada' && cita.cancelado_por === 'paciente'))
                .map(cita => this.toDomainWithMedicoData(cita));
        } catch (error) {
            console.error("Error fetching citas médicas by paciente:", error);
            throw new Error("Failed to fetch citas médicas by paciente");
        }
    }

    async getCitasMedicasByMedico(medico: number): Promise<any[]> {
        try {
            const citas = await this.citaMedicaRepository.find({ 
                where: { medico: { id_medico: medico } }, 
                relations: ["paciente", "paciente.usuario", "medico"],
                order: { fecha_cita: 'ASC', hora_inicio: 'ASC' }
            });
            // Filtrar las canceladas por paciente
            return citas
                .filter(cita => !(cita.estado === 'cancelada' && cita.cancelado_por === 'paciente'))
                .map(cita => this.toDomain(cita));
        } catch (error) {
            console.error("Error fetching citas médicas by médico:", error);
            throw new Error("Failed to fetch citas médicas by médico");
        }
    }

    async getCitasMedicasByEstado(estado: CitaMedicaDomain['estado']): Promise<CitaMedicaDomain[]> {
        try {
            const citas = await this.citaMedicaRepository.find({ 
                where: { estado: estado }, 
                relations: ["paciente", "medico"],
                order: { fecha_cita: 'ASC', hora_inicio: 'ASC' }
            });
            return citas.map(cita => this.toDomain(cita));
        } catch (error) {
            console.error("Error fetching citas médicas by estado:", error);
            throw new Error("Failed to fetch citas médicas by estado");
        }
    }

    async getCitasMedicasByFecha(fecha: Date): Promise<CitaMedicaDomain[]> {
        try {
            const citas = await this.citaMedicaRepository.find({ 
                where: { fecha_cita: fecha }, 
                relations: ["paciente", "medico"],
                order: { hora_inicio: 'ASC' }
            });
            return citas.map(cita => this.toDomain(cita));
        } catch (error) {
            console.error("Error fetching citas médicas by fecha:", error);
            throw new Error("Failed to fetch citas médicas by fecha");
        }
    }

    async getCitasMedicasByMedicoAndFecha(medico: number, fecha: Date): Promise<CitaMedicaDomain[]> {
        try {
            // Convertir la fecha a string YYYY-MM-DD
            const fechaStr = fecha instanceof Date ? fecha.toISOString().split('T')[0] : String(fecha);
            const citas = await this.citaMedicaRepository.createQueryBuilder('cita')
                .leftJoinAndSelect('cita.paciente', 'paciente')
                .leftJoinAndSelect('cita.medico', 'medico')
                .where('cita.medico = :medicoId', { medicoId: medico })
                .andWhere('DATE(cita.fecha_cita) = :fecha', { fecha: fechaStr })
                .orderBy('cita.hora_inicio', 'ASC')
                .getMany();
            // Filtrar las canceladas por paciente
            return citas
                .filter(cita => !(cita.estado === 'cancelada' && cita.cancelado_por === 'paciente'))
                .map(cita => this.toDomain(cita));
        } catch (error) {
            console.error("Error fetching citas médicas by médico and fecha:", error);
            throw new Error("Failed to fetch citas médicas by médico and fecha");
        }
    }

    async getCitasMedicasByPacienteAndFecha(paciente: number, fecha: Date): Promise<CitaMedicaDomain[]> {
        try {
            const citas = await this.citaMedicaRepository.find({ 
                where: { 
                    paciente: { id_paciente: paciente },
                    fecha_cita: fecha 
                }, 
                relations: ["paciente", "medico"],
                order: { hora_inicio: 'ASC' }
            });
            return citas.map(cita => this.toDomain(cita));
        } catch (error) {
            console.error("Error fetching citas médicas by paciente and fecha:", error);
            throw new Error("Failed to fetch citas médicas by paciente and fecha");
        }
    }

    async getCitasMedicasProximas(dias: number): Promise<CitaMedicaDomain[]> {
        try {
            const fechaInicio = new Date();
            const fechaFin = new Date();
            fechaFin.setDate(fechaFin.getDate() + dias);

            const citas = await this.citaMedicaRepository.find({ 
                where: { 
                    fecha_cita: Between(fechaInicio, fechaFin),
                    estado: In(['programada', 'confirmada'])
                }, 
                relations: ["paciente", "medico"],
                order: { fecha_cita: 'ASC', hora_inicio: 'ASC' }
            });
            return citas.map(cita => this.toDomain(cita));
        } catch (error) {
            console.error("Error fetching citas médicas próximas:", error);
            throw new Error("Failed to fetch citas médicas próximas");
        }
    }

    async getCitasMedicasVencidas(): Promise<CitaMedicaDomain[]> {
        try {
            const fechaActual = new Date();
            fechaActual.setHours(0, 0, 0, 0);

            const citas = await this.citaMedicaRepository.find({ 
                where: { 
                    fecha_cita: LessThan(fechaActual),
                    estado: In(['programada', 'confirmada'])
                }, 
                relations: ["paciente", "medico"],
                order: { fecha_cita: 'DESC', hora_inicio: 'DESC' }
            });
            return citas.map(cita => this.toDomain(cita));
        } catch (error) {
            console.error("Error fetching citas médicas vencidas:", error);
            throw new Error("Failed to fetch citas médicas vencidas");
        }
    }

    private toDomainWithMedicoData(citaMedicaEntity: CitaMedicaEntity): any {
        return {
            id_cita: citaMedicaEntity.id_cita,
            paciente: citaMedicaEntity.paciente ? citaMedicaEntity.paciente.id_paciente : 0,
            medico: citaMedicaEntity.medico ? citaMedicaEntity.medico.id_medico : 0,
            fecha_cita: citaMedicaEntity.fecha_cita,
            hora_inicio: citaMedicaEntity.hora_inicio,
            hora_fin: citaMedicaEntity.hora_fin,
            estado: citaMedicaEntity.estado,
            motivo_consulta: citaMedicaEntity.motivo_consulta,
            observaciones: citaMedicaEntity.observaciones,
            fecha_creacion: citaMedicaEntity.fecha_creacion,
            fecha_modificacion: citaMedicaEntity.fecha_modificacion,
            cancelado_por: citaMedicaEntity.cancelado_por,
            motivo_cancelacion: citaMedicaEntity.motivo_cancelacion,
            medico_data: citaMedicaEntity.medico && citaMedicaEntity.medico.usuario ? {
                id_medico: citaMedicaEntity.medico.id_medico,
                nombre: citaMedicaEntity.medico.usuario.nombre,
                apellido: citaMedicaEntity.medico.usuario.apellido,
                especialidad: citaMedicaEntity.medico.id_especialidad && citaMedicaEntity.medico.id_especialidad.nombre
                    ? citaMedicaEntity.medico.id_especialidad.nombre
                    : null
            } : null
        };
    }
}

// Importar los operadores de TypeORM necesarios
import { Between, In, LessThan } from "typeorm"; 