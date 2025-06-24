import { DiagnosticosPort } from "../domain/DiagnosticosPort";
import { Diagnosticos } from "../domain/Diagnosticos";
import { PacientePort } from "../domain/PacientePort";
import { MedicoPort } from "../domain/MedicoPort";
import { CitasMedicasPort } from "../domain/CitasMedicasPort";

export class DiagnosticosApplicationService {
    private readonly diagnosticosPort: DiagnosticosPort;
    private readonly pacientePort: PacientePort;
    private readonly medicoPort: MedicoPort;
    private readonly citasMedicasPort: CitasMedicasPort;

    constructor(diagnosticosPort: DiagnosticosPort, pacientePort: PacientePort, medicoPort: MedicoPort, citasMedicasPort: CitasMedicasPort) {
        this.diagnosticosPort = diagnosticosPort;
        this.pacientePort = pacientePort;
        this.medicoPort = medicoPort;
        this.citasMedicasPort = citasMedicasPort;
    }

    async createDiagnostico(diagnosticoData: Omit<Diagnosticos, "id_diagnostico" | "fecha_creacion">): Promise<number> {
        // Validar que el paciente existe
        const pacienteExistente = await this.pacientePort.getPacienteById(diagnosticoData.paciente);
        if (!pacienteExistente) {
            throw new Error("El paciente especificado no existe");
        }

        // Validar que el médico existe
        const medicoExistente = await this.medicoPort.getMedicoById(diagnosticoData.medico);
        if (!medicoExistente) {
            throw new Error("El médico especificado no existe");
        }

        // Validar que la cita existe si se proporciona
        if (diagnosticoData.cita) {
            const citaExistente = await this.citasMedicasPort.getCitaMedicaById(diagnosticoData.cita);
            if (!citaExistente) {
                throw new Error("La cita médica especificada no existe");
            }
        }

        // Validar que el diagnóstico no esté vacío
        if (!diagnosticoData.diagnostico || diagnosticoData.diagnostico.trim() === '') {
            throw new Error("El diagnóstico es requerido y no puede estar vacío");
        }

        // Validar que la fecha de diagnóstico no sea en el futuro
        const fechaDiagnostico = new Date(diagnosticoData.fecha_diagnostico);
        const fechaActual = new Date();
        fechaActual.setHours(0, 0, 0, 0);
        
        if (fechaDiagnostico > fechaActual) {
            throw new Error("La fecha de diagnóstico no puede ser en el futuro");
        }

        // Validar que el estado sea válido
        const estadosValidos: Diagnosticos['estado'][] = ['activo', 'inactivo', 'resuelto', 'pendiente'];
        if (!estadosValidos.includes(diagnosticoData.estado)) {
            throw new Error("El estado del diagnóstico no es válido");
        }

        return await this.diagnosticosPort.createDiagnostico(diagnosticoData);
    }

    async getAllDiagnosticos(): Promise<Diagnosticos[]> {
        return await this.diagnosticosPort.getAllDiagnosticos();
    }

    async getDiagnosticoById(id: number): Promise<Diagnosticos | null> {
        return await this.diagnosticosPort.getDiagnosticoById(id);
    }

    async getDiagnosticosByPaciente(paciente: number): Promise<Diagnosticos[]> {
        // Validar que el paciente existe
        const pacienteExistente = await this.pacientePort.getPacienteById(paciente);
        if (!pacienteExistente) {
            throw new Error("El paciente especificado no existe");
        }
        return await this.diagnosticosPort.getDiagnosticosByPaciente(paciente);
    }

    async getDiagnosticosByMedico(medico: number): Promise<Diagnosticos[]> {
        // Validar que el médico existe
        const medicoExistente = await this.medicoPort.getMedicoById(medico);
        if (!medicoExistente) {
            throw new Error("El médico especificado no existe");
        }
        return await this.diagnosticosPort.getDiagnosticosByMedico(medico);
    }

