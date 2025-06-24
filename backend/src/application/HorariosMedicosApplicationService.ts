import { HorariosMedicos } from '../domain/HorariosMedicos';
import { HorariosMedicosPort } from '../domain/HorariosMedicosPort';

export class HorariosMedicosApplicationService {
  constructor(private horariosMedicosPort: HorariosMedicosPort) {}

  async createHorarioMedico(horario: HorariosMedicos): Promise<HorariosMedicos> {
    // Validaciones
    if (!horario.medico || horario.medico <= 0) {
      throw new Error('El ID del médico es requerido y debe ser mayor a 0');
    }

    if (!horario.dia_semana || horario.dia_semana < 1 || horario.dia_semana > 7) {
      throw new Error('El día de la semana debe estar entre 1 y 7 (1=Lunes, 7=Domingo)');
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

    if (horario.estado) {
      const estadosValidos = ['activo', 'inactivo'];
      if (!estadosValidos.includes(horario.estado)) {
        throw new Error('El estado debe ser activo o inactivo');
      }
    }

    // Validar fechas si están presentes
    if (horario.fecha_inicio && horario.fecha_fin) {
      if (horario.fecha_inicio >= horario.fecha_fin) {
        throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
      }
    }

    // Validar que no exista un horario solapado para el mismo médico y día
    const horariosExistentes = await this.horariosMedicosPort.findByMedicoAndDia(horario.medico, horario.dia_semana);
    const haySolapamiento = horariosExistentes.some(existente => {
      if (existente.estado === 'inactivo') return false;
      
      const existenteInicio = new Date(`2000-01-01T${existente.hora_inicio}`);
      const existenteFin = new Date(`2000-01-01T${existente.hora_fin}`);
      
      return (
        (horaInicio < existenteFin && horaFin > existenteInicio)
      );
    });

    if (haySolapamiento) {
      throw new Error('Ya existe un horario para el médico en el día y rango de horas especificado');
    }

    // Establecer valores por defecto
    const nuevoHorario: HorariosMedicos = {
      ...horario,
      estado: horario.estado || 'activo',
      fecha_creacion: horario.fecha_creacion || new Date()
    };

    return await this.horariosMedicosPort.create(nuevoHorario);
  }

  async getHorarioMedicoById(id: number): Promise<HorariosMedicos | null> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }

    return await this.horariosMedicosPort.findById(id);
  }

  async getHorariosByMedico(medicoId: number): Promise<HorariosMedicos[]> {
    if (!medicoId || medicoId <= 0) {
      throw new Error('El ID del médico debe ser un número mayor a 0');
    }

    return await this.horariosMedicosPort.findByMedico(medicoId);
  }

  async getHorariosByDiaSemana(diaSemana: number): Promise<HorariosMedicos[]> {
    if (!diaSemana || diaSemana < 1 || diaSemana > 7) {
      throw new Error('El día de la semana debe estar entre 1 y 7');
    }

    return await this.horariosMedicosPort.findByDiaSemana(diaSemana);
  }

  async getHorariosByMedicoAndDia(medicoId: number, diaSemana: number): Promise<HorariosMedicos[]> {
    if (!medicoId || medicoId <= 0) {
      throw new Error('El ID del médico debe ser un número mayor a 0');
    }

    if (!diaSemana || diaSemana < 1 || diaSemana > 7) {
      throw new Error('El día de la semana debe estar entre 1 y 7');
    }

    return await this.horariosMedicosPort.findByMedicoAndDia(medicoId, diaSemana);
  }

  async updateHorarioMedico(id: number, horario: Partial<HorariosMedicos>): Promise<HorariosMedicos | null> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }

    // Validar que el horario existe
    const horarioExistente = await this.horariosMedicosPort.findById(id);
    if (!horarioExistente) {
      throw new Error('El horario médico no existe');
    }

    // Validaciones para campos que se van a actualizar
    if (horario.dia_semana !== undefined) {
      if (horario.dia_semana < 1 || horario.dia_semana > 7) {
        throw new Error('El día de la semana debe estar entre 1 y 7');
      }
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

    if (horario.estado) {
      const estadosValidos = ['activo', 'inactivo'];
      if (!estadosValidos.includes(horario.estado)) {
        throw new Error('El estado debe ser activo o inactivo');
      }
    }

    if (horario.fecha_inicio && horario.fecha_fin) {
      if (horario.fecha_inicio >= horario.fecha_fin) {
        throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
      }
    }

    return await this.horariosMedicosPort.update(id, horario);
  }

  async deleteHorarioMedico(id: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }

    // Validar que el horario existe
    const horarioExistente = await this.horariosMedicosPort.findById(id);
    if (!horarioExistente) {
      throw new Error('El horario médico no existe');
    }

    return await this.horariosMedicosPort.delete(id);
  }

  async getAllHorariosMedicos(): Promise<HorariosMedicos[]> {
    return await this.horariosMedicosPort.findAll();
  }
} 