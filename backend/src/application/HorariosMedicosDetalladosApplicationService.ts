import { HorariosMedicosDetallados } from '../domain/HorariosMedicosDetallados';
import { HorariosMedicosDetalladosPort } from '../domain/HorariosMedicosDetalladosPort';

export class HorariosMedicosDetalladosApplicationService {
  constructor(private horariosMedicosDetalladosPort: HorariosMedicosDetalladosPort) {}

  async createHorarioMedicoDetallado(horario: HorariosMedicosDetallados): Promise<HorariosMedicosDetallados> {
    // Validaciones
    if (!horario.medico || horario.medico <= 0) {
      throw new Error('El ID del médico es requerido y debe ser mayor a 0');
    }

    if (!horario.fecha) {
      throw new Error('La fecha es requerida');
    }

    if (!horario.hora_inicio) {
      throw new Error('La hora de inicio es requerida');
    }

    if (!horario.hora_fin) {
      throw new Error('La hora de fin es requerida');
    }

    // Validar formato de hora (HH:mm:ss)
    const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (!horaRegex.test(horario.hora_inicio)) {
      throw new Error('La hora de inicio debe tener el formato HH:mm o HH:mm:ss');
    }

    if (!horaRegex.test(horario.hora_fin)) {
      throw new Error('La hora de fin debe tener el formato HH:mm o HH:mm:ss');
    }

    // Validar que la hora de inicio sea menor que la hora de fin
    const horaInicio = new Date(`2000-01-01T${horario.hora_inicio}`);
    const horaFin = new Date(`2000-01-01T${horario.hora_fin}`);
    if (horaInicio >= horaFin) {
      throw new Error('La hora de inicio debe ser anterior a la hora de fin');
    }

    if (horario.tipo) {
      const tiposValidos = ['turno', 'extra', 'emergencia', 'otro'];
      if (!tiposValidos.includes(horario.tipo)) {
        throw new Error('El tipo debe ser uno de: turno, extra, emergencia, otro');
      }
    }

    if (horario.estado) {
      const estadosValidos = ['activo', 'inactivo', 'cancelado'];
      if (!estadosValidos.includes(horario.estado)) {
        throw new Error('El estado debe ser uno de: activo, inactivo, cancelado');
      }
    }

    if (horario.creado_por && horario.creado_por <= 0) {
      throw new Error('El ID del usuario creador debe ser mayor a 0');
    }

    // Validar que no exista un horario solapado para el mismo médico y fecha
    const horariosExistentes = await this.horariosMedicosDetalladosPort.findByMedicoAndFecha(horario.medico, horario.fecha);
    const haySolapamiento = horariosExistentes.some(existente => {
      if (existente.estado === 'cancelado') return false;
      
      const existenteInicio = new Date(`2000-01-01T${existente.hora_inicio}`);
      const existenteFin = new Date(`2000-01-01T${existente.hora_fin}`);
      
      return (
        (horaInicio < existenteFin && horaFin > existenteInicio)
      );
    });

    if (haySolapamiento) {
      throw new Error('Ya existe un horario para el médico en la fecha y rango de horas especificado');
    }

    // Establecer valores por defecto
    const nuevoHorario: HorariosMedicosDetallados = {
      ...horario,
      tipo: horario.tipo || 'turno',
      estado: horario.estado || 'activo',
      fecha_creacion: horario.fecha_creacion || new Date()
    };

    return await this.horariosMedicosDetalladosPort.create(nuevoHorario);
  }

