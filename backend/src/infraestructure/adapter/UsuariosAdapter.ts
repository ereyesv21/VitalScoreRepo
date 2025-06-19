import { UsuariosPort } from "../../domain/UsuariosPort";
import {Usuario as UsuarioEntity} from "../entities/Usuarios"; //importamos la entidad usuario
import {Usuarios as UsuarioDomain} from "../../domain/Usuarios"; //importamos el usuario del dominio
import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-base";
import { Rol } from "../entities/Rol";

export class UsuariosAdapter implements UsuariosPort {

    private usuarioRepository: Repository<UsuarioEntity>;

    constructor() {
        this.usuarioRepository = AppDataSource.getRepository(UsuarioEntity); //obtenemos el repositorio de la entidad usuario
    }

    //Transforma la entidad de infraestructura(entidad Usuario.ts) al modelo de dominio (interface Usuario.ts)
    private toDomain(usuarioEntity: UsuarioEntity): UsuarioDomain {
        return {
            id_usuario: usuarioEntity.id_usuario,
            nombre: usuarioEntity.nombre,
            apellido: usuarioEntity.apellido,
            correo: usuarioEntity.correo,
            contraseña: usuarioEntity.contraseña,
            estado: usuarioEntity.estado,
            rol: usuarioEntity.rol ? usuarioEntity.rol.id_rol : 0,
            genero: usuarioEntity.genero
        };
    }
 
    //Transforma el modelo de dominio a la entidad de infraestructura
    private toEntity(usuarioDomain: Omit<UsuarioDomain, "id_usuario">, rolEntity: Rol): Omit<UsuarioEntity, "id_usuario"> {
        const usuarioEntity = new UsuarioEntity();
        usuarioEntity.nombre = usuarioDomain.nombre;
        usuarioEntity.apellido = usuarioDomain.apellido;
        usuarioEntity.correo = usuarioDomain.correo;
        usuarioEntity.contraseña = usuarioDomain.contraseña;
        usuarioEntity.estado = usuarioDomain.estado;
        usuarioEntity.rol = rolEntity;
        usuarioEntity.genero = usuarioDomain.genero;
        return usuarioEntity;
    }

    async createUsuario(usuario: Omit<UsuarioDomain, "id_usuario">): Promise<number> {
        try {
            // Busca el objeto Rol por id
            const rolRepository = this.usuarioRepository.manager.getRepository(Rol);
            const rolEntity = await rolRepository.findOne({ where: { id_rol: usuario.rol } });
            if (!rolEntity) throw new Error("Rol no encontrado");

            // Crea el usuarioEntity y asigna el objeto rol
            const usuarioEntity = this.toEntity(usuario, rolEntity) as UsuarioEntity;

            const newUsuario = await this.usuarioRepository.save(usuarioEntity);
            return newUsuario.id_usuario;
        } catch (error) {
            console.error("Error creating usuario:", error);
            throw new Error("Failed to create usuario");
        }
    }
    
    async updateUsuario(id: number, usuario: Partial<UsuarioDomain>): Promise<boolean> {
        try {
            const existingUsuario = await this.usuarioRepository.findOne({ where:{ id_usuario: id }});
            if (!existingUsuario) return false;

            //actualizar solo los campos enviados
            if (usuario.nombre) existingUsuario.nombre = usuario.nombre;
            if (usuario.correo) existingUsuario.correo = usuario.correo;
            if (usuario.contraseña) existingUsuario.contraseña = usuario.contraseña;
            if (usuario.estado !== undefined) existingUsuario.estado = usuario.estado;

            await this.usuarioRepository.save(existingUsuario);
            return true;
        } catch (error) {
            console.error("Error updating usuario:", error);
            throw new Error("Failed to update usuario");
        }
    }

    async deleteUsuario(id: number): Promise<boolean> {
        try {
            const existingUsuario = await this.usuarioRepository.findOne({ where: { id_usuario: id } });
            if (!existingUsuario) return false;
            //actualizar el estado del usuario a inactivo
            existingUsuario.estado = "inactivo";
            await this.usuarioRepository.save(existingUsuario);
            return true;
        } catch (error) {
            console.error("Error deleting usuario:", error);
            throw new Error("Failed to delete usuario");
        }
    }

    async getUsuarioById(id: number): Promise<UsuarioDomain | null> {
        try {
            const usuario = await this.usuarioRepository.findOne({ where: { id_usuario: id }, relations: ["rol"] });
            return usuario ? this.toDomain(usuario) : null;
        } catch (error) {
            console.error("Error fetching usuario by ID:", error);
            throw new Error("Failed to fetch usuario by ID");
        }
    }

    async getAllUsuarios(): Promise<UsuarioDomain[]> {
        try {
            const usuarios = await this.usuarioRepository.find({ relations: ["rol"] });
            return usuarios.map(usuario => this.toDomain(usuario));
        } catch (error) {
            console.error("Error fetching all usuarios:", error);
            throw new Error("Failed to fetch all usuarios");
        }
    }

    async getUsuarioByCorreo(correo: string): Promise<UsuarioDomain | null> {
        try {
            const usuario = await this.usuarioRepository.findOne({ where: { correo: correo }, relations: ["rol"] });
            return usuario ? this.toDomain(usuario) : null;
        } catch (error) {
            console.error("Error fetching usuario by correo:", error);
            throw new Error("Failed to fetch usuario by correo");
        }
    }
} 