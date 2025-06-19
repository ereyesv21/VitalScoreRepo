import { Recompensas } from "./Recompensas";

export interface RecompensasPort {
    createRecompensa(recompensa: Omit<Recompensas, 'id_recompensa'>): Promise<number>;
    updateRecompensa(id: number, recompensa: Partial<Recompensas>): Promise<boolean>;
    deleteRecompensa(id: number): Promise<boolean>;
    getRecompensaById(id: number): Promise<Recompensas | null>;
    getAllRecompensas(): Promise<Recompensas[]>;
    getRecompensasByProveedor(proveedor: number): Promise<Recompensas[]>;
    getRecompensasByEstado(estado: string): Promise<Recompensas[]>;
    getRecompensasPorPuntos(puntosMin: number, puntosMax: number): Promise<Recompensas[]>;
    getRecompensasPorFecha(fechaInicio: Date, fechaFin: Date): Promise<Recompensas[]>;
}
