import { PacientePort } from "../domain/PacientePort";
import { Pacientes } from "../domain/Paciente";
import { UsuariosPort } from "../domain/UsuariosPort";
import { EpsPort } from "../domain/EpsPort";

export class PacientesApplicationService {
    private readonly pacientePort: PacientePort;
    private readonly usuariosPort: UsuariosPort;
    private readonly epsPort: EpsPort;

    constructor(pacientePort: PacientePort, usuariosPort: UsuariosPort, epsPort: EpsPort) {
        this.pacientePort = pacientePort;
        this.usuariosPort = usuariosPort;
        this.epsPort = epsPort;
    }

    async createPaciente(pacienteData: Omit<Pacientes, "id_paciente">): Promise<number> {
        // Validar que el usuario existe
        const usuarioExistente = await this.usuariosPort.getUsuarioById(pacienteData.usuario);
        if (!usuarioExistente) {
            throw new Error("El usuario especificado no existe");
        }

        // Validar que la EPS existe
        const epsExistente = await this.epsPort.getEpsById(pacienteData.id_eps);
        if (!epsExistente) {
            throw new Error("La EPS especificada no existe");
        }

        // Validar que el usuario no sea ya un paciente
        const pacienteExistente = await this.pacientePort.getPacienteByUsuario(pacienteData.usuario);
        if (pacienteExistente) {
            throw new Error("Este usuario ya está registrado como paciente");
        }

        // Validar que los puntos no sean negativos
        if (pacienteData.puntos < 0) {
            throw new Error("Los puntos no pueden ser negativos");
        }

        // Validar que los puntos no excedan un límite razonable (ej: 10000)
        if (pacienteData.puntos > 10000) {
            throw new Error("Los puntos no pueden exceder 10,000");
        }

        return await this.pacientePort.createPaciente(pacienteData);
    }

    async getAllPacientes(): Promise<Pacientes[]> {
        return await this.pacientePort.getAllPacientes();
    }

    async getPacienteById(id: number): Promise<Pacientes | null> {
        return await this.pacientePort.getPacienteById(id);
    }

    async getPacienteByUsuario(usuario: number): Promise<Pacientes | null> {
        return await this.pacientePort.getPacienteByUsuario(usuario);
    }

    async getPacienteCompletoByUsuario(usuario: number): Promise<any> {
        const paciente = await this.pacientePort.getPacienteByUsuario(usuario);
        if (!paciente) {
            return null;
        }

        // Obtener datos del usuario
        const usuarioData = await this.usuariosPort.getUsuarioById(paciente.usuario);
        if (!usuarioData) {
            throw new Error("Datos de usuario no encontrados");
        }

        // Obtener datos de la EPS
        const epsData = await this.epsPort.getEpsById(paciente.id_eps);
        if (!epsData) {
            throw new Error("Datos de EPS no encontrados");
        }

        // Retornar datos completos
        return {
            ...paciente,
            usuario_data: {
                id_usuario: usuarioData.id_usuario,
                nombre: usuarioData.nombre,
                apellido: usuarioData.apellido,
                correo: usuarioData.correo,
                genero: usuarioData.genero,
                estado: usuarioData.estado
            },
            eps_data: {
                id_eps: epsData.id_eps,
                nombre: epsData.nombre
            }
        };
    }

    async getPacienteByEps(eps: number): Promise<Pacientes[]> {
        // Validar que la EPS existe
        const epsExistente = await this.epsPort.getEpsById(eps);
        if (!epsExistente) {
            throw new Error("La EPS especificada no existe");
        }
        return await this.pacientePort.getPacienteByEps(eps);
    }

    async getPacientesByPuntos(puntos: number): Promise<Pacientes[]> {
        // Validar que los puntos no sean negativos
        if (puntos < 0) {
            throw new Error("Los puntos no pueden ser negativos");
        }
        return await this.pacientePort.getPacientesByPuntos(puntos);
    }

