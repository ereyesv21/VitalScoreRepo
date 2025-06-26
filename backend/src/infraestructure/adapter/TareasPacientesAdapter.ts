import { AppDataSource } from '../config/data-base';
import { TareasPacientes } from '../entities/TareasPacientes';
import { Paciente } from '../entities/Pacientes';
import { Tarea } from '../entities/Tareas';

export class TareasPacientesAdapter {
  private repo = AppDataSource.getRepository(TareasPacientes);
  private pacienteRepo = AppDataSource.getRepository(Paciente);
  private tareaRepo = AppDataSource.getRepository(Tarea);

  async asignarTarea(data: any): Promise<TareasPacientes> {
    let paciente = data.paciente;
    if (data.paciente_id) {
      paciente = await this.pacienteRepo.findOneBy({ id_paciente: data.paciente_id });
      if (!paciente) throw new Error('Paciente no encontrado');
    }

    // Crear la tarea base
    const tareaBaseData: any = {
      nombre_tarea: data.nombre_tarea,
      descripcion: data.descripcion,
      fecha_inicio: new Date(),
      fecha_fin: new Date(),
      estado: data.estado || 'pendiente',
    };
    // Solo asigna plan si existe
    if (data.plan) {
      tareaBaseData.plan = data.plan;
    }
    const tareaBase = this.tareaRepo.create(tareaBaseData);
    const tareaCreada = await this.tareaRepo.save(tareaBase);

    // Crear la relación en Tareas_Pacientes
    const tareaPaciente = this.repo.create({
      ...data,
      paciente,
      tarea: tareaCreada,
    });
    const saved = await this.repo.save(tareaPaciente);
    if (Array.isArray(saved)) {
      return saved[0];
    }
    return saved;
  }

  async getTareasPorPaciente(pacienteId: number): Promise<TareasPacientes[]> {
    return await this.repo.find({
      where: { paciente: { id_paciente: pacienteId } },
      relations: ['tarea', 'paciente'],
      order: { fecha_asignacion: 'DESC' },
    });
  }

  async marcarComoCompletada(id_tarea_paciente: number): Promise<void> {
    await this.repo.update(id_tarea_paciente, { estado: 'completada', fecha_completada: new Date() });
  }
} 