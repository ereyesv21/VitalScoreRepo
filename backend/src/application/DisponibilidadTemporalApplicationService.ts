import { DisponibilidadTemporal } from '../domain/DisponibilidadTemporal';
import { DisponibilidadTemporalPort } from '../domain/DisponibilidadTemporalPort';

export class DisponibilidadTemporalApplicationService {
  constructor(private disponibilidadTemporalPort: DisponibilidadTemporalPort) {}

  async createDisponibilidadTemporal(disponibilidad: DisponibilidadTemporal): Promise<DisponibilidadTemporal> {
    // Validaciones
    if (!disponibilidad.medico || disponibilidad.medico <= 0) {
      throw new Error('El ID del médico es requerido y debe ser mayor a 0');
    }

    if (!disponibilidad.fecha_inicio) {
      throw new Error('La fecha de inicio es requerida');
    }

    if (!disponibilidad.fecha_fin) {
      throw new Error('La fecha de fin es requerida');
    }

    if (disponibilidad.fecha_inicio >= disponibilidad.fecha_fin) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    if (!disponibilidad.tipo) {
      throw new Error('El tipo de disponibilidad es requerido');
    }

    const tiposValidos = ['vacaciones', 'ausencia', 'capacitacion', 'otro'];
    if (!tiposValidos.includes(disponibilidad.tipo)) {
      throw new Error('El tipo debe ser uno de: vacaciones, ausencia, capacitacion, otro');
    }

    // Validar que no haya solapamiento de fechas para el mismo médico
    const disponibilidadesExistentes = await this.disponibilidadTemporalPort.findByMedico(disponibilidad.medico);
    const haySolapamiento = disponibilidadesExistentes.some(existente => {
      if (existente.estado === 'inactivo') return false;
      return (
        (disponibilidad.fecha_inicio <= existente.fecha_fin && disponibilidad.fecha_fin >= existente.fecha_inicio)
      );
    });

    if (haySolapamiento) {
      throw new Error('Ya existe una disponibilidad temporal para el médico en el rango de fechas especificado');
    }

    // Establecer valores por defecto
    const nuevaDisponibilidad: DisponibilidadTemporal = {
      ...disponibilidad,
      estado: disponibilidad.estado || 'activo',
      fecha_creacion: new Date()
    };

    return await this.disponibilidadTemporalPort.create(nuevaDisponibilidad);
  }

  async getDisponibilidadTemporalById(id: number): Promise<DisponibilidadTemporal | null> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }

    return await this.disponibilidadTemporalPort.findById(id);
  }

  async getDisponibilidadesByMedico(medicoId: number): Promise<DisponibilidadTemporal[]> {
    if (!medicoId || medicoId <= 0) {
      throw new Error('El ID del médico debe ser un número mayor a 0');
    }

    return await this.disponibilidadTemporalPort.findByMedico(medicoId);
  }

  async getDisponibilidadesByFechas(fechaInicio: Date, fechaFin: Date): Promise<DisponibilidadTemporal[]> {
    if (!fechaInicio) {
      throw new Error('La fecha de inicio es requerida');
    }

    if (!fechaFin) {
      throw new Error('La fecha de fin es requerida');
    }

    if (fechaInicio >= fechaFin) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    return await this.disponibilidadTemporalPort.findByFechas(fechaInicio, fechaFin);
  }

  async updateDisponibilidadTemporal(id: number, disponibilidad: Partial<DisponibilidadTemporal>): Promise<DisponibilidadTemporal | null> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }

    // Validar que la disponibilidad existe
    const disponibilidadExistente = await this.disponibilidadTemporalPort.findById(id);
    if (!disponibilidadExistente) {
      throw new Error('La disponibilidad temporal no existe');
    }

    // Validaciones para campos que se van a actualizar
    if (disponibilidad.fecha_inicio && disponibilidad.fecha_fin) {
      if (disponibilidad.fecha_inicio >= disponibilidad.fecha_fin) {
        throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
      }
    }

    if (disponibilidad.tipo) {
      const tiposValidos = ['vacaciones', 'ausencia', 'capacitacion', 'otro'];
      if (!tiposValidos.includes(disponibilidad.tipo)) {
        throw new Error('El tipo debe ser uno de: vacaciones, ausencia, capacitacion, otro');
      }
    }

    if (disponibilidad.estado) {
      const estadosValidos = ['activo', 'inactivo'];
      if (!estadosValidos.includes(disponibilidad.estado)) {
        throw new Error('El estado debe ser activo o inactivo');
      }
    }

    return await this.disponibilidadTemporalPort.update(id, disponibilidad);
  }

  async deleteDisponibilidadTemporal(id: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }

    // Validar que la disponibilidad existe
    const disponibilidadExistente = await this.disponibilidadTemporalPort.findById(id);
    if (!disponibilidadExistente) {
      throw new Error('La disponibilidad temporal no existe');
    }

    return await this.disponibilidadTemporalPort.delete(id);
  }

  async getAllDisponibilidadesTemporales(): Promise<DisponibilidadTemporal[]> {
    return await this.disponibilidadTemporalPort.findAll();
  }
} 