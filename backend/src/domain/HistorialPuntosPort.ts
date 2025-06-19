import { Historial_Puntos } from "./HistorialPuntos";

export interface HistorialPuntosPort {
    createHistorial(historial: Omit<Historial_Puntos, 'id_historial'>): Promise<number>;
    updateHistorial(id: number, historial: Partial<Historial_Puntos>): Promise<boolean>;
    deleteHistorial(id: number): Promise<boolean>;
    getHistorialById(id: number): Promise<Historial_Puntos | null>;
    getAllHistoriales(): Promise<Historial_Puntos[]>;
    getHistorialesByPaciente(paciente: number): Promise<Historial_Puntos[]>;
    getHistorialesByFecha(fechaInicio: Date, fechaFin: Date): Promise<Historial_Puntos[]>;
    getHistorialesByPuntos(puntos: number): Promise<Historial_Puntos[]>;
    getHistorialesPorRangoPuntos(puntosMin: number, puntosMax: number): Promise<Historial_Puntos[]>;
}
