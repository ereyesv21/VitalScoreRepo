import { Tareas } from "./Tareas";

export interface TareasPort {
    createTarea(tarea: Omit<Tareas, 'id_tarea'>): Promise<number>;
    updateTarea(id: number, tarea: Partial<Tareas>): Promise<boolean>;
    deleteTarea(id: number): Promise<boolean>;
    getTareaById(id: number): Promise<Tareas | null>;
    getAllTareas(): Promise<Tareas[]>;
    getTareasByPlan(plan: number): Promise<Tareas[]>;
    getTareasByEstado(estado: string): Promise<Tareas[]>;
    getTareasPorFecha(fechaInicio: Date, fechaFin: Date): Promise<Tareas[]>;
}
