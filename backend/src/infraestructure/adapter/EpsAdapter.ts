import { EpsPort } from "../../domain/EpsPort";
import { EPS as EPSEntity } from "../entities/Eps";
import { EPS as EPSDomain } from "../../domain/Eps";
import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-base";

export class EpsAdapter implements EpsPort {

    private epsRepository: Repository<EPSEntity>;

    constructor() {
        this.epsRepository = AppDataSource.getRepository(EPSEntity);
    }

    // Transforma la entidad de infraestructura a dominio
    private toDomain(epsEntity: EPSEntity): EPSDomain {
        return {
            id_eps: epsEntity.id_eps,
            nombre: epsEntity.nombre,
            tipo: epsEntity.tipo,
            fecha_registro: epsEntity.fecha_registro,
            estado: epsEntity.estado
        };
    }

    // Transforma el modelo de dominio a la entidad de infraestructura
    private toEntity(epsDomain: Omit<EPSDomain, "id_eps">): Omit<EPSEntity, "id_eps"> {
        const epsEntity = new EPSEntity();
        epsEntity.nombre = epsDomain.nombre;
        epsEntity.tipo = epsDomain.tipo;
        epsEntity.fecha_registro = epsDomain.fecha_registro;
        epsEntity.estado = epsDomain.estado;
        return epsEntity;
    }

    async createEps(eps: Omit<EPSDomain, "id_eps">): Promise<number> {
        try {
            const epsEntity = this.toEntity(eps);
            const newEps = await this.epsRepository.save(epsEntity);
            return newEps.id_eps;
        } catch (error) {
            console.error("Error creating EPS:", error);
            throw new Error("Failed to create EPS");
        }
    }

    async updateEps(id: number, eps: Partial<EPSDomain>): Promise<boolean> {
        try {
            const existingEps = await this.epsRepository.findOne({ where: { id_eps: id } });
            if (!existingEps) return false;

            if (eps.nombre) existingEps.nombre = eps.nombre;
            if (eps.tipo) existingEps.tipo = eps.tipo;
            if (eps.fecha_registro) existingEps.fecha_registro = eps.fecha_registro;
            if (eps.estado !== undefined) existingEps.estado = eps.estado;

            await this.epsRepository.save(existingEps);
            return true;
        } catch (error) {
            console.error("Error updating EPS:", error);
            throw new Error("Failed to update EPS");
        }
    }

    async deleteEps(id: number): Promise<boolean> {
        try {
            const existingEps = await this.epsRepository.findOne({ where: { id_eps: id } });
            if (!existingEps) return false;
            // Puedes cambiar el estado a "inactivo" o eliminar el registro físicamente
            existingEps.estado = "inactivo";
            await this.epsRepository.save(existingEps);
            return true;
        } catch (error) {
            console.error("Error deleting EPS:", error);
            throw new Error("Failed to delete EPS");
        }
    }

    async getEpsById(id: number): Promise<EPSDomain | null> {
        try {
            const eps = await this.epsRepository.findOne({ where: { id_eps: id } });
            return eps ? this.toDomain(eps) : null;
        } catch (error) {
            console.error("Error fetching EPS by ID:", error);
            throw new Error("Failed to fetch EPS by ID");
        }
    }

    async getAllEps(): Promise<EPSDomain[]> {
        try {
            const epsList = await this.epsRepository.find();
            return epsList.map(eps => this.toDomain(eps));
        } catch (error) {
            console.error("Error fetching all EPS:", error);
            throw new Error("Failed to fetch all EPS");
        }
    }

    async getEpsByNombre(nombre: string): Promise<EPSDomain | null> {
        try {
            const eps = await this.epsRepository.findOne({ where: { nombre } });
            return eps ? this.toDomain(eps) : null;
        } catch (error) {
            console.error("Error fetching EPS by nombre:", error);
            throw new Error("Failed to fetch EPS by nombre");
        }
    }
}