  async getHorarioMedicoDetalladoById(id: number): Promise<HorariosMedicosDetallados | null> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }

    return await this.horariosMedicosDetalladosPort.findById(id);
  }

  async getHorariosByMedico(medicoId: number): Promise<HorariosMedicosDetallados[]> {
    if (!medicoId || medicoId <= 0) {
      throw new Error('El ID del médico debe ser un número mayor a 0');
    }

    return await this.horariosMedicosDetalladosPort.findByMedico(medicoId);
  }

  async getHorariosByFecha(fecha: Date): Promise<HorariosMedicosDetallados[]> {
    if (!fecha) {
      throw new Error('La fecha es requerida para la búsqueda');
    }

    return await this.horariosMedicosDetalladosPort.findByFecha(fecha);
  }

  async getHorariosByMedicoAndFecha(medicoId: number, fecha: Date): Promise<HorariosMedicosDetallados[]> {
    if (!medicoId || medicoId <= 0) {
      throw new Error('El ID del médico debe ser un número mayor a 0');
    }

    if (!fecha) {
      throw new Error('La fecha es requerida para la búsqueda');
    }

    return await this.horariosMedicosDetalladosPort.findByMedicoAndFecha(medicoId, fecha);
  }

  async getHorariosByTipo(tipo: string): Promise<HorariosMedicosDetallados[]> {
    if (!tipo) {
      throw new Error('El tipo es requerido para la búsqueda');
    }

    const tiposValidos = ['turno', 'extra', 'emergencia', 'otro'];
    if (!tiposValidos.includes(tipo)) {
      throw new Error('El tipo debe ser uno de: turno, extra, emergencia, otro');
    }

    return await this.horariosMedicosDetalladosPort.findByTipo(tipo);
  }

  async getHorariosByEstado(estado: string): Promise<HorariosMedicosDetallados[]> {
    if (!estado) {
      throw new Error('El estado es requerido para la búsqueda');
    }

    const estadosValidos = ['activo', 'inactivo', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      throw new Error('El estado debe ser uno de: activo, inactivo, cancelado');
    }

    return await this.horariosMedicosDetalladosPort.findByEstado(estado);
  }

  async updateHorarioMedicoDetallado(id: number, horario: Partial<HorariosMedicosDetallados>): Promise<HorariosMedicosDetallados | null> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }

    // Validar que el horario existe
    const horarioExistente = await this.horariosMedicosDetalladosPort.findById(id);
    if (!horarioExistente) {
      throw new Error('El horario médico detallado no existe');
    }

    // Validaciones para campos que se van a actualizar
    if (horario.medico !== undefined && horario.medico <= 0) {
      throw new Error('El ID del médico debe ser mayor a 0');
    }

    if (horario.hora_inicio) {
      const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
      if (!horaRegex.test(horario.hora_inicio)) {
        throw new Error('La hora de inicio debe tener el formato HH:mm o HH:mm:ss');
      }
    }

    if (horario.hora_fin) {
      const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
      if (!horaRegex.test(horario.hora_fin)) {
        throw new Error('La hora de fin debe tener el formato HH:mm o HH:mm:ss');
      }
    }

    // Validar que la hora de inicio sea menor que la hora de fin si ambas están presentes
    if (horario.hora_inicio && horario.hora_fin) {
      const horaInicio = new Date(`2000-01-01T${horario.hora_inicio}`);
      const horaFin = new Date(`2000-01-01T${horario.hora_fin}`);
      if (horaInicio >= horaFin) {
        throw new Error('La hora de inicio debe ser anterior a la hora de fin');
      }
    }

    if (horario.tipo) {
      const tiposValidos = ['turno', 'extra', 'emergencia', 'otro'];
      if (!tiposValidos.includes(horario.tipo)) {
        throw new Error('El tipo debe ser uno de: turno, extra, emergencia, otro');
      }
    }

    if (horario.estado) {
      const estadosValidos = ['activo', 'inactivo', 'cancelado'];
      if (!estadosValidos.includes(horario.estado)) {
        throw new Error('El estado debe ser uno de: activo, inactivo, cancelado');
      }
    }

    if (horario.creado_por !== undefined && horario.creado_por <= 0) {
      throw new Error('El ID del usuario creador debe ser mayor a 0');
    }

    return await this.horariosMedicosDetalladosPort.update(id, horario);
  }

  async deleteHorarioMedicoDetallado(id: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }

    // Validar que el horario existe
    const horarioExistente = await this.horariosMedicosDetalladosPort.findById(id);
    if (!horarioExistente) {
      throw new Error('El horario médico detallado no existe');
    }

    return await this.horariosMedicosDetalladosPort.delete(id);
  }

  async getAllHorariosMedicosDetallados(): Promise<HorariosMedicosDetallados[]> {
    return await this.horariosMedicosDetalladosPort.findAll();
  }
} 