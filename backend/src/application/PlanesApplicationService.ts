import { PlanesPort } from "../domain/PlanesPort";
import { Planes } from "../domain/Planes";
import { PacientePort } from "../domain/PacientePort";
import { MedicoPort } from "../domain/MedicoPort";

export class PlanesApplicationService {
    private readonly planPort: PlanesPort;
    private readonly pacientePort: PacientePort;
    private readonly medicoPort: MedicoPort;

    constructor(planPort: PlanesPort, pacientePort: PacientePort, medicoPort: MedicoPort) {
        this.planPort = planPort;
        this.pacientePort = pacientePort;
        this.medicoPort = medicoPort;
    }

    async createPlan(planData: Omit<Planes, "id_plan">): Promise<number> {
        // Validar que el paciente existe
        const pacienteExistente = await this.pacientePort.getPacienteById(planData.paciente);
        if (!pacienteExistente) {
            throw new Error("El paciente especificado no existe");
        }

        // Validar que el médico existe
        const medicoExistente = await this.medicoPort.getMedicoById(planData.medico);
        if (!medicoExistente) {
            throw new Error("El médico especificado no existe");
        }

        // Validar que la descripción no esté vacía
        if (!planData.descripcion || planData.descripcion.trim().length === 0) {
            throw new Error("La descripción del plan es requerida");
        }

        // Validar que la descripción no exceda 500 caracteres
        if (planData.descripcion.length > 500) {
            throw new Error("La descripción no puede exceder 500 caracteres");
        }

        // Validar que la fecha de inicio sea anterior a la fecha de fin
        if (planData.fecha_inicio >= planData.fecha_fin) {
            throw new Error("La fecha de inicio debe ser anterior a la fecha de fin");
        }

        // Validar que la fecha de inicio no sea en el pasado (opcional, depende del negocio)
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        if (planData.fecha_inicio < hoy) {
            throw new Error("La fecha de inicio no puede ser en el pasado");
        }

        // Validar que el estado sea válido
        const estadosValidos = ["activo", "inactivo", "completado", "cancelado"];
        if (!estadosValidos.includes(planData.estado.toLowerCase())) {
            throw new Error("El estado debe ser: activo, inactivo, completado o cancelado");
        }

        return await this.planPort.createPlan(planData);
    }

    async getAllPlanes(): Promise<Planes[]> {
        return await this.planPort.getAllPlanes();
    }

    async getPlanById(id: number): Promise<Planes | null> {
        return await this.planPort.getPlanById(id);
    }

    async getPlanesByPaciente(paciente: number): Promise<Planes[]> {
        // Validar que el paciente existe
        const pacienteExistente = await this.pacientePort.getPacienteById(paciente);
        if (!pacienteExistente) {
            throw new Error("El paciente especificado no existe");
        }
        return await this.planPort.getPlanesByPaciente(paciente);
    }

    async getPlanesByMedico(medico: number): Promise<Planes[]> {
        // Validar que el médico existe
        const medicoExistente = await this.medicoPort.getMedicoById(medico);
        if (!medicoExistente) {
            throw new Error("El médico especificado no existe");
        }
        return await this.planPort.getPlanesByMedico(medico);
    }

    async getPlanesByEstado(estado: string): Promise<Planes[]> {
        // Validar que el estado sea válido
        const estadosValidos = ["activo", "inactivo", "completado", "cancelado"];
        if (!estadosValidos.includes(estado.toLowerCase())) {
            throw new Error("El estado debe ser: activo, inactivo, completado o cancelado");
        }
        return await this.planPort.getPlanesByEstado(estado);
    }

    async getPlanesActivos(): Promise<Planes[]> {
        return await this.planPort.getPlanesActivos();
    }

    async getPlanesPorFecha(fechaInicio: Date, fechaFin: Date): Promise<Planes[]> {
        // Validar que la fecha de inicio sea anterior a la fecha de fin
        if (fechaInicio >= fechaFin) {
            throw new Error("La fecha de inicio debe ser anterior a la fecha de fin");
        }
        return await this.planPort.getPlanesPorFecha(fechaInicio, fechaFin);
    }

