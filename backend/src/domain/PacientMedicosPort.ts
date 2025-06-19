import { Pacientes_Medicos } from "./PacientMedicos";

export interface PacientMedicosPort {
    createRelacion(relacion: Omit<Pacientes_Medicos, 'id'>): Promise<number>;
    updateRelacion(id: number, relacion: Partial<Pacientes_Medicos>): Promise<boolean>;
    deleteRelacion(id: number): Promise<boolean>;
    getRelacionById(id: number): Promise<Pacientes_Medicos | null>;
    getAllRelaciones(): Promise<Pacientes_Medicos[]>;
    getRelacionesByPaciente(paciente: number): Promise<Pacientes_Medicos[]>;
    getRelacionesByMedico(medico: number): Promise<Pacientes_Medicos[]>;
    getRelacionesPorFecha(fechaInicio: Date, fechaFin: Date): Promise<Pacientes_Medicos[]>;
}
