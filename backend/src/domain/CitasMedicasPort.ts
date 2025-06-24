import { CitasMedicas } from "./CitasMedicas";

export interface CitasMedicasPort {
    createCitaMedica(cita: Omit<CitasMedicas, 'id_cita' | 'fecha_creacion' | 'fecha_modificacion'>): Promise<number>;
    updateCitaMedica(id: number, cita: Partial<CitasMedicas>): Promise<boolean>;
    deleteCitaMedica(id: number): Promise<boolean>;
    getCitaMedicaById(id: number): Promise<CitasMedicas | null>;
    getAllCitasMedicas(): Promise<CitasMedicas[]>;
    getCitasMedicasByPaciente(paciente: number): Promise<CitasMedicas[]>;
    getCitasMedicasByMedico(medico: number): Promise<CitasMedicas[]>;
    getCitasMedicasByEstado(estado: CitasMedicas['estado']): Promise<CitasMedicas[]>;
    getCitasMedicasByFecha(fecha: Date): Promise<CitasMedicas[]>;
    getCitasMedicasByMedicoAndFecha(medico: number, fecha: Date): Promise<CitasMedicas[]>;
    getCitasMedicasByPacienteAndFecha(paciente: number, fecha: Date): Promise<CitasMedicas[]>;
    getCitasMedicasProximas(dias: number): Promise<CitasMedicas[]>;
    getCitasMedicasVencidas(): Promise<CitasMedicas[]>;
} 