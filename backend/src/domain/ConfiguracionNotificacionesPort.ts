import { ConfiguracionNotificaciones } from "./ConfiguracionNotificaciones";

export interface ConfiguracionNotificacionesPort {
    createConfiguracion(config: Omit<ConfiguracionNotificaciones, 'id_configuracion' | 'fecha_creacion'>): Promise<number>;
    updateConfiguracion(id: number, config: Partial<ConfiguracionNotificaciones>): Promise<boolean>;
    deleteConfiguracion(id: number): Promise<boolean>;
    getConfiguracionById(id: number): Promise<ConfiguracionNotificaciones | null>;
    getAllConfiguraciones(): Promise<ConfiguracionNotificaciones[]>;
    getConfiguracionesByPaciente(paciente: number): Promise<ConfiguracionNotificaciones[]>;
    getConfiguracionesByMedico(medico: number): Promise<ConfiguracionNotificaciones[]>;
    getConfiguracionByPacienteAndTipo(paciente: number, tipo: string): Promise<ConfiguracionNotificaciones | null>;
    getConfiguracionByMedicoAndTipo(medico: number, tipo: string): Promise<ConfiguracionNotificaciones | null>;
} 