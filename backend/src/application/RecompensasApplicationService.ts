import { RecompensasPort } from "../domain/RecompensasPort";
import { Recompensas } from "../domain/Recompensas";
import { EpsPort } from "../domain/EpsPort";

export class RecompensasApplicationService {
    private readonly recompensasPort: RecompensasPort;
    private readonly epsPort: EpsPort;

    constructor(recompensasPort: RecompensasPort, epsPort: EpsPort) {
        this.recompensasPort = recompensasPort;
        this.epsPort = epsPort;
    }

    async createRecompensa(recompensaData: Omit<Recompensas, "id_recompensa">): Promise<number> {
        // Validar que la EPS (proveedor) existe
        const epsExistente = await this.epsPort.getEpsById(recompensaData.proveedor);
        if (!epsExistente) {
            throw new Error("La EPS especificada no existe");
        }

        // Validar que el nombre no esté vacío
        if (!recompensaData.nombre || recompensaData.nombre.trim().length === 0) {
            throw new Error("El nombre de la recompensa es requerido");
        }

        // Validar que el nombre no exceda 255 caracteres
        if (recompensaData.nombre.length > 255) {
            throw new Error("El nombre no puede exceder 255 caracteres");
        }

        // Validar que la descripción no esté vacía
        if (!recompensaData.descripcion || recompensaData.descripcion.trim().length === 0) {
            throw new Error("La descripción de la recompensa es requerida");
        }

        // Validar que la descripción no exceda 500 caracteres
        if (recompensaData.descripcion.length > 500) {
            throw new Error("La descripción no puede exceder 500 caracteres");
        }

        // Validar que los puntos necesarios sean positivos
        if (recompensaData.puntos_necesarios <= 0) {
            throw new Error("Los puntos necesarios deben ser mayores a 0");
        }


        // Validar que la fecha de creación sea válida
        if (!recompensaData.fecha_creacion || isNaN(new Date(recompensaData.fecha_creacion).getTime())) {
            throw new Error("La fecha de creación es inválida");
        }

        // Validar que el estado sea válido
        const estadosValidos = ["activo", "inactivo", "disponible", "agotado"];
        if (!estadosValidos.includes(recompensaData.estado.toLowerCase())) {
            throw new Error("El estado debe ser: activo, inactivo, disponible o agotado");
        }

        return await this.recompensasPort.createRecompensa(recompensaData);
    }

    async getAllRecompensas(): Promise<Recompensas[]> {
        return await this.recompensasPort.getAllRecompensas();
    }

    async getRecompensaById(id: number): Promise<Recompensas | null> {
        return await this.recompensasPort.getRecompensaById(id);
    }

    async getRecompensasByProveedor(proveedor: number): Promise<Recompensas[]> {
        // Validar que la EPS existe
        const epsExistente = await this.epsPort.getEpsById(proveedor);
        if (!epsExistente) {
            throw new Error("La EPS especificada no existe");
        }
        return await this.recompensasPort.getRecompensasByProveedor(proveedor);
    }

    async getRecompensasByEstado(estado: string): Promise<Recompensas[]> {
        // Validar que el estado sea válido
        const estadosValidos = ["activo", "inactivo", "disponible", "agotado"];
        if (!estadosValidos.includes(estado.toLowerCase())) {
            throw new Error("El estado debe ser: activo, inactivo, disponible o agotado");
        }
        return await this.recompensasPort.getRecompensasByEstado(estado);
    }

    async getRecompensasPorPuntos(puntosMin: number, puntosMax: number): Promise<Recompensas[]> {
        // Validar que los rangos de puntos sean válidos
        if (puntosMin < 0 || puntosMax < 0) {
            throw new Error("Los puntos no pueden ser negativos");
        }
        if (puntosMin > puntosMax) {
            throw new Error("El punto mínimo debe ser menor o igual al punto máximo");
        }
        return await this.recompensasPort.getRecompensasPorPuntos(puntosMin, puntosMax);
    }

    async getRecompensasPorFecha(fechaInicio: Date, fechaFin: Date): Promise<Recompensas[]> {
        // Validar que las fechas sean válidas
        if (!fechaInicio || !fechaFin || isNaN(new Date(fechaInicio).getTime()) || isNaN(new Date(fechaFin).getTime())) {
            throw new Error("Las fechas de inicio y fin son requeridas y deben ser válidas");
        }
        if (fechaInicio >= fechaFin) {
            throw new Error("La fecha de inicio debe ser anterior a la fecha de fin");
        }
        return await this.recompensasPort.getRecompensasPorFecha(fechaInicio, fechaFin);
    }