    async getDiagnosticosByCita(cita: number): Promise<Diagnosticos[]> {
        // Validar que la cita existe
        const citaExistente = await this.citasMedicasPort.getCitaMedicaById(cita);
        if (!citaExistente) {
            throw new Error("La cita médica especificada no existe");
        }
        return await this.diagnosticosPort.getDiagnosticosByCita(cita);
    }

    async getDiagnosticosByEnfermedad(enfermedad: number): Promise<Diagnosticos[]> {
        return await this.diagnosticosPort.getDiagnosticosByEnfermedad(enfermedad);
    }

    async getDiagnosticosByEstado(estado: Diagnosticos['estado']): Promise<Diagnosticos[]> {
        // Validar que el estado sea válido
        const estadosValidos: Diagnosticos['estado'][] = ['activo', 'inactivo', 'resuelto', 'pendiente'];
        if (!estadosValidos.includes(estado)) {
            throw new Error("El estado del diagnóstico no es válido");
        }
        return await this.diagnosticosPort.getDiagnosticosByEstado(estado);
    }

    async getDiagnosticosByFecha(fecha: Date): Promise<Diagnosticos[]> {
        return await this.diagnosticosPort.getDiagnosticosByFecha(fecha);
    }

    async getDiagnosticosByPacienteAndEstado(paciente: number, estado: Diagnosticos['estado']): Promise<Diagnosticos[]> {
        // Validar que el paciente existe
        const pacienteExistente = await this.pacientePort.getPacienteById(paciente);
        if (!pacienteExistente) {
            throw new Error("El paciente especificado no existe");
        }

        // Validar que el estado sea válido
        const estadosValidos: Diagnosticos['estado'][] = ['activo', 'inactivo', 'resuelto', 'pendiente'];
        if (!estadosValidos.includes(estado)) {
            throw new Error("El estado del diagnóstico no es válido");
        }

        return await this.diagnosticosPort.getDiagnosticosByPacienteAndEstado(paciente, estado);
    }

    async getDiagnosticosByMedicoAndEstado(medico: number, estado: Diagnosticos['estado']): Promise<Diagnosticos[]> {
        // Validar que el médico existe
        const medicoExistente = await this.medicoPort.getMedicoById(medico);
        if (!medicoExistente) {
            throw new Error("El médico especificado no existe");
        }

        // Validar que el estado sea válido
        const estadosValidos: Diagnosticos['estado'][] = ['activo', 'inactivo', 'resuelto', 'pendiente'];
        if (!estadosValidos.includes(estado)) {
            throw new Error("El estado del diagnóstico no es válido");
        }

        return await this.diagnosticosPort.getDiagnosticosByMedicoAndEstado(medico, estado);
    }

