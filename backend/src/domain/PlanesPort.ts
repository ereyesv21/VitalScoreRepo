import { Planes } from "./Planes";

export interface PlanesPort {
    createPlan(plan: Omit<Planes, 'id_plan'>): Promise<number>;
    updatePlan(id: number, plan: Partial<Planes>): Promise<boolean>;
    deletePlan(id: number): Promise<boolean>;
    getPlanById(id: number): Promise<Planes | null>;
    getAllPlanes(): Promise<Planes[]>;
    getPlanesByPaciente(paciente: number): Promise<Planes[]>;
    getPlanesByMedico(medico: number): Promise<Planes[]>;
    getPlanesByEstado(estado: string): Promise<Planes[]>;
    getPlanesActivos(): Promise<Planes[]>;
    getPlanesPorFecha(fechaInicio: Date, fechaFin: Date): Promise<Planes[]>;
}
