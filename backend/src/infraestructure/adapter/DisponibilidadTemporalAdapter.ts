import { Repository } from 'typeorm';
import { DisponibilidadTemporal as DisponibilidadTemporalEntity } from '../entities/DisponibilidadTemporal';
import { DisponibilidadTemporal } from '../../domain/DisponibilidadTemporal';
import { DisponibilidadTemporalPort } from '../../domain/DisponibilidadTemporalPort';
import { AppDataSource } from '../config/data-base';

export class DisponibilidadTemporalAdapter implements DisponibilidadTemporalPort {
  private repository: Repository<DisponibilidadTemporalEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(DisponibilidadTemporalEntity);
  }

  async create(disponibilidad: DisponibilidadTemporal): Promise<DisponibilidadTemporal> {
    const nuevaDisponibilidad = this.repository.create({
      medico: disponibilidad.medico,
      fecha_inicio: disponibilidad.fecha_inicio,
      fecha_fin: disponibilidad.fecha_fin,
      tipo: disponibilidad.tipo,
      motivo: disponibilidad.motivo,
      estado: disponibilidad.estado || 'activo',
      fecha_creacion: disponibilidad.fecha_creacion || new Date()
    });

    const saved = await this.repository.save(nuevaDisponibilidad);
    return {
      id_disponibilidad: saved.id_disponibilidad,
      medico: saved.medico,
      fecha_inicio: saved.fecha_inicio,
      fecha_fin: saved.fecha_fin,
      tipo: saved.tipo,
      motivo: saved.motivo,
      estado: saved.estado,
      fecha_creacion: saved.fecha_creacion
    };
  }

  async findById(id: number): Promise<DisponibilidadTemporal | null> {
    const disponibilidad = await this.repository.findOne({
      where: { id_disponibilidad: id },
      relations: ['medicoRelacion']
    });

    if (!disponibilidad) return null;

    return {
      id_disponibilidad: disponibilidad.id_disponibilidad,
      medico: disponibilidad.medico,
      fecha_inicio: disponibilidad.fecha_inicio,
      fecha_fin: disponibilidad.fecha_fin,
      tipo: disponibilidad.tipo,
      motivo: disponibilidad.motivo,
      estado: disponibilidad.estado,
      fecha_creacion: disponibilidad.fecha_creacion
    };
  }

  async findByMedico(medicoId: number): Promise<DisponibilidadTemporal[]> {
    const disponibilidades = await this.repository.find({
      where: { medico: medicoId },
      relations: ['medicoRelacion'],
      order: { fecha_inicio: 'ASC' }
    });

    return disponibilidades.map(disponibilidad => ({
      id_disponibilidad: disponibilidad.id_disponibilidad,
      medico: disponibilidad.medico,
      fecha_inicio: disponibilidad.fecha_inicio,
      fecha_fin: disponibilidad.fecha_fin,
      tipo: disponibilidad.tipo,
      motivo: disponibilidad.motivo,
      estado: disponibilidad.estado,
      fecha_creacion: disponibilidad.fecha_creacion
    }));
  }

  async findByFechas(fechaInicio: Date, fechaFin: Date): Promise<DisponibilidadTemporal[]> {
    const disponibilidades = await this.repository
      .createQueryBuilder('disponibilidad')
      .leftJoinAndSelect('disponibilidad.medicoRelacion', 'medico')
      .where('disponibilidad.fecha_inicio <= :fechaFin', { fechaFin })
      .andWhere('disponibilidad.fecha_fin >= :fechaInicio', { fechaInicio })
      .orderBy('disponibilidad.fecha_inicio', 'ASC')
      .getMany();

    return disponibilidades.map(disponibilidad => ({
      id_disponibilidad: disponibilidad.id_disponibilidad,
      medico: disponibilidad.medico,
      fecha_inicio: disponibilidad.fecha_inicio,
      fecha_fin: disponibilidad.fecha_fin,
      tipo: disponibilidad.tipo,
      motivo: disponibilidad.motivo,
      estado: disponibilidad.estado,
      fecha_creacion: disponibilidad.fecha_creacion
    }));
  }

  async update(id: number, disponibilidad: Partial<DisponibilidadTemporal>): Promise<DisponibilidadTemporal | null> {
    const existingDisponibilidad = await this.repository.findOne({
      where: { id_disponibilidad: id }
    });

    if (!existingDisponibilidad) return null;

    // Actualizar solo los campos proporcionados
    if (disponibilidad.medico !== undefined) existingDisponibilidad.medico = disponibilidad.medico;
    if (disponibilidad.fecha_inicio !== undefined) existingDisponibilidad.fecha_inicio = disponibilidad.fecha_inicio;
    if (disponibilidad.fecha_fin !== undefined) existingDisponibilidad.fecha_fin = disponibilidad.fecha_fin;
    if (disponibilidad.tipo !== undefined) existingDisponibilidad.tipo = disponibilidad.tipo;
    if (disponibilidad.motivo !== undefined) existingDisponibilidad.motivo = disponibilidad.motivo;
    if (disponibilidad.estado !== undefined) existingDisponibilidad.estado = disponibilidad.estado;

    const updated = await this.repository.save(existingDisponibilidad);
    
    return {
      id_disponibilidad: updated.id_disponibilidad,
      medico: updated.medico,
      fecha_inicio: updated.fecha_inicio,
      fecha_fin: updated.fecha_fin,
      tipo: updated.tipo,
      motivo: updated.motivo,
      estado: updated.estado,
      fecha_creacion: updated.fecha_creacion
    };
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAll(): Promise<DisponibilidadTemporal[]> {
    const disponibilidades = await this.repository.find({
      relations: ['medicoRelacion'],
      order: { fecha_creacion: 'DESC' }
    });

    return disponibilidades.map(disponibilidad => ({
      id_disponibilidad: disponibilidad.id_disponibilidad,
      medico: disponibilidad.medico,
      fecha_inicio: disponibilidad.fecha_inicio,
      fecha_fin: disponibilidad.fecha_fin,
      tipo: disponibilidad.tipo,
      motivo: disponibilidad.motivo,
      estado: disponibilidad.estado,
      fecha_creacion: disponibilidad.fecha_creacion
    }));
  }
} 