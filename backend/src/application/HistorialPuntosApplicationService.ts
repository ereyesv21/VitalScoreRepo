import { HistorialPuntosPort } from "../domain/HistorialPuntosPort";
import { Historial_Puntos } from "../domain/HistorialPuntos";
import { PacientePort } from "../domain/PacientePort";

export class HistorialPuntosApplicationService {
    private readonly historialPort: HistorialPuntosPort;
    private readonly pacientePort: PacientePort;

    constructor(historialPort: HistorialPuntosPort, pacientePort: PacientePort) {
        this.historialPort = historialPort;
        this.pacientePort = pacientePort;
    }

    async createHistorial(historial: Omit<Historial_Puntos, "id_historial">): Promise<number> {
        // Validar existencia de paciente
        const paciente = await this.pacientePort.getPacienteById(historial.paciente);
        if (!paciente) {
            throw new Error("El paciente especificado no existe");
        }
        // Validar puntos
        if (typeof historial.puntos !== 'number') {
            throw new Error("El campo 'puntos' es requerido y debe ser un número");
        }
        // Validar fecha
        if (!historial.fecha_registro || isNaN(new Date(historial.fecha_registro).getTime())) {
            throw new Error("La fecha de registro es inválida");
        }
        // Validar descripción
        if (!historial.descripcion || historial.descripcion.trim().length === 0) {
            throw new Error("La descripción es requerida");
        }
        if (historial.descripcion.length > 500) {
            throw new Error("La descripción no puede exceder 500 caracteres");
        }
        return await this.historialPort.createHistorial(historial);
    }

    async updateHistorial(id: number, historial: Partial<Historial_Puntos>): Promise<boolean> {
        // Validar existencia del historial
        const existente = await this.historialPort.getHistorialById(id);
        if (!existente) {
            throw new Error("El historial de puntos no existe");
        }
        // Si se actualiza el paciente, validar que existe
        if (historial.paciente) {
            const paciente = await this.pacientePort.getPacienteById(historial.paciente);
            if (!paciente) {
                throw new Error("El paciente especificado no existe");
            }
        }
        // Si se actualiza la fecha, validar
        if (historial.fecha_registro !== undefined && isNaN(new Date(historial.fecha_registro).getTime())) {
            throw new Error("La fecha de registro es inválida");
        }
        // Si se actualiza la descripción, validar
        if (historial.descripcion !== undefined) {
            if (!historial.descripcion || historial.descripcion.trim().length === 0) {
                throw new Error("La descripción debe ser una cadena de texto no vacía");
            }
            if (historial.descripcion.length > 500) {
                throw new Error("La descripción no puede exceder 500 caracteres");
            }
        }
        return await this.historialPort.updateHistorial(id, historial);
    }

    async deleteHistorial(id: number): Promise<boolean> {
        // Validar existencia del historial
        const existente = await this.historialPort.getHistorialById(id);
        if (!existente) {
            throw new Error("El historial de puntos no existe");
        }
        return await this.historialPort.deleteHistorial(id);
    }

    async getHistorialById(id: number): Promise<Historial_Puntos | null> {
        return await this.historialPort.getHistorialById(id);
    }

    async getAllHistoriales(): Promise<Historial_Puntos[]> {
        return await this.historialPort.getAllHistoriales();
    }

    async getHistorialesByPaciente(paciente: number): Promise<Historial_Puntos[]> {
        // Validar existencia de paciente
        const existe = await this.pacientePort.getPacienteById(paciente);
        if (!existe) {
            throw new Error("El paciente especificado no existe");
        }
        return await this.historialPort.getHistorialesByPaciente(paciente);
    }

    async getHistorialesByFecha(fechaInicio: Date, fechaFin: Date): Promise<Historial_Puntos[]> {
        // Validar fechas
        if (!fechaInicio || !fechaFin || isNaN(new Date(fechaInicio).getTime()) || isNaN(new Date(fechaFin).getTime())) {
            throw new Error("Las fechas de inicio y fin son requeridas y deben ser válidas");
        }
        if (fechaInicio >= fechaFin) {
            throw new Error("La fecha de inicio debe ser anterior a la fecha de fin");
        }
        return await this.historialPort.getHistorialesByFecha(fechaInicio, fechaFin);
    }

    async getHistorialesByPuntos(puntos: number): Promise<Historial_Puntos[]> {
        return await this.historialPort.getHistorialesByPuntos(puntos);
    }

    async getHistorialesPorRangoPuntos(puntosMin: number, puntosMax: number): Promise<Historial_Puntos[]> {
        if (typeof puntosMin !== 'number' || typeof puntosMax !== 'number') {
            throw new Error("Los parámetros de puntos deben ser números");
        }
        if (puntosMin > puntosMax) {
            throw new Error("El valor mínimo de puntos no puede ser mayor que el máximo");
        }
        return await this.historialPort.getHistorialesPorRangoPuntos(puntosMin, puntosMax);
    }
}
