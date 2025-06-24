import { Repository } from 'typeorm';
import { Especialidades as EspecialidadesEntity } from '../entities/Especialidades';
import { Especialidades } from '../../domain/Especialidades';
import { EspecialidadesPort } from '../../domain/EspecialidadesPort';
import { AppDataSource } from '../config/data-base';

export class EspecialidadesAdapter implements EspecialidadesPort {
  private repository: Repository<EspecialidadesEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(EspecialidadesEntity);
  }

  async create(especialidad: Especialidades): Promise<Especialidades> {
    const nuevaEspecialidad = this.repository.create({
      nombre: especialidad.nombre,
      descripcion: especialidad.descripcion,
      estado: especialidad.estado || 'activa'
    });

    const saved = await this.repository.save(nuevaEspecialidad);
    return {
      id_especialidad: saved.id_especialidad,
      nombre: saved.nombre,
      descripcion: saved.descripcion,
      estado: saved.estado
    };
  }

  async findById(id: number): Promise<Especialidades | null> {
    const especialidad = await this.repository.findOne({
      where: { id_especialidad: id }
    });

    if (!especialidad) return null;

    return {
      id_especialidad: especialidad.id_especialidad,
      nombre: especialidad.nombre,
      descripcion: especialidad.descripcion,
      estado: especialidad.estado
    };
  }

  async findByNombre(nombre: string): Promise<Especialidades | null> {
    const especialidad = await this.repository.findOne({
      where: { nombre: nombre }
    });

    if (!especialidad) return null;

    return {
      id_especialidad: especialidad.id_especialidad,
      nombre: especialidad.nombre,
      descripcion: especialidad.descripcion,
      estado: especialidad.estado
    };
  }

  async findByEstado(estado: string): Promise<Especialidades[]> {
    const especialidades = await this.repository.find({
      where: { estado: estado },
      order: { nombre: 'ASC' }
    });

    return especialidades.map(especialidad => ({
      id_especialidad: especialidad.id_especialidad,
      nombre: especialidad.nombre,
      descripcion: especialidad.descripcion,
      estado: especialidad.estado
    }));
  }

  async update(id: number, especialidad: Partial<Especialidades>): Promise<Especialidades | null> {
    const existingEspecialidad = await this.repository.findOne({
      where: { id_especialidad: id }
    });

    if (!existingEspecialidad) return null;

    // Actualizar solo los campos proporcionados
    if (especialidad.nombre !== undefined) existingEspecialidad.nombre = especialidad.nombre;
    if (especialidad.descripcion !== undefined) existingEspecialidad.descripcion = especialidad.descripcion;
    if (especialidad.estado !== undefined) existingEspecialidad.estado = especialidad.estado;

    const updated = await this.repository.save(existingEspecialidad);
    
    return {
      id_especialidad: updated.id_especialidad,
      nombre: updated.nombre,
      descripcion: updated.descripcion,
      estado: updated.estado
    };
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAll(): Promise<Especialidades[]> {
    const especialidades = await this.repository.find({
      order: { nombre: 'ASC' }
    });

    return especialidades.map(especialidad => ({
      id_especialidad: especialidad.id_especialidad,
      nombre: especialidad.nombre,
      descripcion: especialidad.descripcion,
      estado: especialidad.estado
    }));
  }
} 