    async updateDiagnostico(id: number, diagnosticoData: Partial<Diagnosticos>): Promise<boolean> {
        // Validar que el diagnóstico existe
        const diagnosticoExistente = await this.diagnosticosPort.getDiagnosticoById(id);
        if (!diagnosticoExistente) {
            throw new Error("El diagnóstico no existe");
        }

        // Si se actualiza el paciente, validar que existe
        if (diagnosticoData.paciente) {
            const pacienteExistente = await this.pacientePort.getPacienteById(diagnosticoData.paciente);
            if (!pacienteExistente) {
                throw new Error("El paciente especificado no existe");
            }
        }

        // Si se actualiza el médico, validar que existe
        if (diagnosticoData.medico) {
            const medicoExistente = await this.medicoPort.getMedicoById(diagnosticoData.medico);
            if (!medicoExistente) {
                throw new Error("El médico especificado no existe");
            }
        }

        // Si se actualiza la cita, validar que existe
        if (diagnosticoData.cita) {
            const citaExistente = await this.citasMedicasPort.getCitaMedicaById(diagnosticoData.cita);
            if (!citaExistente) {
                throw new Error("La cita médica especificada no existe");
            }
        }

        // Si se actualiza el diagnóstico, validar que no esté vacío
        if (diagnosticoData.diagnostico !== undefined) {
            if (!diagnosticoData.diagnostico || diagnosticoData.diagnostico.trim() === '') {
                throw new Error("El diagnóstico no puede estar vacío");
            }
        }

        // Si se actualiza la fecha de diagnóstico, validar que no sea en el futuro
        if (diagnosticoData.fecha_diagnostico) {
            const fechaDiagnostico = new Date(diagnosticoData.fecha_diagnostico);
            const fechaActual = new Date();
            fechaActual.setHours(0, 0, 0, 0);
            
            if (fechaDiagnostico > fechaActual) {
                throw new Error("La fecha de diagnóstico no puede ser en el futuro");
            }
        }

        // Si se actualiza el estado, validar que sea válido
        if (diagnosticoData.estado) {
            const estadosValidos: Diagnosticos['estado'][] = ['activo', 'inactivo', 'resuelto', 'pendiente'];
            if (!estadosValidos.includes(diagnosticoData.estado)) {
                throw new Error("El estado del diagnóstico no es válido");
            }
        }

        return await this.diagnosticosPort.updateDiagnostico(id, diagnosticoData);
    }

    async deleteDiagnostico(id: number): Promise<boolean> {
        // Validar que el diagnóstico existe
        const diagnosticoExistente = await this.diagnosticosPort.getDiagnosticoById(id);
        if (!diagnosticoExistente) {
            throw new Error("El diagnóstico no existe");
        }

        return await this.diagnosticosPort.deleteDiagnostico(id);
    }

    async getDiagnosticosActivos(): Promise<Diagnosticos[]> {
        return await this.diagnosticosPort.getDiagnosticosActivos();
    }

    async getDiagnosticosRecientes(dias: number): Promise<Diagnosticos[]> {
        if (dias <= 0) {
            throw new Error("El número de días debe ser positivo");
        }
        return await this.diagnosticosPort.getDiagnosticosRecientes(dias);
    }

    async marcarComoResuelto(id: number): Promise<boolean> {
        // Validar que el diagnóstico existe
        const diagnosticoExistente = await this.diagnosticosPort.getDiagnosticoById(id);
        if (!diagnosticoExistente) {
            throw new Error("El diagnóstico no existe");
        }

        // Validar que el diagnóstico esté activo
        if (diagnosticoExistente.estado !== 'activo') {
            throw new Error("Solo se pueden marcar como resuelto diagnósticos activos");
        }

        return await this.diagnosticosPort.updateDiagnostico(id, { estado: 'resuelto' });
    }

    async marcarComoPendiente(id: number): Promise<boolean> {
        // Validar que el diagnóstico existe
        const diagnosticoExistente = await this.diagnosticosPort.getDiagnosticoById(id);
        if (!diagnosticoExistente) {
            throw new Error("El diagnóstico no existe");
        }

        return await this.diagnosticosPort.updateDiagnostico(id, { estado: 'pendiente' });
    }

    async activarDiagnostico(id: number): Promise<boolean> {
        // Validar que el diagnóstico existe
        const diagnosticoExistente = await this.diagnosticosPort.getDiagnosticoById(id);
        if (!diagnosticoExistente) {
            throw new Error("El diagnóstico no existe");
        }

        return await this.diagnosticosPort.updateDiagnostico(id, { estado: 'activo' });
    }

    async desactivarDiagnostico(id: number): Promise<boolean> {
        // Validar que el diagnóstico existe
        const diagnosticoExistente = await this.diagnosticosPort.getDiagnosticoById(id);
        if (!diagnosticoExistente) {
            throw new Error("El diagnóstico no existe");
        }

        return await this.diagnosticosPort.updateDiagnostico(id, { estado: 'inactivo' });
    }
} 