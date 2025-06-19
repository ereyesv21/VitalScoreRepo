import { CanjesPort } from "../domain/CanjesPort";
import { Canjes } from "../domain/Canjes";
import { PacientePort } from "../domain/PacientePort";
import { RecompensasPort } from "../domain/RecompensasPort";

export class CanjesApplicationService {
    private readonly canjesPort: CanjesPort;
    private readonly pacientePort: PacientePort;
    private readonly recompensasPort: RecompensasPort;

    constructor(
        canjesPort: CanjesPort,
        pacientePort: PacientePort,
        recompensasPort: RecompensasPort
    ) {
        this.canjesPort = canjesPort;
        this.pacientePort = pacientePort;
        this.recompensasPort = recompensasPort;
    }

    async createCanje(canjeData: Omit<Canjes, "id_canje">): Promise<number> {
        // Validar que el paciente existe
        const pacienteExistente = await this.pacientePort.getPacienteById(canjeData.paciente);
        if (!pacienteExistente) {
            throw new Error("El paciente especificado no existe");
        }

        // Validar que la recompensa existe
        const recompensaExistente = await this.recompensasPort.getRecompensaById(canjeData.recompensa);
        if (!recompensaExistente) {
            throw new Error("La recompensa especificada no existe");
        }

        // Validar puntos utilizados
        if (typeof canjeData.puntos_utilizados !== "number" || canjeData.puntos_utilizados <= 0) {
            throw new Error("Los puntos utilizados deben ser un número positivo");
        }

        // Validar que el paciente tenga suficientes puntos
        if (pacienteExistente.puntos < canjeData.puntos_utilizados) {
            throw new Error("El paciente no tiene suficientes puntos para este canje");
        }

        // Validar fecha de canje
        if (!canjeData.fecha_canje || isNaN(new Date(canjeData.fecha_canje).getTime())) {
            throw new Error("La fecha de canje es inválida");
        }

        // Validar estado
        const estadosValidos = ["pendiente", "aprobado", "rechazado", "entregado"];
        if (!estadosValidos.includes(canjeData.estado.toLowerCase())) {
            throw new Error("El estado debe ser: pendiente, aprobado, rechazado o entregado");
        }

        // Descontar puntos al paciente (opcional, depende de la lógica de negocio)
        await this.pacientePort.updatePaciente(canjeData.paciente, { puntos: pacienteExistente.puntos - canjeData.puntos_utilizados });

        return await this.canjesPort.createCanje(canjeData);
    }

    async getAllCanjes(): Promise<Canjes[]> {
        return await this.canjesPort.getAllCanjes();
    }

    async getCanjeById(id: number): Promise<Canjes | null> {
        return await this.canjesPort.getCanjeById(id);
    }

    async getCanjesByPaciente(paciente: number): Promise<Canjes[]> {
        // Validar que el paciente existe
        const existe = await this.pacientePort.getPacienteById(paciente);
        if (!existe) {
            throw new Error("El paciente especificado no existe");
        }
        return await this.canjesPort.getCanjesByPaciente(paciente);
    }

    async getCanjesByEstado(estado: string): Promise<Canjes[]> {
        const estadosValidos = ["pendiente", "aprobado", "rechazado", "entregado"];
        if (!estadosValidos.includes(estado.toLowerCase())) {
            throw new Error("El estado debe ser: pendiente, aprobado, rechazado o entregado");
        }
        return await this.canjesPort.getCanjesByEstado(estado);
    }

    async getCanjesPorFecha(fechaInicio: Date, fechaFin: Date): Promise<Canjes[]> {
        if (!fechaInicio || !fechaFin || isNaN(new Date(fechaInicio).getTime()) || isNaN(new Date(fechaFin).getTime())) {
            throw new Error("Las fechas de inicio y fin son requeridas y deben ser válidas");
        }
        if (fechaInicio >= fechaFin) {
            throw new Error("La fecha de inicio debe ser anterior a la fecha de fin");
        }
        return await this.canjesPort.getCanjesPorFecha(fechaInicio, fechaFin);
    }

    async getCanjesPorPuntos(puntosMin: number, puntosMax: number): Promise<Canjes[]> {
        if (puntosMin < 0 || puntosMax < 0) {
            throw new Error("Los puntos no pueden ser negativos");
        }
        if (puntosMin > puntosMax) {
            throw new Error("El punto mínimo debe ser menor o igual al punto máximo");
        }
        return await this.canjesPort.getCanjesPorPuntos(puntosMin, puntosMax);
    }

    async updateCanje(id: number, canjeData: Partial<Canjes>): Promise<boolean> {
        // Validar que el canje existe
        const canjeExistente = await this.canjesPort.getCanjeById(id);
        if (!canjeExistente) {
            throw new Error("El canje no existe");
        }

        // Si se actualiza el paciente, validar que existe
        if (canjeData.paciente) {
            const pacienteExistente = await this.pacientePort.getPacienteById(canjeData.paciente);
            if (!pacienteExistente) {
                throw new Error("El paciente especificado no existe");
            }
        }

        // Si se actualiza la recompensa, validar que existe
        if (canjeData.recompensa) {
            const recompensaExistente = await this.recompensasPort.getRecompensaById(canjeData.recompensa);
            if (!recompensaExistente) {
                throw new Error("La recompensa especificada no existe");
            }
        }

        // Si se actualizan los puntos utilizados, validar
        if (canjeData.puntos_utilizados !== undefined) {
            if (typeof canjeData.puntos_utilizados !== "number" || canjeData.puntos_utilizados <= 0) {
                throw new Error("Los puntos utilizados deben ser un número positivo");
            }
        }

        // Si se actualiza la fecha, validar
        if (canjeData.fecha_canje !== undefined) {
            if (!canjeData.fecha_canje || isNaN(new Date(canjeData.fecha_canje).getTime())) {
                throw new Error("La fecha de canje es inválida");
            }
        }

        // Si se actualiza el estado, validar
        if (canjeData.estado !== undefined) {
            const estadosValidos = ["pendiente", "aprobado", "rechazado", "entregado"];
            if (!estadosValidos.includes(canjeData.estado.toLowerCase())) {
                throw new Error("El estado debe ser: pendiente, aprobado, rechazado o entregado");
            }
        }

        return await this.canjesPort.updateCanje(id, canjeData);
    }

    async deleteCanje(id: number): Promise<boolean> {
        // Validar que el canje existe
        const canjeExistente = await this.canjesPort.getCanjeById(id);
        if (!canjeExistente) {
            throw new Error("El canje no existe");
        }
        return await this.canjesPort.deleteCanje(id);
    }
}
