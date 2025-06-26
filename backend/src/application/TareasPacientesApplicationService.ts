import { TareasPacientesAdapter } from '../infraestructure/adapter/TareasPacientesAdapter';
import { TareasPacientes } from '../infraestructure/entities/TareasPacientes';

export class TareasPacientesApplicationService {
  private adapter: TareasPacientesAdapter;

  constructor(adapter: TareasPacientesAdapter) {
    this.adapter = adapter;
  }

  async asignarTarea(data: Partial<TareasPacientes>) {
    return await this.adapter.asignarTarea(data);
  }

  async getTareasPorPaciente(pacienteId: number) {
    return await this.adapter.getTareasPorPaciente(pacienteId);
  }

  async marcarComoCompletada(id_tarea_paciente: number) {
    return await this.adapter.marcarComoCompletada(id_tarea_paciente);
  }
} 