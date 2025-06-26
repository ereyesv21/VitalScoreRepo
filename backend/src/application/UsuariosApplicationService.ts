import { UsuariosPort } from "../domain/UsuariosPort";
import { Usuarios } from "../domain/Usuarios";
import bcrypt from 'bcryptjs';
import { AuthService } from './AuthService';
import { PacientesAdapter } from '../infraestructure/adapter/PacientesAdapter';
import { MedicoAdapter } from '../infraestructure/adapter/MedicoAdapter';
import { AdministradoresApplicationService } from './AdministradoresApplicationService';

export class UsuariosApplicationService {
    private readonly usuariosPort: UsuariosPort;
    private readonly pacientesAdapter: PacientesAdapter;
    private readonly medicoAdapter: MedicoAdapter;
    private readonly administradoresAppService?: AdministradoresApplicationService;

    constructor(usuariosPort: UsuariosPort, pacientesAdapter: PacientesAdapter, medicoAdapter: MedicoAdapter, administradoresAppService?: AdministradoresApplicationService) {
        this.usuariosPort = usuariosPort;
        this.pacientesAdapter = pacientesAdapter;
        this.medicoAdapter = medicoAdapter;
        this.administradoresAppService = administradoresAppService;
    }

     //Login 
    async login(correo: string, contraseña: string): Promise<string> {
        const existingUser = await this.usuariosPort.getUsuarioByCorreo(correo);

        if (!existingUser) {
            throw new Error('Credenciales incorrectas');
        }

        const passwordMatch = await bcrypt.compare(contraseña, existingUser.contraseña)

        if (!passwordMatch) {
            throw new Error('Credenciales incorrectas');
        }

        // Generar un token JWT (aquí se puede usar una librería como jsonwebtoken)
        const token = AuthService.generateToken({ id: existingUser.id_usuario, email: existingUser.correo });
        return token;
    }
    

    async createUsuario(usuarioData: Omit<Usuarios, "id_usuario">): Promise<number> {
        // Validar si el correo ya existe
        const existingUser = await this.usuariosPort.getUsuarioByCorreo(usuarioData.correo);
        if (existingUser) {
            throw new Error("El usuario con este correo ya existe");
        }
        // Hashear la contraseña antes de guardar
        const hashedPassword = await bcrypt.hash(usuarioData.contraseña, 10);
        const usuarioConHash = { ...usuarioData, contraseña: hashedPassword };
        return await this.usuariosPort.createUsuario(usuarioConHash);
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
        // Validar si el usuario existe
        const usuarioExistente = await this.usuariosPort.getUsuarioById(id);
        if (!usuarioExistente) {
            throw new Error("El usuario no existe");
        }
        // Si se actualiza el correo, verificar que no esté en uso por otro usuario
        if (usuarioData.correo && usuarioData.correo !== usuarioExistente.correo) {
            const usuarioConCorreo = await this.usuariosPort.getUsuarioByCorreo(usuarioData.correo);
            if (usuarioConCorreo && usuarioConCorreo.id_usuario !== id) {
                throw new Error("El correo ya está en uso por otro usuario");
            }
        }
        // Si se actualiza la contraseña, hashearla
        let datosActualizados = { ...usuarioData };
        if (usuarioData.contraseña) {
            datosActualizados.contraseña = await bcrypt.hash(usuarioData.contraseña, 10);
        }
        return await this.usuariosPort.updateUsuario(id, datosActualizados);
    }

    async deleteUsuario(id: number): Promise<boolean> {
        // Validar si el usuario existe
        const usuarioExistente = await this.usuariosPort.getUsuarioById(id);
        if (!usuarioExistente) {
            throw new Error("El usuario no existe");
        }
        return await this.usuariosPort.deleteUsuario(id);
    }

    async createPacienteProfile(usuarioId: number, profileData: { puntos: number, id_eps: number }): Promise<number> {
        const pacienteData = {
            usuario: usuarioId,
            puntos: profileData.puntos,
            id_eps: profileData.id_eps
        };
        return await this.pacientesAdapter.createPaciente(pacienteData);
    }

    async createMedicoProfile(usuarioId: number, profileData: { especialidad: string, eps: number }): Promise<number> {
        const medicoData = {
            usuario: usuarioId,
            especialidad: Number(profileData.especialidad),
            eps: profileData.eps
        };
        return await this.medicoAdapter.createMedico(medicoData);
    }

    async createAdministradorProfile(usuarioId: number): Promise<number | undefined> {
        if (!this.administradoresAppService) throw new Error('Servicio de administradores no disponible');
        return await this.administradoresAppService.createAdministrador({ usuario: usuarioId });
    }
} 