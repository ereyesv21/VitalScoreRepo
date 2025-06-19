import { PlanesPort } from "../../domain/PlanesPort";
import { Plan as PlanEntity } from "../entities/Planes";
import { Planes as PlanDomain } from "../../domain/Planes";
import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-base";
import { Paciente } from "../entities/Pacientes";
import { Medico } from "../entities/Medico";

export class PlanesAdapter implements PlanesPort {

    private planRepository: Repository<PlanEntity>;

    constructor() {
        this.planRepository = AppDataSource.getRepository(PlanEntity);
    }

    // Transforma la entidad de infraestructura al modelo de dominio
    private toDomain(planEntity: PlanEntity): PlanDomain {
        return {
            id_plan: planEntity.id_plan,
            descripcion: planEntity.descripcion,
            fecha_inicio: planEntity.fecha_inicio,
            fecha_fin: planEntity.fecha_fin,
            estado: planEntity.estado,
            paciente: planEntity.paciente ? planEntity.paciente.id_paciente : 0,
            medico: planEntity.medico ? planEntity.medico.id_medico : 0
        };
    }

    // Transforma el modelo de dominio a la entidad de infraestructura
    private toEntity(planDomain: Omit<PlanDomain, "id_plan">, pacienteEntity: Paciente, medicoEntity: Medico): Omit<PlanEntity, "id_plan"> {
        const planEntity = new PlanEntity();
        planEntity.descripcion = planDomain.descripcion;
        planEntity.fecha_inicio = planDomain.fecha_inicio;
        planEntity.fecha_fin = planDomain.fecha_fin;
        planEntity.estado = planDomain.estado;
        planEntity.paciente = pacienteEntity;
        planEntity.medico = medicoEntity;
        return planEntity;
    }

    // Método para corregir la secuencia si es necesario
    private async fixSequenceIfNeeded(): Promise<void> {
        try {
            const queryRunner = this.planRepository.manager.connection.createQueryRunner();
            await queryRunner.connect();
            
            // Obtener el máximo ID actual
            const maxIdResult = await queryRunner.query(
                'SELECT COALESCE(MAX(id_plan), 0) as max_id FROM "vitalscore"."Planes"'
            );
            const maxId = parseInt(maxIdResult[0]?.max_id || '0');
            
            // Corregir la secuencia
            await queryRunner.query(
                `SELECT setval('"vitalscore"."Planes_id_plan_seq"', ${maxId + 1}, false)`
            );
            
            await queryRunner.release();
        } catch (error) {
            console.warn("No se pudo corregir la secuencia automáticamente:", error);
        }
    }

    async createPlan(plan: Omit<PlanDomain, "id_plan">): Promise<number> {
        try {
            // Intentar corregir la secuencia antes de crear
            await this.fixSequenceIfNeeded();

            // Busca el objeto Paciente por id
            const pacienteRepository = this.planRepository.manager.getRepository(Paciente);
            const pacienteEntity = await pacienteRepository.findOne({ where: { id_paciente: plan.paciente } });
            if (!pacienteEntity) throw new Error("Paciente no encontrado");

            // Busca el objeto Medico por id
            const medicoRepository = this.planRepository.manager.getRepository(Medico);
            const medicoEntity = await medicoRepository.findOne({ where: { id_medico: plan.medico } });
            if (!medicoEntity) throw new Error("Médico no encontrado");

            // Crea el planEntity y asigna los objetos relacionados
            const planEntity = this.toEntity(plan, pacienteEntity, medicoEntity) as PlanEntity;

            const newPlan = await this.planRepository.save(planEntity);
            return newPlan.id_plan;
        } catch (error) {
            console.error("Error creating plan:", error);
            throw new Error("Failed to create plan");
        }
    }

