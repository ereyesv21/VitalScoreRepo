import { CitasMedicasPort } from "../domain/CitasMedicasPort";
import { CitasMedicas } from "../domain/CitasMedicas";
import { PacientePort } from "../domain/PacientePort";
import { MedicoPort } from "../domain/MedicoPort";

export class CitasMedicasApplicationService {
    private readonly citasMedicasPort: CitasMedicasPort;
    private readonly pacientePort: PacientePort;
    private readonly medicoPort: MedicoPort;

    constructor(citasMedicasPort: CitasMedicasPort, pacientePort: PacientePort, medicoPort: MedicoPort) {
        this.citasMedicasPort = citasMedicasPort;
        this.pacientePort = pacientePort;
        this.medicoPort = medicoPort;
    }

    async createCitaMedica(citaData: Omit<CitasMedicas, "id_cita" | "fecha_creacion" | "fecha_modificacion">): Promise<number> {
        // Validar que el paciente existe
        const pacienteExistente = await this.pacientePort.getPacienteById(citaData.paciente);
        if (!pacienteExistente) {
            throw new Error("El paciente especificado no existe");
        }

        // Validar que el médico existe
        const medicoExistente = await this.medicoPort.getMedicoById(citaData.medico);
        if (!medicoExistente) {
            throw new Error("El médico especificado no existe");
        }

        // Validar que la fecha de la cita no sea en el pasado
        const fechaCita = new Date(citaData.fecha_cita);
        const fechaActual = new Date();
        fechaActual.setHours(0, 0, 0, 0);
        
        if (fechaCita < fechaActual) {
            throw new Error("La fecha de la cita no puede ser en el pasado");
        }

        // Validar que la hora de inicio sea menor que la hora de fin
        if (citaData.hora_inicio >= citaData.hora_fin) {
            throw new Error("La hora de inicio debe ser menor que la hora de fin");
        }

        // Validar que el estado sea válido
        const estadosValidos: CitasMedicas['estado'][] = ['programada', 'confirmada', 'en_progreso', 'completada', 'cancelada', 'no_asistio'];
        if (!estadosValidos.includes(citaData.estado)) {
            throw new Error("El estado de la cita no es válido");
        }

        // Verificar si hay conflicto de horario para el médico
        const citasExistentes = await this.citasMedicasPort.getCitasMedicasByMedicoAndFecha(citaData.medico, fechaCita);
        const hayConflicto = citasExistentes.some(cita => {
            if (cita.estado === 'cancelada' || cita.estado === 'no_asistio') return false;
            return (citaData.hora_inicio < cita.hora_fin && citaData.hora_fin > cita.hora_inicio);
        });

        if (hayConflicto) {
            throw new Error("El médico ya tiene una cita programada en ese horario");
        }

        return await this.citasMedicasPort.createCitaMedica(citaData);
    }

    async getAllCitasMedicas(): Promise<CitasMedicas[]> {
        return await this.citasMedicasPort.getAllCitasMedicas();
    }

    async getCitaMedicaById(id: number): Promise<CitasMedicas | null> {
        return await this.citasMedicasPort.getCitaMedicaById(id);
    }

    async getCitasMedicasByPaciente(paciente: number): Promise<CitasMedicas[]> {
        // Validar que el paciente existe
        const pacienteExistente = await this.pacientePort.getPacienteById(paciente);
        if (!pacienteExistente) {
            throw new Error("El paciente especificado no existe");
        }
        return await this.citasMedicasPort.getCitasMedicasByPaciente(paciente);
    }

    async getCitasMedicasByMedico(medico: number): Promise<CitasMedicas[]> {
        // Validar que el médico existe
        const medicoExistente = await this.medicoPort.getMedicoById(medico);
        if (!medicoExistente) {
            throw new Error("El médico especificado no existe");
        }
        return await this.citasMedicasPort.getCitasMedicasByMedico(medico);
    }

    async getCitasMedicasByEstado(estado: CitasMedicas['estado']): Promise<CitasMedicas[]> {
        // Validar que el estado sea válido
        const estadosValidos: CitasMedicas['estado'][] = ['programada', 'confirmada', 'en_progreso', 'completada', 'cancelada', 'no_asistio'];
        if (!estadosValidos.includes(estado)) {
            throw new Error("El estado de la cita no es válido");
        }
        return await this.citasMedicasPort.getCitasMedicasByEstado(estado);
    }

    async getCitasMedicasByFecha(fecha: Date): Promise<CitasMedicas[]> {
        return await this.citasMedicasPort.getCitasMedicasByFecha(fecha);
    }

    async getCitasMedicasByMedicoAndFecha(medico: number, fecha: Date): Promise<CitasMedicas[]> {
        // Validar que el médico existe
        const medicoExistente = await this.medicoPort.getMedicoById(medico);
        if (!medicoExistente) {
            throw new Error("El médico especificado no existe");
        }
        return await this.citasMedicasPort.getCitasMedicasByMedicoAndFecha(medico, fecha);
    }

    async getCitasMedicasByPacienteAndFecha(paciente: number, fecha: Date): Promise<CitasMedicas[]> {
        // Validar que el paciente existe
        const pacienteExistente = await this.pacientePort.getPacienteById(paciente);
        if (!pacienteExistente) {
            throw new Error("El paciente especificado no existe");
        }
        return await this.citasMedicasPort.getCitasMedicasByPacienteAndFecha(paciente, fecha);
    }

