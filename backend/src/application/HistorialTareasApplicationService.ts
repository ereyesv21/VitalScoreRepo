import { HistorialTareas } from '../domain/HistorialTareas';
import { HistorialTareasPort } from '../domain/HistorialTareasPort';

export class HistorialTareasApplicationService {
  constructor(private historialTareasPort: HistorialTareasPort) {}

  async createHistorialTarea(historial: HistorialTareas): Promise<HistorialTareas> {
    // Validaciones
    if (!historial.tarea || historial.tarea <= 0) {
      throw new Error('El ID de la tarea es requerido y debe ser mayor a 0');
    }
    if (!historial.paciente || historial.paciente <= 0) {
      throw new Error('El ID del paciente es requerido y debe ser mayor a 0');
    }
    if (!historial.fecha_completada) {
      throw new Error('La fecha completada es requerida');
    }
    if (typeof historial.puntos_ganados !== 'number' || historial.puntos_ganados < 0) {
      throw new Error('Los puntos ganados son requeridos y deben ser un número mayor o igual a 0');
    }
    // hora_completada es opcional, pero si viene debe ser string tipo HH:mm:ss
    if (historial.hora_completada && !/^\d{2}:\d{2}(:\d{2})?$/.test(historial.hora_completada)) {
      throw new Error('La hora completada debe tener el formato HH:mm o HH:mm:ss');
    }
    // observaciones es opcional
    // fecha_creacion se asigna por defecto
    const nuevoHistorial: HistorialTareas = {
      ...historial,
      fecha_creacion: historial.fecha_creacion || new Date()
    };
    return await this.historialTareasPort.create(nuevoHistorial);
  }

  async getHistorialTareaById(id: number): Promise<HistorialTareas | null> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }
    return await this.historialTareasPort.findById(id);
  }

  async getHistorialTareasByPaciente(pacienteId: number): Promise<HistorialTareas[]> {
    if (!pacienteId || pacienteId <= 0) {
      throw new Error('El ID del paciente debe ser un número mayor a 0');
    }
    return await this.historialTareasPort.findByPaciente(pacienteId);
  }

  async getHistorialTareasByTarea(tareaId: number): Promise<HistorialTareas[]> {
    if (!tareaId || tareaId <= 0) {
      throw new Error('El ID de la tarea debe ser un número mayor a 0');
    }
    return await this.historialTareasPort.findByTarea(tareaId);
  }

  async getHistorialTareasByFecha(fecha: Date): Promise<HistorialTareas[]> {
    if (!fecha) {
      throw new Error('La fecha es requerida para la búsqueda');
    }
    return await this.historialTareasPort.findByFecha(fecha);
  }

  async updateHistorialTarea(id: number, historial: Partial<HistorialTareas>): Promise<HistorialTareas | null> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }
    // Validar que el historial existe
    const historialExistente = await this.historialTareasPort.findById(id);
    if (!historialExistente) {
      throw new Error('El historial de tarea no existe');
    }
    // Validaciones para campos que se van a actualizar
    if (historial.tarea !== undefined && historial.tarea <= 0) {
      throw new Error('El ID de la tarea debe ser mayor a 0');
    }
    if (historial.paciente !== undefined && historial.paciente <= 0) {
      throw new Error('El ID del paciente debe ser mayor a 0');
    }
    if (historial.puntos_ganados !== undefined && historial.puntos_ganados < 0) {
      throw new Error('Los puntos ganados deben ser un número mayor o igual a 0');
    }
    if (historial.hora_completada && !/^\d{2}:\d{2}(:\d{2})?$/.test(historial.hora_completada)) {
      throw new Error('La hora completada debe tener el formato HH:mm o HH:mm:ss');
    }
    return await this.historialTareasPort.update(id, historial);
  }

  async deleteHistorialTarea(id: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }
    // Validar que el historial existe
    const historialExistente = await this.historialTareasPort.findById(id);
    if (!historialExistente) {
      throw new Error('El historial de tarea no existe');
    }
    return await this.historialTareasPort.delete(id);
  }

  async getAllHistorialTareas(): Promise<HistorialTareas[]> {
    return await this.historialTareasPort.findAll();
  }
} 