    async updatePlan(id: number, planData: Partial<Planes>): Promise<boolean> {
        // Validar que el plan existe
        const planExistente = await this.planPort.getPlanById(id);
        if (!planExistente) {
            throw new Error("El plan no existe");
        }

        // Si se actualiza el paciente, validar que existe
        if (planData.paciente) {
            const pacienteExistente = await this.pacientePort.getPacienteById(planData.paciente);
            if (!pacienteExistente) {
                throw new Error("El paciente especificado no existe");
            }
        }

        // Si se actualiza el médico, validar que existe
        if (planData.medico) {
            const medicoExistente = await this.medicoPort.getMedicoById(planData.medico);
            if (!medicoExistente) {
                throw new Error("El médico especificado no existe");
            }
        }

        // Si se actualiza la descripción, validar que no esté vacía
        if (planData.descripcion !== undefined) {
            if (!planData.descripcion || planData.descripcion.trim().length === 0) {
                throw new Error("La descripción del plan no puede estar vacía");
            }
            if (planData.descripcion.length > 500) {
                throw new Error("La descripción no puede exceder 500 caracteres");
            }
        }

        // Si se actualizan las fechas, validar la lógica
        if (planData.fecha_inicio !== undefined || planData.fecha_fin !== undefined) {
            const fechaInicio = planData.fecha_inicio || planExistente.fecha_inicio;
            const fechaFin = planData.fecha_fin || planExistente.fecha_fin;
            
            if (fechaInicio >= fechaFin) {
                throw new Error("La fecha de inicio debe ser anterior a la fecha de fin");
            }
        }

        // Si se actualiza el estado, validar que sea válido
        if (planData.estado !== undefined) {
            const estadosValidos = ["activo", "inactivo", "completado", "cancelado"];
            if (!estadosValidos.includes(planData.estado.toLowerCase())) {
                throw new Error("El estado debe ser: activo, inactivo, completado o cancelado");
            }
        }

        return await this.planPort.updatePlan(id, planData);
    }

    async deletePlan(id: number): Promise<boolean> {
        // Validar que el plan existe
        const planExistente = await this.planPort.getPlanById(id);
        if (!planExistente) {
            throw new Error("El plan no existe");
        }
        return await this.planPort.deletePlan(id);
    }

    // Métodos adicionales de lógica de negocio específica para planes

    async activarPlan(id: number): Promise<boolean> {
        // Validar que el plan existe
        const planExistente = await this.planPort.getPlanById(id);
        if (!planExistente) {
            throw new Error("El plan no existe");
        }

        // Validar que el plan no esté ya activo
        if (planExistente.estado.toLowerCase() === "activo") {
            throw new Error("El plan ya está activo");
        }

        return await this.planPort.updatePlan(id, { estado: "activo" });
    }

    async desactivarPlan(id: number): Promise<boolean> {
        // Validar que el plan existe
        const planExistente = await this.planPort.getPlanById(id);
        if (!planExistente) {
            throw new Error("El plan no existe");
        }

        // Validar que el plan esté activo
        if (planExistente.estado.toLowerCase() !== "activo") {
            throw new Error("Solo se pueden desactivar planes activos");
        }

        return await this.planPort.updatePlan(id, { estado: "inactivo" });
    }

    async completarPlan(id: number): Promise<boolean> {
        // Validar que el plan existe
        const planExistente = await this.planPort.getPlanById(id);
        if (!planExistente) {
            throw new Error("El plan no existe");
        }

        // Validar que el plan esté activo
        if (planExistente.estado.toLowerCase() !== "activo") {
            throw new Error("Solo se pueden completar planes activos");
        }

        return await this.planPort.updatePlan(id, { estado: "completado" });
    }

    async cancelarPlan(id: number): Promise<boolean> {
        // Validar que el plan existe
        const planExistente = await this.planPort.getPlanById(id);
        if (!planExistente) {
            throw new Error("El plan no existe");
        }

        // Validar que el plan esté activo o inactivo
        if (!["activo", "inactivo"].includes(planExistente.estado.toLowerCase())) {
            throw new Error("Solo se pueden cancelar planes activos o inactivos");
        }

        return await this.planPort.updatePlan(id, { estado: "cancelado" });
    }

    async getPlanesVencidos(): Promise<Planes[]> {
        // Obtener todos los planes
        const todosLosPlanes = await this.planPort.getAllPlanes();
        const hoy = new Date();
        
        // Filtrar planes vencidos (fecha_fin < hoy y estado activo)
        return todosLosPlanes.filter(plan => 
            plan.fecha_fin < hoy && plan.estado.toLowerCase() === "activo"
        );
    }

    async getPlanesProximosAVencer(diasLimite: number = 7): Promise<Planes[]> {
        // Obtener todos los planes
        const todosLosPlanes = await this.planPort.getAllPlanes();
        const hoy = new Date();
        const fechaLimite = new Date();
        fechaLimite.setDate(hoy.getDate() + diasLimite);
        
        // Filtrar planes próximos a vencer
        return todosLosPlanes.filter(plan => 
            plan.fecha_fin >= hoy && 
            plan.fecha_fin <= fechaLimite && 
            plan.estado.toLowerCase() === "activo"
        );
    }

    async getPlanesPorRangoDeFechas(fechaInicio: Date, fechaFin: Date): Promise<Planes[]> {
        // Validar que la fecha de inicio sea anterior a la fecha de fin
        if (fechaInicio >= fechaFin) {
            throw new Error("La fecha de inicio debe ser anterior a la fecha de fin");
        }

        // Obtener todos los planes
        const todosLosPlanes = await this.planPort.getAllPlanes();
        
        // Filtrar planes que se superpongan con el rango de fechas
        return todosLosPlanes.filter(plan => 
            (plan.fecha_inicio <= fechaFin && plan.fecha_fin >= fechaInicio)
        );
    }
}
