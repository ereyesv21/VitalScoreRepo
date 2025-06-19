import { PacientMedicosPort } from "../domain/PacientMedicosPort";
import { Pacientes_Medicos } from "../domain/PacientMedicos";
import { PacientePort } from "../domain/PacientePort";
import { MedicoPort } from "../domain/MedicoPort";

export class PacientMedicosApplicationService {
    private readonly relacionPort: PacientMedicosPort;
    private readonly pacientePort: PacientePort;
    private readonly medicoPort: MedicoPort;

    constructor(
        relacionPort: PacientMedicosPort,
        pacientePort: PacientePort,
        medicoPort: MedicoPort
    ) {
        this.relacionPort = relacionPort;
        this.pacientePort = pacientePort;
        this.medicoPort = medicoPort;
    }

    async createRelacion(relacion: Omit<Pacientes_Medicos, "id">): Promise<number> {
        // Validar existencia de paciente
        const paciente = await this.pacientePort.getPacienteById(relacion.Paciente);
        if (!paciente) {
            throw new Error("El paciente especificado no existe");
        }
        // Validar existencia de médico
        const medico = await this.medicoPort.getMedicoById(relacion.Medico);
        if (!medico) {
            throw new Error("El médico especificado no existe");
        }
        // Validar fecha de asignación
        if (!relacion.fecha_asignacion || isNaN(new Date(relacion.fecha_asignacion).getTime())) {
            throw new Error("La fecha de asignación es inválida");
        }
        return await this.relacionPort.createRelacion(relacion);
    }

    async updateRelacion(id: number, relacion: Partial<Pacientes_Medicos>): Promise<boolean> {
        // Validar existencia de la relación
        const existente = await this.relacionPort.getRelacionById(id);
        if (!existente) {
            throw new Error("La relación paciente-médico no existe");
        }
        // Si se actualiza el paciente, validar que existe
        if (relacion.Paciente) {
            const paciente = await this.pacientePort.getPacienteById(relacion.Paciente);
            if (!paciente) {
                throw new Error("El paciente especificado no existe");
            }
        }
        // Si se actualiza el médico, validar que existe
        if (relacion.Medico) {
            const medico = await this.medicoPort.getMedicoById(relacion.Medico);
            if (!medico) {
                throw new Error("El médico especificado no existe");
            }
        }
        // Si se actualiza la fecha, validar
        if (relacion.fecha_asignacion !== undefined && isNaN(new Date(relacion.fecha_asignacion).getTime())) {
            throw new Error("La fecha de asignación es inválida");
        }
        return await this.relacionPort.updateRelacion(id, relacion);
    }

    async deleteRelacion(id: number): Promise<boolean> {
        // Validar existencia de la relación
        const existente = await this.relacionPort.getRelacionById(id);
        if (!existente) {
            throw new Error("La relación paciente-médico no existe");
        }
        return await this.relacionPort.deleteRelacion(id);
    }

    async getRelacionById(id: number): Promise<Pacientes_Medicos | null> {
        return await this.relacionPort.getRelacionById(id);
    }

    async getAllRelaciones(): Promise<Pacientes_Medicos[]> {
        return await this.relacionPort.getAllRelaciones();
    }

    async getRelacionesByPaciente(paciente: number): Promise<Pacientes_Medicos[]> {
        // Validar existencia de paciente
        const existe = await this.pacientePort.getPacienteById(paciente);
        if (!existe) {
            throw new Error("El paciente especificado no existe");
        }
        return await this.relacionPort.getRelacionesByPaciente(paciente);
    }

    async getRelacionesByMedico(medico: number): Promise<Pacientes_Medicos[]> {
        // Validar existencia de médico
        const existe = await this.medicoPort.getMedicoById(medico);
        if (!existe) {
            throw new Error("El médico especificado no existe");
        }
        return await this.relacionPort.getRelacionesByMedico(medico);
    }

    async getRelacionesPorFecha(fechaInicio: Date, fechaFin: Date): Promise<Pacientes_Medicos[]> {
        // Validar fechas
        if (!fechaInicio || !fechaFin || isNaN(new Date(fechaInicio).getTime()) || isNaN(new Date(fechaFin).getTime())) {
            throw new Error("Las fechas de inicio y fin son requeridas y deben ser válidas");
        }
        if (fechaInicio >= fechaFin) {
            throw new Error("La fecha de inicio debe ser anterior a la fecha de fin");
        }
        return await this.relacionPort.getRelacionesPorFecha(fechaInicio, fechaFin);
    }
}
