import { RecompensasPort } from "../../domain/RecompensasPort";
import { Recompensa as RecompensaEntity } from "../entities/Recompensas";
import { Recompensas as RecompensaDomain } from "../../domain/Recompensas";
import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-base";
import { EPS } from "../entities/Eps";

export class RecompensasAdapter implements RecompensasPort {
    private recompensaRepository: Repository<RecompensaEntity>;

    constructor() {
        this.recompensaRepository = AppDataSource.getRepository(RecompensaEntity);
    }

    // Transforma la entidad de infraestructura al modelo de dominio
    private toDomain(recompensaEntity: RecompensaEntity): RecompensaDomain {
        return {
            id_recompensa: recompensaEntity.id_recompensa,
            proveedor: recompensaEntity.proveedor ? recompensaEntity.proveedor.id_eps : 0,
            nombre: recompensaEntity.nombre,
            descripcion: recompensaEntity.descripcion,
            puntos_necesarios: recompensaEntity.puntos_necesarios,
            fecha_creacion: recompensaEntity.fecha_creacion,
            estado: recompensaEntity.estado
        };
    }

    // Transforma el modelo de dominio a la entidad de infraestructura
    private toEntity(recompensaDomain: Omit<RecompensaDomain, "id_recompensa">, epsEntity: EPS): Omit<RecompensaEntity, "id_recompensa"> {
        const recompensaEntity = new RecompensaEntity();
        recompensaEntity.proveedor = epsEntity;
        recompensaEntity.nombre = recompensaDomain.nombre;
        recompensaEntity.descripcion = recompensaDomain.descripcion;
        recompensaEntity.puntos_necesarios = recompensaDomain.puntos_necesarios;
        recompensaEntity.fecha_creacion = recompensaDomain.fecha_creacion;
        recompensaEntity.estado = recompensaDomain.estado;
        return recompensaEntity;
    }

    // Método para corregir la secuencia si es necesario
    private async fixSequenceIfNeeded(): Promise<void> {
        try {
            const queryRunner = this.recompensaRepository.manager.connection.createQueryRunner();
            await queryRunner.connect();
            
            // Obtener el máximo ID actual
            const maxIdResult = await queryRunner.query(
                'SELECT COALESCE(MAX(id_recompensa), 0) as max_id FROM "vitalscore"."Recompensas"'
            );
            const maxId = parseInt(maxIdResult[0]?.max_id || '0');
            
            // Corregir la secuencia
            await queryRunner.query(
                `SELECT setval('"vitalscore"."Recompensas_id_recompensa_seq"', ${maxId + 1}, false)`
            );
            
            await queryRunner.release();
        } catch (error) {
            console.warn("No se pudo corregir la secuencia automáticamente:", error);
        }
    }

    async createRecompensa(recompensa: Omit<RecompensaDomain, "id_recompensa">): Promise<number> {
        try {
            // Intentar corregir la secuencia antes de crear
            await this.fixSequenceIfNeeded();

            // Busca el objeto EPS por id
            const epsRepository = this.recompensaRepository.manager.getRepository(EPS);
            const epsEntity = await epsRepository.findOne({ where: { id_eps: recompensa.proveedor } });
            if (!epsEntity) throw new Error("EPS no encontrado");

            // Crea la recompensaEntity y asigna el objeto relacionado
            const recompensaEntity = this.toEntity(recompensa, epsEntity) as RecompensaEntity;

            const newRecompensa = await this.recompensaRepository.save(recompensaEntity);
            return newRecompensa.id_recompensa;
        } catch (error) {
            console.error("Error creating recompensa:", error);
            throw new Error("Failed to create recompensa");
        }
    }

