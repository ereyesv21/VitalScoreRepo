import { AdministradoresPort } from "../domain/AdministradoresPort";
import { Administradores } from "../domain/Administradores";
import { UsuariosPort } from "../domain/UsuariosPort";

export class AdministradoresApplicationService {
    private readonly administradoresPort: AdministradoresPort;
    private readonly usuariosPort: UsuariosPort;

    constructor(administradoresPort: AdministradoresPort, usuariosPort: UsuariosPort) {
        this.administradoresPort = administradoresPort;
        this.usuariosPort = usuariosPort;
    }

    async createAdministrador(administradorData: Omit<Administradores, "id_administrador">): Promise<number> {
        // Validar que el usuario existe
        const usuarioExistente = await this.usuariosPort.getUsuarioById(administradorData.usuario);
        if (!usuarioExistente) {
            throw new Error("El usuario especificado no existe");
        }
        // Validar que el usuario no sea ya un administrador
        const adminExistente = await this.administradoresPort.getAdministradorByUsuario(administradorData.usuario);
        if (adminExistente) {
            throw new Error("Este usuario ya está registrado como administrador");
        }
        return await this.administradoresPort.createAdministrador(administradorData);
    }

    async getAllAdministradores(): Promise<Administradores[]> {
        return await this.administradoresPort.getAllAdministradores();
    }

    async getAdministradorById(id: number): Promise<Administradores | null> {
        return await this.administradoresPort.getAdministradorById(id);
    }

    async getAdministradorByUsuario(usuario: number): Promise<Administradores | null> {
        return await this.administradoresPort.getAdministradorByUsuario(usuario);
    }

    async updateAdministrador(id: number, administradorData: Partial<Administradores>): Promise<boolean> {
        // Validar que el administrador existe
        const adminExistente = await this.administradoresPort.getAdministradorById(id);
        if (!adminExistente) {
            throw new Error("El administrador no existe");
        }
        // Si se actualiza el usuario, validar que existe y no es ya otro administrador
        if (administradorData.usuario && administradorData.usuario !== adminExistente.usuario) {
            const usuarioExistente = await this.usuariosPort.getUsuarioById(administradorData.usuario);
            if (!usuarioExistente) {
                throw new Error("El usuario especificado no existe");
            }
            const otroAdmin = await this.administradoresPort.getAdministradorByUsuario(administradorData.usuario);
            if (otroAdmin && otroAdmin.id_administrador !== id) {
                throw new Error("Este usuario ya está registrado como administrador");
            }
        }
        return await this.administradoresPort.updateAdministrador(id, administradorData);
    }

    async deleteAdministrador(id: number): Promise<boolean> {
        // Validar que el administrador existe
        const adminExistente = await this.administradoresPort.getAdministradorById(id);
        if (!adminExistente) {
            throw new Error("El administrador no existe");
        }
        return await this.administradoresPort.deleteAdministrador(id);
    }
}
