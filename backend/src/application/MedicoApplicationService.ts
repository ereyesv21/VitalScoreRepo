import { MedicoPort } from "../domain/MedicoPort";
import { Medicos } from "../domain/Medico";
import { UsuariosPort } from "../domain/UsuariosPort";
import { EpsPort } from "../domain/EpsPort";
import { CitasMedicasPort } from "../domain/CitasMedicasPort";
import { PacientePort } from "../domain/PacientePort";


//logica de negocio 
export class MedicoApplicationService {
    private readonly medicoPort: MedicoPort;
    private readonly usuariosPort: UsuariosPort;
    private readonly epsPort: EpsPort;
    private readonly citasMedicasPort: CitasMedicasPort;
    private readonly pacientePort: PacientePort;

    constructor(medicoPort: MedicoPort, usuariosPort: UsuariosPort, epsPort: EpsPort, citasMedicasPort?: CitasMedicasPort, pacientePort?: PacientePort) {
        this.medicoPort = medicoPort;
        this.usuariosPort = usuariosPort;
        this.epsPort = epsPort;
        this.citasMedicasPort = citasMedicasPort!;
        this.pacientePort = pacientePort!;
    }

    // Nuevo método: Obtener citas médicas por médico
    async getCitasMedicasByMedico(medicoId: number): Promise<any[]> {
        if (!this.citasMedicasPort) {
            throw new Error("Servicio de citas médicas no disponible");
        }
        return await this.citasMedicasPort.getCitasMedicasByMedico(medicoId);
    }

    // Nuevo método: Obtener pacientes por médico
    async getPacientesByMedico(medicoId: number): Promise<any[]> {
        if (!this.pacientePort) {
            throw new Error("Servicio de pacientes no disponible");
        }
        // Obtener todas las citas del médico y extraer los pacientes únicos
        const citas = await this.citasMedicasPort.getCitasMedicasByMedico(medicoId);
        const pacientesIds = [...new Set(citas.map(cita => cita.paciente))];
        
        const pacientes = [];
        for (const pacienteId of pacientesIds) {
            const paciente = await this.pacientePort.getPacienteById(pacienteId);
            if (paciente) {
                pacientes.push(paciente);
            }
        }
        
        return pacientes;
    }

    // Nuevo método: Obtener estadísticas del médico
    async getMedicoStats(medicoId: number): Promise<any> {
        if (!this.citasMedicasPort) {
            throw new Error("Servicio de citas médicas no disponible");
        }

        const citas = await this.citasMedicasPort.getCitasMedicasByMedico(medicoId);
        const pacientes = await this.getPacientesByMedico(medicoId);

        const stats = {
            totalCitas: citas.length,
            citasProgramadas: citas.filter(cita => cita.estado === 'programada').length,
            citasConfirmadas: citas.filter(cita => cita.estado === 'confirmada').length,
            citasCompletadas: citas.filter(cita => cita.estado === 'completada').length,
            citasCanceladas: citas.filter(cita => cita.estado === 'cancelada').length,
            totalPacientes: pacientes.length,
            citasHoy: citas.filter(cita => {
                const hoy = new Date();
                const fechaCita = new Date(cita.fecha_cita);
                return fechaCita.toDateString() === hoy.toDateString();
            }).length
        };

        return stats;
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
        if (!medicoData.especialidad || isNaN(Number(medicoData.especialidad))) {
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

    async getMedicoByEspecialidad(especialidad: number): Promise<Medicos[]> {
        if (!especialidad || isNaN(Number(especialidad))) {
            throw new Error("La especialidad es requerida para la búsqueda");
        }
        return await this.medicoPort.getMedicoByEspecialidad(Number(especialidad));
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
        if (medicoData.especialidad !== undefined && isNaN(Number(medicoData.especialidad))) {
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