    async updateRecompensa(id: number, recompensa: Partial<RecompensaDomain>): Promise<boolean> {
        try {
            const existingRecompensa = await this.recompensaRepository.findOne({ 
                where: { id_recompensa: id }, 
                relations: ["proveedor"] 
            });
            if (!existingRecompensa) return false;

            // Actualizar solo los campos enviados
            if (recompensa.nombre !== undefined) existingRecompensa.nombre = recompensa.nombre;
            if (recompensa.descripcion !== undefined) existingRecompensa.descripcion = recompensa.descripcion;
            if (recompensa.puntos_necesarios !== undefined) existingRecompensa.puntos_necesarios = recompensa.puntos_necesarios;
            if (recompensa.fecha_creacion !== undefined) existingRecompensa.fecha_creacion = recompensa.fecha_creacion;
            if (recompensa.estado !== undefined) existingRecompensa.estado = recompensa.estado;

            // Si se actualiza el proveedor, buscar la nueva entidad EPS
            if (recompensa.proveedor) {
                const epsRepository = this.recompensaRepository.manager.getRepository(EPS);
                const epsEntity = await epsRepository.findOne({ where: { id_eps: recompensa.proveedor } });
                if (!epsEntity) throw new Error("EPS no encontrado");
                existingRecompensa.proveedor = epsEntity;
            }

            await this.recompensaRepository.save(existingRecompensa);
            return true;
        } catch (error) {
            console.error("Error updating recompensa:", error);
            throw new Error("Failed to update recompensa");
        }
    }

    async deleteRecompensa(id: number): Promise<boolean> {
        try {
            const existingRecompensa = await this.recompensaRepository.findOne({ where: { id_recompensa: id } });
            if (!existingRecompensa) return false;
            
            // Cambiar el estado a "inactivo" en lugar de eliminar físicamente
            existingRecompensa.estado = "inactivo";
            await this.recompensaRepository.save(existingRecompensa);
            return true;
        } catch (error) {
            console.error("Error deleting recompensa:", error);
            throw new Error("Failed to delete recompensa");
        }
    }

    async getRecompensaById(id: number): Promise<RecompensaDomain | null> {
        try {
            const recompensa = await this.recompensaRepository.findOne({ 
                where: { id_recompensa: id }, 
                relations: ["proveedor"] 
            });
            return recompensa ? this.toDomain(recompensa) : null;
        } catch (error) {
            console.error("Error fetching recompensa by ID:", error);
            throw new Error("Failed to fetch recompensa by ID");
        }
    }

    async getAllRecompensas(): Promise<RecompensaDomain[]> {
        try {
            const recompensas = await this.recompensaRepository.find({ relations: ["proveedor"] });
            return recompensas.map(recompensa => this.toDomain(recompensa));
        } catch (error) {
            console.error("Error fetching all recompensas:", error);
            throw new Error("Failed to fetch all recompensas");
        }
    }

    async getRecompensasByProveedor(proveedor: number): Promise<RecompensaDomain[]> {
        try {
            const recompensas = await this.recompensaRepository.find({ 
                where: { proveedor: { id_eps: proveedor } }, 
                relations: ["proveedor"] 
            });
            return recompensas.map(recompensa => this.toDomain(recompensa));
        } catch (error) {
            console.error("Error fetching recompensas by proveedor:", error);
            throw new Error("Failed to fetch recompensas by proveedor");
        }
    }

    async getRecompensasByEstado(estado: string): Promise<RecompensaDomain[]> {
        try {
            const recompensas = await this.recompensaRepository.find({ 
                where: { estado: estado }, 
                relations: ["proveedor"] 
            });
            return recompensas.map(recompensa => this.toDomain(recompensa));
        } catch (error) {
            console.error("Error fetching recompensas by estado:", error);
            throw new Error("Failed to fetch recompensas by estado");
        }
    }

    async getRecompensasPorPuntos(puntosMin: number, puntosMax: number): Promise<RecompensaDomain[]> {
        try {
            const recompensas = await this.recompensaRepository.find({ 
                where: { 
                    puntos_necesarios: puntosMin
                }, 
                relations: ["proveedor"] 
            });
            return recompensas.map(recompensa => this.toDomain(recompensa));
        } catch (error) {
            console.error("Error fetching recompensas por puntos:", error);
            throw new Error("Failed to fetch recompensas por puntos");
        }
    }

    async getRecompensasPorFecha(fechaInicio: Date, fechaFin: Date): Promise<RecompensaDomain[]> {
        try {
            const recompensas = await this.recompensaRepository.find({ 
                where: { 
                    fecha_creacion: fechaInicio
                }, 
                relations: ["proveedor"] 
            });
            return recompensas.map(recompensa => this.toDomain(recompensa));
        } catch (error) {
            console.error("Error fetching recompensas por fecha:", error);
            throw new Error("Failed to fetch recompensas por fecha");
        }
    }
}
