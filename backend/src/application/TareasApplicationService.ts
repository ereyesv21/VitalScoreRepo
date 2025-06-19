import { TareasPort } from "../domain/TareasPort";
import { Tareas } from "../domain/Tareas";
import { PlanesPort } from "../domain/PlanesPort";

export class TareasApplicationService {
    private readonly tareasPort: TareasPort;
    private readonly planesPort: PlanesPort;

    constructor(tareasPort: TareasPort, planesPort: PlanesPort) {
        this.tareasPort = tareasPort;
        this.planesPort = planesPort;
    }

    async createTarea(tareaData: Omit<Tareas, "id_tarea">): Promise<number> {
        // Validar que el plan existe
        const planExistente = await this.planesPort.getPlanById(tareaData.plan);
        if (!planExistente) {
            throw new Error("El plan especificado no existe");
        }

        // Validar que el nombre de la tarea no esté vacío
        if (!tareaData.nombre_tarea || tareaData.nombre_tarea.trim().length === 0) {
            throw new Error("El nombre de la tarea es requerido");
        }

        // Validar que la descripción no esté vacía
        if (!tareaData.descripcion || tareaData.descripcion.trim().length === 0) {
            throw new Error("La descripción de la tarea es requerida");
        }

        // Validar que la fecha de inicio sea anterior a la fecha de fin
        if (tareaData.fecha_inicio >= tareaData.fecha_fin) {
            throw new Error("La fecha de inicio debe ser anterior a la fecha de fin");
        }

        // Validar que la fecha de inicio no sea en el pasado
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        if (tareaData.fecha_inicio < hoy) {
            throw new Error("La fecha de inicio no puede ser en el pasado");
        }

        // Validar que el estado sea válido
        const estadosValidos = ["pendiente", "en progreso", "completada", "cancelada"];
        if (!estadosValidos.includes(tareaData.estado.toLowerCase())) {
            throw new Error("El estado debe ser: pendiente, en progreso, completada o cancelada");
        }

        return await this.tareasPort.createTarea(tareaData);
    }

    async getAllTareas(): Promise<Tareas[]> {
        return await this.tareasPort.getAllTareas();
    }

    async getTareaById(id: number): Promise<Tareas | null> {
        return await this.tareasPort.getTareaById(id);
    }

    async getTareasByPlan(plan: number): Promise<Tareas[]> {
        // Validar que el plan existe
        const planExistente = await this.planesPort.getPlanById(plan);
        if (!planExistente) {
            throw new Error("El plan especificado no existe");
        }
        return await this.tareasPort.getTareasByPlan(plan);
    }

    async getTareasByEstado(estado: string): Promise<Tareas[]> {
        // Validar que el estado sea válido
        const estadosValidos = ["pendiente", "en progreso", "completada", "cancelada"];
        if (!estadosValidos.includes(estado.toLowerCase())) {
            throw new Error("El estado debe ser: pendiente, en progreso, completada o cancelada");
        }
        return await this.tareasPort.getTareasByEstado(estado);
    }

    async getTareasPorFecha(fechaInicio: Date, fechaFin: Date): Promise<Tareas[]> {
        // Validar que la fecha de inicio sea anterior a la fecha de fin
        if (fechaInicio >= fechaFin) {
            throw new Error("La fecha de inicio debe ser anterior a la fecha de fin");
        }
        return await this.tareasPort.getTareasPorFecha(fechaInicio, fechaFin);
    }

    async updateTarea(id: number, tareaData: Partial<Tareas>): Promise<boolean> {
        // Validar que la tarea existe
        const tareaExistente = await this.tareasPort.getTareaById(id);
        if (!tareaExistente) {
            throw new Error("La tarea no existe");
        }

        // Si se actualiza el plan, validar que existe
        if (tareaData.plan) {
            const planExistente = await this.planesPort.getPlanById(tareaData.plan);
            if (!planExistente) {
                throw new Error("El plan especificado no existe");
            }
        }

        // Si se actualiza el nombre de la tarea, validar que no esté vacío
        if (tareaData.nombre_tarea !== undefined && tareaData.nombre_tarea.trim().length === 0) {
            throw new Error("El nombre de la tarea no puede estar vacío");
        }

        // Si se actualiza la descripción, validar que no esté vacía
        if (tareaData.descripcion !== undefined && tareaData.descripcion.trim().length === 0) {
            throw new Error("La descripción de la tarea no puede estar vacía");
        }

        // Si se actualizan las fechas, validar la lógica
        if (tareaData.fecha_inicio !== undefined || tareaData.fecha_fin !== undefined) {
            const fechaInicio = tareaData.fecha_inicio || tareaExistente.fecha_inicio;
            const fechaFin = tareaData.fecha_fin || tareaExistente.fecha_fin;
            if (fechaInicio >= fechaFin) {
                throw new Error("La fecha de inicio debe ser anterior a la fecha de fin");
            }
        }

        // Si se actualiza el estado, validar que sea válido
        if (tareaData.estado !== undefined) {
            const estadosValidos = ["pendiente", "en progreso", "completada", "cancelada"];
            if (!estadosValidos.includes(tareaData.estado.toLowerCase())) {
                throw new Error("El estado debe ser: pendiente, en progreso, completada o cancelada");
            }
        }

        return await this.tareasPort.updateTarea(id, tareaData);
    }

    async deleteTarea(id: number): Promise<boolean> {
        // Validar que la tarea existe
        const tareaExistente = await this.tareasPort.getTareaById(id);
        if (!tareaExistente) {
            throw new Error("La tarea no existe");
        }
        return await this.tareasPort.deleteTarea(id);
    }
}