    async updatePaciente(id: number, pacienteData: Partial<Pacientes>): Promise<boolean> {
        // Validar que el paciente existe
        const pacienteExistente = await this.pacientePort.getPacienteById(id);
        if (!pacienteExistente) {
            throw new Error("El paciente no existe");
        }

        // Si se actualiza el usuario, validar que existe y no es ya otro paciente
        if (pacienteData.usuario && pacienteData.usuario !== pacienteExistente.usuario) {
            const usuarioExistente = await this.usuariosPort.getUsuarioById(pacienteData.usuario);
            if (!usuarioExistente) {
                throw new Error("El usuario especificado no existe");
            }

            const otroPaciente = await this.pacientePort.getPacienteByUsuario(pacienteData.usuario);
            if (otroPaciente && otroPaciente.id_paciente !== id) {
                throw new Error("Este usuario ya está registrado como paciente");
            }
        }

        // Si se actualiza la EPS, validar que existe
        if (pacienteData.id_eps) {
            const epsExistente = await this.epsPort.getEpsById(pacienteData.id_eps);
            if (!epsExistente) {
                throw new Error("La EPS especificada no existe");
            }
        }

        // Validar que los puntos no sean negativos si se actualizan
        if (pacienteData.puntos !== undefined && pacienteData.puntos < 0) {
            throw new Error("Los puntos no pueden ser negativos");
        }

        // Validar que los puntos no excedan un límite razonable si se actualizan
        if (pacienteData.puntos !== undefined && pacienteData.puntos > 10000) {
            throw new Error("Los puntos no pueden exceder 10,000");
        }

        return await this.pacientePort.updatePaciente(id, pacienteData);
    }

    async deletePaciente(id: number): Promise<boolean> {
        // Validar que el paciente existe
        const pacienteExistente = await this.pacientePort.getPacienteById(id);
        if (!pacienteExistente) {
            throw new Error("El paciente no existe");
        }
        return await this.pacientePort.deletePaciente(id);
    }

    // Métodos adicionales de lógica de negocio específica para pacientes

    async addPuntos(id: number, puntosAAgregar: number): Promise<boolean> {
        // Validar que el paciente existe
        const pacienteExistente = await this.pacientePort.getPacienteById(id);
        if (!pacienteExistente) {
            throw new Error("El paciente no existe");
        }

        // Validar que los puntos a agregar sean positivos
        if (puntosAAgregar <= 0) {
            throw new Error("Los puntos a agregar deben ser positivos");
        }

        // Validar que no exceda el límite máximo
        const nuevosPuntos = pacienteExistente.puntos + puntosAAgregar;
        if (nuevosPuntos > 10000) {
            throw new Error("Los puntos totales no pueden exceder 10,000");
        }

        return await this.pacientePort.updatePaciente(id, { puntos: nuevosPuntos });
    }

    async subtractPuntos(id: number, puntosASustraer: number): Promise<boolean> {
        // Validar que el paciente existe
        const pacienteExistente = await this.pacientePort.getPacienteById(id);
        if (!pacienteExistente) {
            throw new Error("El paciente no existe");
        }

        // Validar que los puntos a sustraer sean positivos
        if (puntosASustraer <= 0) {
            throw new Error("Los puntos a sustraer deben ser positivos");
        }

        // Validar que no queden puntos negativos
        const nuevosPuntos = pacienteExistente.puntos - puntosASustraer;
        if (nuevosPuntos < 0) {
            throw new Error("Los puntos no pueden quedar negativos");
        }

        return await this.pacientePort.updatePaciente(id, { puntos: nuevosPuntos });
    }

    async getPacientesConPuntosAltos(limiteMinimo: number = 1000): Promise<Pacientes[]> {
        // Obtener todos los pacientes
        const todosLosPacientes = await this.pacientePort.getAllPacientes();
        
        // Filtrar por puntos altos
        return todosLosPacientes.filter(paciente => paciente.puntos >= limiteMinimo);
    }

    async getPacientesConPuntosBajos(limiteMaximo: number = 100): Promise<Pacientes[]> {
        // Obtener todos los pacientes
        const todosLosPacientes = await this.pacientePort.getAllPacientes();
        
        // Filtrar por puntos bajos
        return todosLosPacientes.filter(paciente => paciente.puntos <= limiteMaximo);
    }
}
