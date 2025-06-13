import { Usuarios } from "./Usuarios";

export interface UsuariosPort {
    createUsuario(usuario: Omit<Usuarios, 'id_usuario'>): Promise<number>;
    updateUsuario(id: number, usuario: Partial<Usuarios>): Promise<boolean>;
    deleteUsuario(id: number): Promise<boolean>;
    getUsuarioById(id: number): Promise<Usuarios | null>;
    getAllUsuarios(): Promise<Usuarios[]>;
    getUsuarioByCorreo(correo: string): Promise<Usuarios | null>;
} 