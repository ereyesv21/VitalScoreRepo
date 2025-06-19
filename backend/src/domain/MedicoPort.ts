import { Medicos } from "./Medico";

export interface MedicoPort {
    createMedico(medico: Omit<Medicos, 'id_medico'>): Promise<number>;
    updateMedico(id: number, medico: Partial<Medicos>): Promise<boolean>;
    deleteMedico(id: number): Promise<boolean>;
    getMedicoById(id: number): Promise<Medicos | null>;
    getAllMedicos(): Promise<Medicos[]>;
    getMedicoByEspecialidad(especialidad: string): Promise<Medicos[]>;
    getMedicoByUsuario(usuario: number): Promise<Medicos | null>;
    getMedicoByEps(eps: number): Promise<Medicos[]>;
}
