import { EPS } from "./Eps";

export interface EpsPort {
    createEps(eps: Omit<EPS, 'id_eps'>): Promise<number>;
    updateEps(id: number, eps: Partial<EPS>): Promise<boolean>;
    deleteEps(id: number): Promise<boolean>;
    getEpsById(id: number): Promise<EPS | null>;
    getAllEps(): Promise<EPS[]>;
    getEpsByNombre(nombre: string): Promise<EPS | null>;
}
