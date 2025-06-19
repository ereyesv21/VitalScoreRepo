import { TareasPort } from "../../domain/TareasPort";
import { Tarea as TareaEntity } from "../entities/Tareas";
import { Tareas as TareaDomain } from "../../domain/Tareas";
import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-base";
import { Plan } from "../entities/Planes";

export class TareasAdapter implements TareasPort {
    private tareaRepository: Repository<TareaEntity>;

    constructor() {
        this.tareaRepository = AppDataSource.getRepository(TareaEntity);
    }

    // Transforma la entidad de infraestructura al modelo de dominio
    private toDomain(tareaEntity: TareaEntity): TareaDomain {
        return {
            id_tarea: tareaEntity.id_tarea,
            plan: tareaEntity.plan ? tareaEntity.plan.id_plan : 0,
            nombre_tarea: tareaEntity.nombre_tarea,
            descripcion: tareaEntity.descripcion,
            fecha_inicio: tareaEntity.fecha_inicio,
            fecha_fin: tareaEntity.fecha_fin,
            estado: tareaEntity.estado
        };
    }

    // Transforma el modelo de dominio a la entidad de infraestructura
    private toEntity(tareaDomain: Omit<TareaDomain, "id_tarea">, planEntity: Plan): Omit<TareaEntity, "id_tarea"> {
        const tareaEntity = new TareaEntity();
        tareaEntity.plan = planEntity;
        tareaEntity.nombre_tarea = tareaDomain.nombre_tarea;
        tareaEntity.descripcion = tareaDomain.descripcion;
        tareaEntity.fecha_inicio = tareaDomain.fecha_inicio;
        tareaEntity.fecha_fin = tareaDomain.fecha_fin;
        tareaEntity.estado = tareaDomain.estado;
        return tareaEntity;
    }

    // Método para corregir la secuencia si es necesario
    private async fixSequenceIfNeeded(): Promise<void> {
        try {
            const queryRunner = this.tareaRepository.manager.connection.createQueryRunner();
            await queryRunner.connect();

            const maxIdResult = await queryRunner.query(
                'SELECT COALESCE(MAX(id_tarea), 0) as max_id FROM "vitalscore"."Tareas"'
            );
            const maxId = parseInt(maxIdResult[0]?.max_id || '0');

            await queryRunner.query(
                `SELECT setval('"vitalscore"."Tareas_id_tarea_seq"', ${maxId + 1}, false)`
            );

            await queryRunner.release();
        } catch (error) {
            console.warn("No se pudo corregir la secuencia automáticamente:", error);
        }
    }

    async createTarea(tarea: Omit<TareaDomain, "id_tarea">): Promise<number> {
        try {
            await this.fixSequenceIfNeeded();

            // Busca el objeto Plan por id
            const planRepository = this.tareaRepository.manager.getRepository(Plan);
            const planEntity = await planRepository.findOne({ where: { id_plan: tarea.plan } });
            if (!planEntity) throw new Error("Plan no encontrado");

            const tareaEntity = this.toEntity(tarea, planEntity) as TareaEntity;
            const newTarea = await this.tareaRepository.save(tareaEntity);
            return newTarea.id_tarea;
        } catch (error) {
            console.error("Error creating tarea:", error);
            throw new Error("Failed to create tarea");
        }
    }

    async updateTarea(id: number, tarea: Partial<TareaDomain>): Promise<boolean> {
        try {
            const existingTarea = await this.tareaRepository.findOne({ where: { id_tarea: id }, relations: ["plan"] });
            if (!existingTarea) return false;

            if (tarea.nombre_tarea !== undefined) existingTarea.nombre_tarea = tarea.nombre_tarea;
            if (tarea.descripcion !== undefined) existingTarea.descripcion = tarea.descripcion;
            if (tarea.fecha_inicio !== undefined) existingTarea.fecha_inicio = tarea.fecha_inicio;
            if (tarea.fecha_fin !== undefined) existingTarea.fecha_fin = tarea.fecha_fin;
            if (tarea.estado !== undefined) existingTarea.estado = tarea.estado;

            if (tarea.plan) {
                const planRepository = this.tareaRepository.manager.getRepository(Plan);
                const planEntity = await planRepository.findOne({ where: { id_plan: tarea.plan } });
                if (!planEntity) throw new Error("Plan no encontrado");
                existingTarea.plan = planEntity;
            }

            await this.tareaRepository.save(existingTarea);
            return true;
        } catch (error) {
            console.error("Error updating tarea:", error);
            throw new Error("Failed to update tarea");
        }
    }

    async deleteTarea(id: number): Promise<boolean> {
        try {
            const existingTarea = await this.tareaRepository.findOne({ where: { id_tarea: id } });
            if (!existingTarea) return false;
            await this.tareaRepository.remove(existingTarea);
            return true;
        } catch (error) {
            console.error("Error deleting tarea:", error);
            throw new Error("Failed to delete tarea");
        }
    }

    async getTareaById(id: number): Promise<TareaDomain | null> {
        try {
            const tarea = await this.tareaRepository.findOne({
                where: { id_tarea: id },
                relations: ["plan"]
            });
            return tarea ? this.toDomain(tarea) : null;
        } catch (error) {
            console.error("Error fetching tarea by ID:", error);
            throw new Error("Failed to fetch tarea by ID");
        }
    }

    async getAllTareas(): Promise<TareaDomain[]> {
        try {
            const tareas = await this.tareaRepository.find({ relations: ["plan"] });
            return tareas.map(tarea => this.toDomain(tarea));
        } catch (error) {
            console.error("Error fetching all tareas:", error);
            throw new Error("Failed to fetch all tareas");
        }
    }

    async getTareasByPlan(plan: number): Promise<TareaDomain[]> {
        try {
            const tareas = await this.tareaRepository.find({
                where: { plan: { id_plan: plan } },
                relations: ["plan"]
            });
            return tareas.map(tarea => this.toDomain(tarea));
        } catch (error) {
            console.error("Error fetching tareas by plan:", error);
            throw new Error("Failed to fetch tareas by plan");
        }
    }

    async getTareasByEstado(estado: string): Promise<TareaDomain[]> {
        try {
            const tareas = await this.tareaRepository.find({
                where: { estado: estado },
                relations: ["plan"]
            });
            return tareas.map(tarea => this.toDomain(tarea));
        } catch (error) {
            console.error("Error fetching tareas by estado:", error);
            throw new Error("Failed to fetch tareas by estado");
        }
    }

    async getTareasPorFecha(fechaInicio: Date, fechaFin: Date): Promise<TareaDomain[]> {
        try {
            const tareas = await this.tareaRepository
                .createQueryBuilder("tarea")
                .leftJoinAndSelect("tarea.plan", "plan")
                .where("tarea.fecha_inicio >= :fechaInicio AND tarea.fecha_fin <= :fechaFin", { fechaInicio, fechaFin })
                .getMany();
            return tareas.map(tarea => this.toDomain(tarea));
        } catch (error) {
            console.error("Error fetching tareas por fecha:", error);
            throw new Error("Failed to fetch tareas por fecha");
        }
    }
}
