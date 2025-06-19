import { AdministradoresPort } from "../../domain/AdministradoresPort";
import { Administrador as AdministradorEntity } from "../entities/Administradores";
import { Administradores as AdministradorDomain } from "../../domain/Administradores";
import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-base";
import { Usuario } from "../entities/Usuarios";

export class AdministradoresAdapter implements AdministradoresPort {
    private administradorRepository: Repository<AdministradorEntity>;

    constructor() {
        this.administradorRepository = AppDataSource.getRepository(AdministradorEntity);
    }

    // Transforma la entidad de infraestructura al modelo de dominio
    private toDomain(administradorEntity: AdministradorEntity): AdministradorDomain {
        return {
            id_administrador: administradorEntity.id_administrador,
            usuario: administradorEntity.usuario ? administradorEntity.usuario.id_usuario : 0
        };
    }

    // Transforma el modelo de dominio a la entidad de infraestructura
    private toEntity(administradorDomain: Omit<AdministradorDomain, "id_administrador">, usuarioEntity: Usuario): Omit<AdministradorEntity, "id_administrador"> {
        const administradorEntity = new AdministradorEntity();
        administradorEntity.usuario = usuarioEntity;
        return administradorEntity;
    }

    async createAdministrador(administrador: Omit<AdministradorDomain, "id_administrador">): Promise<number> {
        try {
            // Busca el objeto Usuario por id
            const usuarioRepository = this.administradorRepository.manager.getRepository(Usuario);
            const usuarioEntity = await usuarioRepository.findOne({ where: { id_usuario: administrador.usuario } });
            if (!usuarioEntity) throw new Error("Usuario no encontrado");

            // Crea el administradorEntity y asigna el objeto relacionado
            const administradorEntity = this.toEntity(administrador, usuarioEntity) as AdministradorEntity;
            const newAdministrador = await this.administradorRepository.save(administradorEntity);
            return newAdministrador.id_administrador;
        } catch (error) {
            console.error("Error creating administrador:", error);
            throw new Error("Failed to create administrador");
        }
    }

    async updateAdministrador(id: number, administrador: Partial<AdministradorDomain>): Promise<boolean> {
        try {
            const existingAdministrador = await this.administradorRepository.findOne({ where: { id_administrador: id }, relations: ["usuario"] });
            if (!existingAdministrador) return false;

            // Si se actualiza el usuario, buscar la nueva entidad
            if (administrador.usuario) {
                const usuarioRepository = this.administradorRepository.manager.getRepository(Usuario);
                const usuarioEntity = await usuarioRepository.findOne({ where: { id_usuario: administrador.usuario } });
                if (!usuarioEntity) throw new Error("Usuario no encontrado");
                existingAdministrador.usuario = usuarioEntity;
            }

            await this.administradorRepository.save(existingAdministrador);
            return true;
        } catch (error) {
            console.error("Error updating administrador:", error);
            throw new Error("Failed to update administrador");
        }
    }

    async deleteAdministrador(id: number): Promise<boolean> {
        try {
            const existingAdministrador = await this.administradorRepository.findOne({ where: { id_administrador: id } });
            if (!existingAdministrador) return false;
            await this.administradorRepository.remove(existingAdministrador);
            return true;
        } catch (error) {
            console.error("Error deleting administrador:", error);
            throw new Error("Failed to delete administrador");
        }
    }

    async getAdministradorById(id: number): Promise<AdministradorDomain | null> {
        try {
            const administrador = await this.administradorRepository.findOne({ where: { id_administrador: id }, relations: ["usuario"] });
            return administrador ? this.toDomain(administrador) : null;
        } catch (error) {
            console.error("Error fetching administrador by ID:", error);
            throw new Error("Failed to fetch administrador by ID");
        }
    }

    async getAllAdministradores(): Promise<AdministradorDomain[]> {
        try {
            const administradores = await this.administradorRepository.find({ relations: ["usuario"] });
            return administradores.map(administrador => this.toDomain(administrador));
        } catch (error) {
            console.error("Error fetching all administradores:", error);
            throw new Error("Failed to fetch all administradores");
        }
    }

    async getAdministradorByUsuario(usuario: number): Promise<AdministradorDomain | null> {
        try {
            const administrador = await this.administradorRepository.findOne({ where: { usuario: { id_usuario: usuario } }, relations: ["usuario"] });
            return administrador ? this.toDomain(administrador) : null;
        } catch (error) {
            console.error("Error fetching administrador by usuario:", error);
            throw new Error("Failed to fetch administrador by usuario");
        }
    }
}