    async updateRecompensa(id: number, recompensaData: Partial<Recompensas>): Promise<boolean> {
        // Validar que la recompensa existe
        const recompensaExistente = await this.recompensasPort.getRecompensaById(id);
        if (!recompensaExistente) {
            throw new Error("La recompensa no existe");
        }

        // Si se actualiza el proveedor, validar que existe
        if (recompensaData.proveedor) {
            const epsExistente = await this.epsPort.getEpsById(recompensaData.proveedor);
            if (!epsExistente) {
                throw new Error("La EPS especificada no existe");
            }
        }

        // Si se actualiza el nombre, validar que no esté vacío
        if (recompensaData.nombre !== undefined) {
            if (!recompensaData.nombre || recompensaData.nombre.trim().length === 0) {
                throw new Error("El nombre de la recompensa no puede estar vacío");
            }
            if (recompensaData.nombre.length > 255) {
                throw new Error("El nombre no puede exceder 255 caracteres");
            }
        }

        // Si se actualiza la descripción, validar que no esté vacía
        if (recompensaData.descripcion !== undefined) {
            if (!recompensaData.descripcion || recompensaData.descripcion.trim().length === 0) {
                throw new Error("La descripción de la recompensa no puede estar vacía");
            }
            if (recompensaData.descripcion.length > 500) {
                throw new Error("La descripción no puede exceder 500 caracteres");
            }
        }

        // Si se actualizan los puntos necesarios, validar que sean válidos
        if (recompensaData.puntos_necesarios !== undefined) {
            if (recompensaData.puntos_necesarios <= 0) {
                throw new Error("Los puntos necesarios deben ser mayores a 0");
            }
        }

        // Si se actualiza la fecha de creación, validar que sea válida
        if (recompensaData.fecha_creacion !== undefined) {
            if (!recompensaData.fecha_creacion || isNaN(new Date(recompensaData.fecha_creacion).getTime())) {
                throw new Error("La fecha de creación es inválida");
            }
        }

        // Si se actualiza el estado, validar que sea válido
        if (recompensaData.estado !== undefined) {
            const estadosValidos = ["activo", "inactivo", "disponible", "agotado"];
            if (!estadosValidos.includes(recompensaData.estado.toLowerCase())) {
                throw new Error("El estado debe ser: activo, inactivo, disponible o agotado");
            }
        }

        return await this.recompensasPort.updateRecompensa(id, recompensaData);
    }

    async deleteRecompensa(id: number): Promise<boolean> {
        // Validar que la recompensa existe
        const recompensaExistente = await this.recompensasPort.getRecompensaById(id);
        if (!recompensaExistente) {
            throw new Error("La recompensa no existe");
        }
        return await this.recompensasPort.deleteRecompensa(id);
    }

    // Métodos adicionales de lógica de negocio específica para recompensas

    async activarRecompensa(id: number): Promise<boolean> {
        // Validar que la recompensa existe
        const recompensaExistente = await this.recompensasPort.getRecompensaById(id);
        if (!recompensaExistente) {
            throw new Error("La recompensa no existe");
        }

        // Validar que la recompensa no esté ya activa
        if (recompensaExistente.estado.toLowerCase() === "activo") {
            throw new Error("La recompensa ya está activa");
        }

        return await this.recompensasPort.updateRecompensa(id, { estado: "activo" });
    }

    async desactivarRecompensa(id: number): Promise<boolean> {
        // Validar que la recompensa existe
        const recompensaExistente = await this.recompensasPort.getRecompensaById(id);
        if (!recompensaExistente) {
            throw new Error("La recompensa no existe");
        }

        // Validar que la recompensa no esté ya inactiva
        if (recompensaExistente.estado.toLowerCase() === "inactivo") {
            throw new Error("La recompensa ya está inactiva");
        }

        return await this.recompensasPort.updateRecompensa(id, { estado: "inactivo" });
    }

    async marcarComoAgotada(id: number): Promise<boolean> {
        // Validar que la recompensa existe
        const recompensaExistente = await this.recompensasPort.getRecompensaById(id);
        if (!recompensaExistente) {
            throw new Error("La recompensa no existe");
        }

        // Validar que la recompensa esté activa
        if (recompensaExistente.estado.toLowerCase() !== "activo") {
            throw new Error("Solo se pueden marcar como agotadas las recompensas activas");
        }

        return await this.recompensasPort.updateRecompensa(id, { estado: "agotado" });
    }

    async getRecompensasDisponibles(): Promise<Recompensas[]> {
        return await this.recompensasPort.getRecompensasByEstado("activo");
    }

    async getRecompensasPorRangoDePuntos(puntosMin: number, puntosMax: number): Promise<Recompensas[]> {
        // Validar que los rangos de puntos sean válidos
        if (puntosMin < 0 || puntosMax < 0) {
            throw new Error("Los puntos no pueden ser negativos");
        }
        if (puntosMin > puntosMax) {
            throw new Error("El punto mínimo debe ser menor o igual al punto máximo");
        }

        // Obtener todas las recompensas activas
        const recompensasActivas = await this.recompensasPort.getRecompensasByEstado("activo");
        
        // Filtrar por rango de puntos
        return recompensasActivas.filter(recompensa => 
            recompensa.puntos_necesarios >= puntosMin && recompensa.puntos_necesarios <= puntosMax
        );
    }
}
