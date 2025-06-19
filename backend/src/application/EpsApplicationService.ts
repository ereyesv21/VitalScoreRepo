import { EpsPort } from "../domain/EpsPort";
import { EPS } from "../domain/Eps";

export class EpsApplicationService {
    private readonly epsPort: EpsPort;

    constructor(epsPort: EpsPort) {
        this.epsPort = epsPort;
    }

    async createEps(epsData: Omit<EPS, "id_eps">): Promise<number> {
        return await this.epsPort.createEps(epsData);
    }

    async getAllEps(): Promise<EPS[]> {
        return await this.epsPort.getAllEps();
    }

    async getEpsById(id: number): Promise<EPS | null> {
        return await this.epsPort.getEpsById(id);
    }

    async getEpsByNombre(nombre: string): Promise<EPS | null> {
        return await this.epsPort.getEpsByNombre(nombre);
    }

    async updateEps(id: number, epsData: Partial<EPS>): Promise<boolean> {
        return await this.epsPort.updateEps(id, epsData);
    }

    async deleteEps(id: number): Promise<boolean> {
        return await this.epsPort.deleteEps(id);
    }
}
