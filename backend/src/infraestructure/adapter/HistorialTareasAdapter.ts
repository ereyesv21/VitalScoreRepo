import { Repository } from 'typeorm';
import { HistorialTareas as HistorialTareasEntity } from '../entities/HistorialTareas';
import { HistorialTareas } from '../../domain/HistorialTareas';
import { HistorialTareasPort } from '../../domain/HistorialTareasPort';
import { AppDataSource } from '../config/data-base';

export class HistorialTareasAdapter implements HistorialTareasPort {
  private repository: Repository<HistorialTareasEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(HistorialTareasEntity);
  }

  async create(historial: HistorialTareas): Promise<HistorialTareas> {
    const nuevoHistorial = this.repository.create({
      tarea: historial.tarea,
      paciente: historial.paciente,
      fecha_completada: historial.fecha_completada,
      hora_completada: historial.hora_completada,
      puntos_ganados: historial.puntos_ganados,
      observaciones: historial.observaciones,
      fecha_creacion: historial.fecha_creacion || new Date()
    });
    const saved = await this.repository.save(nuevoHistorial);
    return {
      id_historial_tarea: saved.id_historial_tarea,
      tarea: saved.tarea,
      paciente: saved.paciente,
      fecha_completada: saved.fecha_completada,
      hora_completada: saved.hora_completada,
      puntos_ganados: saved.puntos_ganados,
      observaciones: saved.observaciones,
      fecha_creacion: saved.fecha_creacion
    };
  }

  async findById(id: number): Promise<HistorialTareas | null> {
    const historial = await this.repository.findOne({ where: { id_historial_tarea: id } });
    if (!historial) return null;
    return {
      id_historial_tarea: historial.id_historial_tarea,
      tarea: historial.tarea,
      paciente: historial.paciente,
      fecha_completada: historial.fecha_completada,
      hora_completada: historial.hora_completada,
      puntos_ganados: historial.puntos_ganados,
      observaciones: historial.observaciones,
      fecha_creacion: historial.fecha_creacion
    };
  }

  async findByPaciente(pacienteId: number): Promise<HistorialTareas[]> {
    const historiales = await this.repository.find({
      where: { paciente: pacienteId },
      order: { fecha_completada: 'DESC' }
    });
    return historiales.map(historial => ({
      id_historial_tarea: historial.id_historial_tarea,
      tarea: historial.tarea,
      paciente: historial.paciente,
      fecha_completada: historial.fecha_completada,
      hora_completada: historial.hora_completada,
      puntos_ganados: historial.puntos_ganados,
      observaciones: historial.observaciones,
      fecha_creacion: historial.fecha_creacion
    }));
  }

  async findByTarea(tareaId: number): Promise<HistorialTareas[]> {
    const historiales = await this.repository.find({
      where: { tarea: tareaId },
      order: { fecha_completada: 'DESC' }
    });
    return historiales.map(historial => ({
      id_historial_tarea: historial.id_historial_tarea,
      tarea: historial.tarea,
      paciente: historial.paciente,
      fecha_completada: historial.fecha_completada,
      hora_completada: historial.hora_completada,
      puntos_ganados: historial.puntos_ganados,
      observaciones: historial.observaciones,
      fecha_creacion: historial.fecha_creacion
    }));
  }

  async findByFecha(fecha: Date): Promise<HistorialTareas[]> {
    const historiales = await this.repository.find({
      where: { fecha_completada: fecha },
      order: { hora_completada: 'ASC' }
    });
    return historiales.map(historial => ({
      id_historial_tarea: historial.id_historial_tarea,
      tarea: historial.tarea,
      paciente: historial.paciente,
      fecha_completada: historial.fecha_completada,
      hora_completada: historial.hora_completada,
      puntos_ganados: historial.puntos_ganados,
      observaciones: historial.observaciones,
      fecha_creacion: historial.fecha_creacion
    }));
  }

  async update(id: number, historial: Partial<HistorialTareas>): Promise<HistorialTareas | null> {
    const existing = await this.repository.findOne({ where: { id_historial_tarea: id } });
    if (!existing) return null;
    if (historial.tarea !== undefined) existing.tarea = historial.tarea;
    if (historial.paciente !== undefined) existing.paciente = historial.paciente;
    if (historial.fecha_completada !== undefined) existing.fecha_completada = historial.fecha_completada;
    if (historial.hora_completada !== undefined) existing.hora_completada = historial.hora_completada;
    if (historial.puntos_ganados !== undefined) existing.puntos_ganados = historial.puntos_ganados;
    if (historial.observaciones !== undefined) existing.observaciones = historial.observaciones;
    const updated = await this.repository.save(existing);
    return {
      id_historial_tarea: updated.id_historial_tarea,
      tarea: updated.tarea,
      paciente: updated.paciente,
      fecha_completada: updated.fecha_completada,
      hora_completada: updated.hora_completada,
      puntos_ganados: updated.puntos_ganados,
      observaciones: updated.observaciones,
      fecha_creacion: updated.fecha_creacion
    };
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAll(): Promise<HistorialTareas[]> {
    const historiales = await this.repository.find({ order: { fecha_completada: 'DESC' } });
    return historiales.map(historial => ({
      id_historial_tarea: historial.id_historial_tarea,
      tarea: historial.tarea,
      paciente: historial.paciente,
      fecha_completada: historial.fecha_completada,
      hora_completada: historial.hora_completada,
      puntos_ganados: historial.puntos_ganados,
      observaciones: historial.observaciones,
      fecha_creacion: historial.fecha_creacion
    }));
  }
} 