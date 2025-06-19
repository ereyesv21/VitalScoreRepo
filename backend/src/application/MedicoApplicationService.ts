import { MedicoPort } from "../domain/MedicoPort";
import { Medicos } from "../domain/Medico";
import { UsuariosPort } from "../domain/UsuariosPort";
import { EpsPort } from "../domain/EpsPort";


//logica de negocio 
export class MedicoApplicationService {
    private readonly medicoPort: MedicoPort;
    private readonly usuariosPort: UsuariosPort;
    private readonly epsPort: EpsPort;

    constructor(medicoPort: MedicoPort, usuariosPort: UsuariosPort, epsPort: EpsPort) {
        this.medicoPort = medicoPort;
        this.usuariosPort = usuariosPort;
        this.epsPort = epsPort;
    }

    async createMedico(medicoData: Omit<Medicos, "id_medico">): Promise<number> {
        // Validar que el usuario existe
        const usuarioExistente = await this.usuariosPort.getUsuarioById(medicoData.usuario);
        if (!usuarioExistente) {
            throw new Error("El usuario especificado no existe");
        }

        // Validar que la EPS existe
        const epsExistente = await this.epsPort.getEpsById(medicoData.eps);
        if (!epsExistente) {
            throw new Error("La EPS especificada no existe");
        }

        // Validar que el usuario no sea ya un médico
        const medicoExistente = await this.medicoPort.getMedicoByUsuario(medicoData.usuario);
        if (medicoExistente) {
            throw new Error("Este usuario ya está registrado como médico");
        }

        // Validar que la especialidad no esté vacía
        if (!medicoData.especialidad || medicoData.especialidad.trim().length === 0) {
            throw new Error("La especialidad es requerida");
        }


        return await this.medicoPort.createMedico(medicoData);
    }

    async getAllMedicos(): Promise<Medicos[]> {
        return await this.medicoPort.getAllMedicos();
    }

    async getMedicoById(id: number): Promise<Medicos | null> {
        return await this.medicoPort.getMedicoById(id);
    }

    async getMedicoByEspecialidad(especialidad: string): Promise<Medicos[]> {
        if (!especialidad || especialidad.trim().length === 0) {
            throw new Error("La especialidad es requerida para la búsqueda");
        }
        return await this.medicoPort.getMedicoByEspecialidad(especialidad);
    }

    async getMedicoByUsuario(usuario: number): Promise<Medicos | null> {
        return await this.medicoPort.getMedicoByUsuario(usuario);
    }

    async getMedicoByEps(eps: number): Promise<Medicos[]> {
        // Validar que la EPS existe
        const epsExistente = await this.epsPort.getEpsById(eps);
        if (!epsExistente) {
            throw new Error("La EPS especificada no existe");
        }
        return await this.medicoPort.getMedicoByEps(eps);
    }

    async updateMedico(id: number, medicoData: Partial<Medicos>): Promise<boolean> {
        // Validar que el médico existe
        const medicoExistente = await this.medicoPort.getMedicoById(id);
        if (!medicoExistente) {
            throw new Error("El médico no existe");
        }

        // Si se actualiza el usuario, validar que existe y no es ya otro médico
        if (medicoData.usuario && medicoData.usuario !== medicoExistente.usuario) {
            const usuarioExistente = await this.usuariosPort.getUsuarioById(medicoData.usuario);
            if (!usuarioExistente) {
                throw new Error("El usuario especificado no existe");
            }

            const otroMedico = await this.medicoPort.getMedicoByUsuario(medicoData.usuario);
            if (otroMedico && otroMedico.id_medico !== id) {
                throw new Error("Este usuario ya está registrado como médico");
            }
        }

        // Si se actualiza la EPS, validar que existe
        if (medicoData.eps) {
            const epsExistente = await this.epsPort.getEpsById(medicoData.eps);
            if (!epsExistente) {
                throw new Error("La EPS especificada no existe");
            }
        }

        // Validar que la especialidad no esté vacía si se actualiza
        if (medicoData.especialidad && medicoData.especialidad.trim().length === 0) {
            throw new Error("La especialidad no puede estar vacía");
        }


        return await this.medicoPort.updateMedico(id, medicoData);
    }

    async deleteMedico(id: number): Promise<boolean> {
        // Validar que el médico existe
        const medicoExistente = await this.medicoPort.getMedicoById(id);
        if (!medicoExistente) {
            throw new Error("El médico no existe");
        }
        return await this.medicoPort.deleteMedico(id);
    }
} 