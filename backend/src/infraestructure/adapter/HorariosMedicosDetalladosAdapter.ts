import { Repository } from 'typeorm';
import { HorariosMedicosDetallados as HorariosMedicosDetalladosEntity } from '../entities/HorariosMedicosDetallados';
import { HorariosMedicosDetallados } from '../../domain/HorariosMedicosDetallados';
import { HorariosMedicosDetalladosPort } from '../../domain/HorariosMedicosDetalladosPort';
import { AppDataSource } from '../config/data-base';

export class HorariosMedicosDetalladosAdapter implements HorariosMedicosDetalladosPort {
  private repository: Repository<HorariosMedicosDetalladosEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(HorariosMedicosDetalladosEntity);
  }

  async create(horario: HorariosMedicosDetallados): Promise<HorariosMedicosDetallados> {
    const nuevoHorario = this.repository.create({
      medico: horario.medico,
      fecha: horario.fecha,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
      tipo: horario.tipo || 'turno',
      estado: horario.estado || 'activo',
      creado_por: horario.creado_por,
      fecha_creacion: horario.fecha_creacion || new Date()
    });

    const horarioGuardado = await this.repository.save(nuevoHorario);
    return this.mapToDomain(horarioGuardado);
  }

  async findById(id: number): Promise<HorariosMedicosDetallados | null> {
    const horario = await this.repository.findOne({
      where: { id_horario: id }
    });

    return horario ? this.mapToDomain(horario) : null;
  }

  async findByMedico(medicoId: number): Promise<HorariosMedicosDetallados[]> {
    const horarios = await this.repository.find({
      where: { medico: medicoId },
      order: { fecha: 'ASC', hora_inicio: 'ASC' }
    });

    return horarios.map(horario => this.mapToDomain(horario));
  }

  async findByFecha(fecha: Date): Promise<HorariosMedicosDetallados[]> {
    const horarios = await this.repository.find({
      where: { fecha: fecha },
      order: { hora_inicio: 'ASC' }
    });

    return horarios.map(horario => this.mapToDomain(horario));
  }

  async findByMedicoAndFecha(medicoId: number, fecha: Date): Promise<HorariosMedicosDetallados[]> {
    const horarios = await this.repository.find({
      where: { 
        medico: medicoId,
        fecha: fecha
      },
      order: { hora_inicio: 'ASC' }
    });

    return horarios.map(horario => this.mapToDomain(horario));
  }

  async findByTipo(tipo: string): Promise<HorariosMedicosDetallados[]> {
    const horarios = await this.repository.find({
      where: { tipo: tipo },
      order: { fecha: 'ASC', hora_inicio: 'ASC' }
    });

    return horarios.map(horario => this.mapToDomain(horario));
  }

  async findByEstado(estado: string): Promise<HorariosMedicosDetallados[]> {
    const horarios = await this.repository.find({
      where: { estado: estado },
      order: { fecha: 'ASC', hora_inicio: 'ASC' }
    });

    return horarios.map(horario => this.mapToDomain(horario));
  }

  async update(id: number, horario: Partial<HorariosMedicosDetallados>): Promise<HorariosMedicosDetallados | null> {
    const horarioExistente = await this.repository.findOne({
      where: { id_horario: id }
    });

    if (!horarioExistente) {
      return null;
    }

    const horarioActualizado = await this.repository.save({
      ...horarioExistente,
      ...horario
    });

    return this.mapToDomain(horarioActualizado);
  }

  async delete(id: number): Promise<boolean> {
    const resultado = await this.repository.delete(id);
    return (resultado.affected ?? 0) > 0;
  }

  async findAll(): Promise<HorariosMedicosDetallados[]> {
    const horarios = await this.repository.find({
      order: { fecha: 'ASC', hora_inicio: 'ASC' }
    });

    return horarios.map(horario => this.mapToDomain(horario));
  }

  private mapToDomain(entity: HorariosMedicosDetalladosEntity): HorariosMedicosDetallados {
    return {
      id_horario: entity.id_horario,
      medico: entity.medico,
      fecha: entity.fecha,
      hora_inicio: entity.hora_inicio,
      hora_fin: entity.hora_fin,
      tipo: entity.tipo,
      estado: entity.estado,
      creado_por: entity.creado_por,
      fecha_creacion: entity.fecha_creacion
    };
  }
} 