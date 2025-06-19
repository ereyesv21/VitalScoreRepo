import { Administradores } from "./Administradores";

export interface AdministradoresPort {
    createAdministrador(administrador: Omit<Administradores, 'id_administrador'>): Promise<number>;
    updateAdministrador(id: number, administrador: Partial<Administradores>): Promise<boolean>;
    deleteAdministrador(id: number): Promise<boolean>;
    getAdministradorById(id: number): Promise<Administradores | null>;
    getAllAdministradores(): Promise<Administradores[]>;
    getAdministradorByUsuario(usuario: number): Promise<Administradores | null>;
}