    async updatePlan(id: number, plan: Partial<PlanDomain>): Promise<boolean> {
        try {
            const existingPlan = await this.planRepository.findOne({ where: { id_plan: id }, relations: ["paciente", "medico"] });
            if (!existingPlan) return false;

            // Actualizar solo los campos enviados
            if (plan.descripcion !== undefined) existingPlan.descripcion = plan.descripcion;
            if (plan.fecha_inicio !== undefined) existingPlan.fecha_inicio = plan.fecha_inicio;
            if (plan.fecha_fin !== undefined) existingPlan.fecha_fin = plan.fecha_fin;
            if (plan.estado !== undefined) existingPlan.estado = plan.estado;

            // Si se actualiza el paciente, buscar la nueva entidad
            if (plan.paciente) {
                const pacienteRepository = this.planRepository.manager.getRepository(Paciente);
                const pacienteEntity = await pacienteRepository.findOne({ where: { id_paciente: plan.paciente } });
                if (!pacienteEntity) throw new Error("Paciente no encontrado");
                existingPlan.paciente = pacienteEntity;
            }

            // Si se actualiza el médico, buscar la nueva entidad
            if (plan.medico) {
                const medicoRepository = this.planRepository.manager.getRepository(Medico);
                const medicoEntity = await medicoRepository.findOne({ where: { id_medico: plan.medico } });
                if (!medicoEntity) throw new Error("Médico no encontrado");
                existingPlan.medico = medicoEntity;
            }

            await this.planRepository.save(existingPlan);
            return true;
        } catch (error) {
            console.error("Error updating plan:", error);
            throw new Error("Failed to update plan");
        }
    }

    async deletePlan(id: number): Promise<boolean> {
        try {
            const existingPlan = await this.planRepository.findOne({ where: { id_plan: id } });
            if (!existingPlan) return false;
            
            // Eliminar físicamente el registro (soft delete no aplica aquí)
            await this.planRepository.remove(existingPlan);
            return true;
        } catch (error) {
            console.error("Error deleting plan:", error);
            throw new Error("Failed to delete plan");
        }
    }

    async getPlanById(id: number): Promise<PlanDomain | null> {
        try {
            const plan = await this.planRepository.findOne({ 
                where: { id_plan: id }, 
                relations: ["paciente", "medico"] 
            });
            return plan ? this.toDomain(plan) : null;
        } catch (error) {
            console.error("Error fetching plan by ID:", error);
            throw new Error("Failed to fetch plan by ID");
        }
    }

    async getAllPlanes(): Promise<PlanDomain[]> {
        try {
            const planes = await this.planRepository.find({ relations: ["paciente", "medico"] });
            return planes.map(plan => this.toDomain(plan));
        } catch (error) {
            console.error("Error fetching all planes:", error);
            throw new Error("Failed to fetch all planes");
        }
    }

    async getPlanesByPaciente(paciente: number): Promise<PlanDomain[]> {
        try {
            const planes = await this.planRepository.find({ 
                where: { paciente: { id_paciente: paciente } }, 
                relations: ["paciente", "medico"] 
            });
            return planes.map(plan => this.toDomain(plan));
        } catch (error) {
            console.error("Error fetching planes by paciente:", error);
            throw new Error("Failed to fetch planes by paciente");
        }
    }

    async getPlanesByMedico(medico: number): Promise<PlanDomain[]> {
        try {
            const planes = await this.planRepository.find({ 
                where: { medico: { id_medico: medico } }, 
                relations: ["paciente", "medico"] 
            });
            return planes.map(plan => this.toDomain(plan));
        } catch (error) {
            console.error("Error fetching planes by medico:", error);
            throw new Error("Failed to fetch planes by medico");
        }
    }

    async getPlanesByEstado(estado: string): Promise<PlanDomain[]> {
        try {
            const planes = await this.planRepository.find({ 
                where: { estado: estado }, 
                relations: ["paciente", "medico"] 
            });
            return planes.map(plan => this.toDomain(plan));
        } catch (error) {
            console.error("Error fetching planes by estado:", error);
            throw new Error("Failed to fetch planes by estado");
        }
    }

    async getPlanesActivos(): Promise<PlanDomain[]> {
        try {
            const planes = await this.planRepository.find({ 
                where: { estado: "activo" }, 
                relations: ["paciente", "medico"] 
            });
            return planes.map(plan => this.toDomain(plan));
        } catch (error) {
            console.error("Error fetching planes activos:", error);
            throw new Error("Failed to fetch planes activos");
        }
    }

    async getPlanesPorFecha(fechaInicio: Date, fechaFin: Date): Promise<PlanDomain[]> {
        try {
            const planes = await this.planRepository.find({ 
                where: { 
                    fecha_inicio: fechaInicio,
                    fecha_fin: fechaFin
                }, 
                relations: ["paciente", "medico"] 
            });
            return planes.map(plan => this.toDomain(plan));
        } catch (error) {
            console.error("Error fetching planes por fecha:", error);
            throw new Error("Failed to fetch planes por fecha");
        }
    }
}
