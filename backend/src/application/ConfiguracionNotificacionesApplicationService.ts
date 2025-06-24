import { ConfiguracionNotificacionesPort } from "../domain/ConfiguracionNotificacionesPort";
import { ConfiguracionNotificaciones } from "../domain/ConfiguracionNotificaciones";
import { PacientePort } from "../domain/PacientePort";
import { MedicoPort } from "../domain/MedicoPort";

export class ConfiguracionNotificacionesApplicationService {
    private readonly configuracionPort: ConfiguracionNotificacionesPort;
    private readonly pacientePort: PacientePort;
    private readonly medicoPort: MedicoPort;

    constructor(configuracionPort: ConfiguracionNotificacionesPort, pacientePort: PacientePort, medicoPort: MedicoPort) {
        this.configuracionPort = configuracionPort;
        this.pacientePort = pacientePort;
        this.medicoPort = medicoPort;
    }

    async createConfiguracion(configData: Omit<ConfiguracionNotificaciones, "id_configuracion" | "fecha_creacion">): Promise<number> {
        // Validar que el paciente o el médico existan si se proveen
        if (configData.paciente) {
            const pacienteExistente = await this.pacientePort.getPacienteById(configData.paciente);
            if (!pacienteExistente) {
                throw new Error("El paciente especificado no existe");
            }
        }
        if (configData.medico) {
            const medicoExistente = await this.medicoPort.getMedicoById(configData.medico);
            if (!medicoExistente) {
                throw new Error("El médico especificado no existe");
            }
        }
        // Validar tipo_notificacion
        if (!configData.tipo_notificacion || typeof configData.tipo_notificacion !== 'string') {
            throw new Error("El tipo de notificación es requerido y debe ser un string");
        }
        // Validar hora_inicio y hora_fin
        if (configData.hora_inicio >= configData.hora_fin) {
            throw new Error("La hora de inicio debe ser menor que la hora de fin");
        }
        // Validar dias_semana
        if (!Array.isArray(configData.dias_semana) || configData.dias_semana.length === 0) {
            throw new Error("Debe especificar al menos un día de la semana");
        }
        return await this.configuracionPort.createConfiguracion(configData);
    }

    async getAllConfiguraciones(): Promise<ConfiguracionNotificaciones[]> {
        return await this.configuracionPort.getAllConfiguraciones();
    }

    async getConfiguracionById(id: number): Promise<ConfiguracionNotificaciones | null> {
        return await this.configuracionPort.getConfiguracionById(id);
    }

    async getConfiguracionesByPaciente(paciente: number): Promise<ConfiguracionNotificaciones[]> {
        return await this.configuracionPort.getConfiguracionesByPaciente(paciente);
    }

    async getConfiguracionesByMedico(medico: number): Promise<ConfiguracionNotificaciones[]> {
        return await this.configuracionPort.getConfiguracionesByMedico(medico);
    }

    async getConfiguracionByPacienteAndTipo(paciente: number, tipo: string): Promise<ConfiguracionNotificaciones | null> {
        return await this.configuracionPort.getConfiguracionByPacienteAndTipo(paciente, tipo);
    }

    async getConfiguracionByMedicoAndTipo(medico: number, tipo: string): Promise<ConfiguracionNotificaciones | null> {
        return await this.configuracionPort.getConfiguracionByMedicoAndTipo(medico, tipo);
    }

    async updateConfiguracion(id: number, configData: Partial<ConfiguracionNotificaciones>): Promise<boolean> {
        // Validar que la configuración existe
        const configExistente = await this.configuracionPort.getConfiguracionById(id);
        if (!configExistente) {
            throw new Error("La configuración no existe");
        }
        // Validar paciente y médico si se actualizan
        if (configData.paciente) {
            const pacienteExistente = await this.pacientePort.getPacienteById(configData.paciente);
            if (!pacienteExistente) {
                throw new Error("El paciente especificado no existe");
            }
        }
        if (configData.medico) {
            const medicoExistente = await this.medicoPort.getMedicoById(configData.medico);
            if (!medicoExistente) {
                throw new Error("El médico especificado no existe");
            }
        }
        // Validar horas si se actualizan
        if (configData.hora_inicio && configData.hora_fin) {
            if (configData.hora_inicio >= configData.hora_fin) {
                throw new Error("La hora de inicio debe ser menor que la hora de fin");
            }
        }
        // Validar dias_semana si se actualizan
        if (configData.dias_semana && (!Array.isArray(configData.dias_semana) || configData.dias_semana.length === 0)) {
            throw new Error("Debe especificar al menos un día de la semana");
        }
        return await this.configuracionPort.updateConfiguracion(id, configData);
    }

    async deleteConfiguracion(id: number): Promise<boolean> {
        // Validar que la configuración existe
        const configExistente = await this.configuracionPort.getConfiguracionById(id);
        if (!configExistente) {
            throw new Error("La configuración no existe");
        }
        return await this.configuracionPort.deleteConfiguracion(id);
    }
} 