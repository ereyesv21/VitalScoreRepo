import { Canjes } from "./Canjes";

export interface CanjesPort {
    createCanje(canje: Omit<Canjes, 'id_canje'>): Promise<number>;
    updateCanje(id: number, canje: Partial<Canjes>): Promise<boolean>;
    deleteCanje(id: number): Promise<boolean>;
    getCanjeById(id: number): Promise<Canjes | null>;
    getAllCanjes(): Promise<Canjes[]>;
    getCanjesByPaciente(paciente: number): Promise<Canjes[]>;
    getCanjesByEstado(estado: string): Promise<Canjes[]>;
    getCanjesPorFecha(fechaInicio: Date, fechaFin: Date): Promise<Canjes[]>;
    getCanjesPorPuntos(puntosMin: number, puntosMax: number): Promise<Canjes[]>;
}
