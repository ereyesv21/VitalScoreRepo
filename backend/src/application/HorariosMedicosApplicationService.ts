import { HorariosMedicos } from '../domain/HorariosMedicos';
import { HorariosMedicosPort } from '../domain/HorariosMedicosPort';
import { CitasMedicasPort } from '../domain/CitasMedicasPort';

export class HorariosMedicosApplicationService {
  constructor(
    private horariosMedicosPort: HorariosMedicosPort,
    private citasMedicasPort: CitasMedicasPort
  ) {}

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

  // NUEVO MÉTODO: Obtener horarios disponibles de un médico para una fecha
  async getDisponibilidadByMedicoYFecha(medicoId: number, fecha: string): Promise<any[]> {
    console.log('[HorariosMedicosApplicationService] getDisponibilidadByMedicoYFecha - medicoId:', medicoId, 'fecha:', fecha);
    
    if (!medicoId || !fecha) {
      throw new Error('El ID del médico y la fecha son requeridos');
    }
    // Obtener el día de la semana (1=Lunes, 7=Domingo)
    const fechaObj = new Date(fecha);
    let diaSemana = fechaObj.getUTCDay();
    diaSemana = diaSemana === 0 ? 7 : diaSemana;

    console.log('[HorariosMedicosApplicationService] día de la semana calculado:', diaSemana);

    // Obtener todos los horarios del médico para ese día
    const horarios = await this.horariosMedicosPort.findByMedicoAndDia(medicoId, diaSemana);
    console.log('[HorariosMedicosApplicationService] horarios encontrados:', horarios.length);

    // Obtener las citas agendadas para ese médico y fecha
    const citas = await this.citasMedicasPort.getCitasMedicasByMedicoAndFecha(medicoId, fechaObj);
    console.log('[HorariosMedicosApplicationService] citas encontradas para médico', medicoId, 'fecha', fecha, ':', citas.length);
    console.log('[HorariosMedicosApplicationService] detalle de citas:', JSON.stringify(citas, null, 2));

    console.log('[HorariosMedicosApplicationService] --- DEPURACIÓN INICIO ---');
    console.log('[HorariosMedicosApplicationService] Horarios asignados para el médico y día:', JSON.stringify(horarios, null, 2));
    console.log('[HorariosMedicosApplicationService] Citas agendadas para el médico y fecha:', JSON.stringify(citas, null, 2));
    // Marcar cada horario con disponible: true/false
    const horariosConDisponibilidad = horarios.map(horario => {
      const toMinutes = (horaStr: string): number => {
        const [h, m] = horaStr.split(':');
        return parseInt(h, 10) * 60 + parseInt(m, 10);
      };
      const hInicio = toMinutes(horario.hora_inicio);
      const hFin = toMinutes(horario.hora_fin);
      console.log('[HorariosMedicosApplicationService] Evaluando horario:', horario.hora_inicio, '-', horario.hora_fin);
      const ocupado = citas.some(cita => {
        const cInicio = toMinutes(cita.hora_inicio);
        const cFin = toMinutes(cita.hora_fin);
        const estadoOcupado = ['programada', 'confirmada', 'en_progreso'].includes(cita.estado);
        const solapa = hInicio < cFin && hFin > cInicio;
        if (estadoOcupado && solapa) {
          console.log('[HorariosMedicosApplicationService] --> Solapamiento detectado: horario', horario.hora_inicio, '-', horario.hora_fin, 'con cita', cita.hora_inicio, '-', cita.hora_fin, 'estado:', cita.estado);
        }
        return estadoOcupado && solapa;
      });
      console.log('[HorariosMedicosApplicationService] Resultado:', horario.hora_inicio, '-', horario.hora_fin, 'ocupado:', ocupado);
      return {
        ...horario,
        disponible: !ocupado
      };
    });
    console.log('[HorariosMedicosApplicationService] --- DEPURACIÓN FIN ---');
    
    return horariosConDisponibilidad;
  }
} 