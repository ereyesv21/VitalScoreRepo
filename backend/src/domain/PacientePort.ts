import { Pacientes } from "./Paciente";

export interface PacientePort {
    createPaciente(paciente: Omit<Pacientes, 'id_paciente'>): Promise<number>;
    updatePaciente(id: number, paciente: Partial<Pacientes>): Promise<boolean>;
    deletePaciente(id: number): Promise<boolean>;
    getPacienteById(id: number): Promise<Pacientes | null>;
    getAllPacientes(): Promise<Pacientes[]>;
    getPacienteByUsuario(usuario: number): Promise<Pacientes | null>;
    getPacienteByEps(eps: number): Promise<Pacientes[]>;
    getPacientesByPuntos(puntos: number): Promise<Pacientes[]>;
}
