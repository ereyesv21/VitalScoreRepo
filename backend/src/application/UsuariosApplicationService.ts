import { UsuariosPort } from "../domain/UsuariosPort";
import { Usuarios } from "../domain/Usuarios";

export class UsuariosApplicationService {
    private readonly usuariosPort: UsuariosPort;

    constructor(usuariosPort: UsuariosPort) {
        this.usuariosPort = usuariosPort;
    }

    async createUsuario(usuarioData: Omit<Usuarios, "id_usuario">): Promise<number> {
        return await this.usuariosPort.createUsuario(usuarioData);
    }

    async getAllUsuarios(): Promise<Usuarios[]> {
        return await this.usuariosPort.getAllUsuarios();
    }

    async getUsuarioById(id: number): Promise<Usuarios | null> {
        return await this.usuariosPort.getUsuarioById(id);
    }

    async getUsuarioByCorreo(correo: string): Promise<Usuarios | null> {
        return await this.usuariosPort.getUsuarioByCorreo(correo);
    }

    async updateUsuario(id: number, usuarioData: Partial<Usuarios>): Promise<boolean> {
        return await this.usuariosPort.updateUsuario(id, usuarioData);
    }

    async deleteUsuario(id: number): Promise<boolean> {
        return await this.usuariosPort.deleteUsuario(id);
    }
} 