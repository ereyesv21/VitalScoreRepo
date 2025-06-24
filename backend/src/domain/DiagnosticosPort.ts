import { Diagnosticos } from "./Diagnosticos";

export interface DiagnosticosPort {
    createDiagnostico(diagnostico: Omit<Diagnosticos, 'id_diagnostico' | 'fecha_creacion'>): Promise<number>;
    updateDiagnostico(id: number, diagnostico: Partial<Diagnosticos>): Promise<boolean>;
    deleteDiagnostico(id: number): Promise<boolean>;
    getDiagnosticoById(id: number): Promise<Diagnosticos | null>;
    getAllDiagnosticos(): Promise<Diagnosticos[]>;
    getDiagnosticosByPaciente(paciente: number): Promise<Diagnosticos[]>;
    getDiagnosticosByMedico(medico: number): Promise<Diagnosticos[]>;
    getDiagnosticosByCita(cita: number): Promise<Diagnosticos[]>;
    getDiagnosticosByEnfermedad(enfermedad: number): Promise<Diagnosticos[]>;
    getDiagnosticosByEstado(estado: Diagnosticos['estado']): Promise<Diagnosticos[]>;
    getDiagnosticosByFecha(fecha: Date): Promise<Diagnosticos[]>;
    getDiagnosticosByPacienteAndEstado(paciente: number, estado: Diagnosticos['estado']): Promise<Diagnosticos[]>;
    getDiagnosticosByMedicoAndEstado(medico: number, estado: Diagnosticos['estado']): Promise<Diagnosticos[]>;
    getDiagnosticosActivos(): Promise<Diagnosticos[]>;
    getDiagnosticosRecientes(dias: number): Promise<Diagnosticos[]>;
} 