    async updateCitaMedica(id: number, citaData: Partial<CitasMedicas>): Promise<boolean> {
        // Validar que la cita existe
        const citaExistente = await this.citasMedicasPort.getCitaMedicaById(id);
        if (!citaExistente) {
            throw new Error("La cita médica no existe");
        }

        // Si se actualiza el paciente, validar que existe
        if (citaData.paciente) {
            const pacienteExistente = await this.pacientePort.getPacienteById(citaData.paciente);
            if (!pacienteExistente) {
                throw new Error("El paciente especificado no existe");
            }
        }

        // Si se actualiza el médico, validar que existe
        if (citaData.medico) {
            const medicoExistente = await this.medicoPort.getMedicoById(citaData.medico);
            if (!medicoExistente) {
                throw new Error("El médico especificado no existe");
            }
        }

        // Si se actualiza la fecha, validar que no sea en el pasado
        if (citaData.fecha_cita) {
            const fechaCita = new Date(citaData.fecha_cita);
            const fechaActual = new Date();
            fechaActual.setHours(0, 0, 0, 0);
            
            if (fechaCita < fechaActual) {
                throw new Error("La fecha de la cita no puede ser en el pasado");
            }
        }

        // Si se actualizan las horas, validar que la hora de inicio sea menor que la de fin
        if (citaData.hora_inicio && citaData.hora_fin) {
            if (citaData.hora_inicio >= citaData.hora_fin) {
                throw new Error("La hora de inicio debe ser menor que la hora de fin");
            }
        }

        // Si se actualiza el estado, validar que sea válido
        if (citaData.estado) {
            const estadosValidos: CitasMedicas['estado'][] = ['programada', 'confirmada', 'en_progreso', 'completada', 'cancelada', 'no_asistio'];
            if (!estadosValidos.includes(citaData.estado)) {
                throw new Error("El estado de la cita no es válido");
            }
        }

        return await this.citasMedicasPort.updateCitaMedica(id, citaData);
    }

    async deleteCitaMedica(id: number): Promise<boolean> {
        // Validar que la cita existe
        const citaExistente = await this.citasMedicasPort.getCitaMedicaById(id);
        if (!citaExistente) {
            throw new Error("La cita médica no existe");
        }

        // Validar que la cita no esté en progreso o completada
        if (citaExistente.estado === 'en_progreso' || citaExistente.estado === 'completada') {
            throw new Error("No se puede eliminar una cita que está en progreso o completada");
        }

        return await this.citasMedicasPort.deleteCitaMedica(id);
    }

    async cancelarCita(id: number, canceladoPor: string, motivoCancelacion: string): Promise<boolean> {
        // Validar que la cita existe
        const citaExistente = await this.citasMedicasPort.getCitaMedicaById(id);
        if (!citaExistente) {
            throw new Error("La cita médica no existe");
        }

        // Validar que la cita no esté ya cancelada o completada
        if (citaExistente.estado === 'cancelada') {
            throw new Error("La cita ya está cancelada");
        }

        if (citaExistente.estado === 'completada') {
            throw new Error("No se puede cancelar una cita completada");
        }

        // Validar que se proporcione el motivo de cancelación
        if (!motivoCancelacion || motivoCancelacion.trim() === '') {
            throw new Error("El motivo de cancelación es requerido");
        }

        return await this.citasMedicasPort.updateCitaMedica(id, {
            estado: 'cancelada',
            cancelado_por: canceladoPor,
            motivo_cancelacion: motivoCancelacion
        });
    }

    async confirmarCita(id: number): Promise<boolean> {
        // Validar que la cita existe
        const citaExistente = await this.citasMedicasPort.getCitaMedicaById(id);
        if (!citaExistente) {
            throw new Error("La cita médica no existe");
        }

        // Validar que la cita esté programada
        if (citaExistente.estado !== 'programada') {
            throw new Error("Solo se pueden confirmar citas programadas");
        }

        return await this.citasMedicasPort.updateCitaMedica(id, { estado: 'confirmada' });
    }

    async iniciarCita(id: number): Promise<boolean> {
        // Validar que la cita existe
        const citaExistente = await this.citasMedicasPort.getCitaMedicaById(id);
        if (!citaExistente) {
            throw new Error("La cita médica no existe");
        }

        // Validar que la cita esté confirmada
        if (citaExistente.estado !== 'confirmada') {
            throw new Error("Solo se pueden iniciar citas confirmadas");
        }

        return await this.citasMedicasPort.updateCitaMedica(id, { estado: 'en_progreso' });
    }

    async completarCita(id: number, observaciones?: string): Promise<boolean> {
        // Validar que la cita existe
        const citaExistente = await this.citasMedicasPort.getCitaMedicaById(id);
        if (!citaExistente) {
            throw new Error("La cita médica no existe");
        }

        // Validar que la cita esté en progreso
        if (citaExistente.estado !== 'en_progreso') {
            throw new Error("Solo se pueden completar citas en progreso");
        }

        return await this.citasMedicasPort.updateCitaMedica(id, { 
            estado: 'completada',
            observaciones: observaciones
        });
    }

    async marcarNoAsistio(id: number): Promise<boolean> {
        // Validar que la cita existe
        const citaExistente = await this.citasMedicasPort.getCitaMedicaById(id);
        if (!citaExistente) {
            throw new Error("La cita médica no existe");
        }

        // Validar que la cita esté programada o confirmada
        if (citaExistente.estado !== 'programada' && citaExistente.estado !== 'confirmada') {
            throw new Error("Solo se pueden marcar como no asistió citas programadas o confirmadas");
        }

        return await this.citasMedicasPort.updateCitaMedica(id, { estado: 'no_asistio' });
    }

    async getCitasMedicasProximas(dias: number = 7): Promise<CitasMedicas[]> {
        if (dias <= 0) {
            throw new Error("El número de días debe ser positivo");
        }
        return await this.citasMedicasPort.getCitasMedicasProximas(dias);
    }

    async getCitasMedicasVencidas(): Promise<CitasMedicas[]> {
        return await this.citasMedicasPort.getCitasMedicasVencidas();
    }
} 