import { Repository } from 'typeorm';
import { HorariosMedicos as HorariosMedicosEntity } from '../entities/HorariosMedicos';
import { HorariosMedicos } from '../../domain/HorariosMedicos';
import { HorariosMedicosPort } from '../../domain/HorariosMedicosPort';
import { AppDataSource } from '../config/data-base';

export class HorariosMedicosAdapter implements HorariosMedicosPort {
  private repository: Repository<HorariosMedicosEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(HorariosMedicosEntity);
  }

  async create(horario: HorariosMedicos): Promise<HorariosMedicos> {
    const nuevoHorario = this.repository.create({
      medico: horario.medico,
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
      estado: horario.estado || 'activo',
      fecha_creacion: horario.fecha_creacion || new Date(),
      fecha_inicio: horario.fecha_inicio,
      fecha_fin: horario.fecha_fin
    });

    const saved = await this.repository.save(nuevoHorario);
    return {
      id_horario: saved.id_horario,
      medico: saved.medico,
      dia_semana: saved.dia_semana,
      hora_inicio: saved.hora_inicio,
      hora_fin: saved.hora_fin,
      estado: saved.estado,
      fecha_creacion: saved.fecha_creacion,
      fecha_inicio: saved.fecha_inicio,
      fecha_fin: saved.fecha_fin
    };
  }

  async findById(id: number): Promise<HorariosMedicos | null> {
    const horario = await this.repository.findOne({
      where: { id_horario: id },
      relations: ['medicoRelacion']
    });

    if (!horario) return null;

    return {
      id_horario: horario.id_horario,
      medico: horario.medico,
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
      estado: horario.estado,
      fecha_creacion: horario.fecha_creacion,
      fecha_inicio: horario.fecha_inicio,
      fecha_fin: horario.fecha_fin
    };
  }

  async findByMedico(medicoId: number): Promise<HorariosMedicos[]> {
    const horarios = await this.repository.find({
      where: { medico: medicoId },
      relations: ['medicoRelacion'],
      order: { dia_semana: 'ASC', hora_inicio: 'ASC' }
    });

    return horarios.map(horario => ({
      id_horario: horario.id_horario,
      medico: horario.medico,
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
      estado: horario.estado,
      fecha_creacion: horario.fecha_creacion,
      fecha_inicio: horario.fecha_inicio,
      fecha_fin: horario.fecha_fin
    }));
  }

  async findByDiaSemana(diaSemana: number): Promise<HorariosMedicos[]> {
    const horarios = await this.repository.find({
      where: { dia_semana: diaSemana },
      relations: ['medicoRelacion'],
      order: { hora_inicio: 'ASC' }
    });

    return horarios.map(horario => ({
      id_horario: horario.id_horario,
      medico: horario.medico,
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
      estado: horario.estado,
      fecha_creacion: horario.fecha_creacion,
      fecha_inicio: horario.fecha_inicio,
      fecha_fin: horario.fecha_fin
    }));
  }

  async findByMedicoAndDia(medicoId: number, diaSemana: number): Promise<HorariosMedicos[]> {
    const horarios = await this.repository.find({
      where: { medico: medicoId, dia_semana: diaSemana },
      relations: ['medicoRelacion'],
      order: { hora_inicio: 'ASC' }
    });

    return horarios.map(horario => ({
      id_horario: horario.id_horario,
      medico: horario.medico,
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
      estado: horario.estado,
      fecha_creacion: horario.fecha_creacion,
      fecha_inicio: horario.fecha_inicio,
      fecha_fin: horario.fecha_fin
    }));
  }

  async update(id: number, horario: Partial<HorariosMedicos>): Promise<HorariosMedicos | null> {
    const existingHorario = await this.repository.findOne({
      where: { id_horario: id }
    });

    if (!existingHorario) return null;

    // Actualizar solo los campos proporcionados
    if (horario.medico !== undefined) existingHorario.medico = horario.medico;
    if (horario.dia_semana !== undefined) existingHorario.dia_semana = horario.dia_semana;
    if (horario.hora_inicio !== undefined) existingHorario.hora_inicio = horario.hora_inicio;
    if (horario.hora_fin !== undefined) existingHorario.hora_fin = horario.hora_fin;
    if (horario.estado !== undefined) existingHorario.estado = horario.estado;
    if (horario.fecha_inicio !== undefined) existingHorario.fecha_inicio = horario.fecha_inicio;
    if (horario.fecha_fin !== undefined) existingHorario.fecha_fin = horario.fecha_fin;

    const updated = await this.repository.save(existingHorario);
    
    return {
      id_horario: updated.id_horario,
      medico: updated.medico,
      dia_semana: updated.dia_semana,
      hora_inicio: updated.hora_inicio,
      hora_fin: updated.hora_fin,
      estado: updated.estado,
      fecha_creacion: updated.fecha_creacion,
      fecha_inicio: updated.fecha_inicio,
      fecha_fin: updated.fecha_fin
    };
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAll(): Promise<HorariosMedicos[]> {
    const horarios = await this.repository.find({
      relations: ['medicoRelacion'],
      order: { medico: 'ASC', dia_semana: 'ASC', hora_inicio: 'ASC' }
    });

    return horarios.map(horario => ({
      id_horario: horario.id_horario,
      medico: horario.medico,
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
      estado: horario.estado,
      fecha_creacion: horario.fecha_creacion,
      fecha_inicio: horario.fecha_inicio,
      fecha_fin: horario.fecha_fin
    }));
  }
} 