import { Repository } from 'typeorm';
import { Enfermedades as EnfermedadesEntity } from '../entities/Enfermedades';
import { Enfermedades } from '../../domain/Enfermedades';
import { EnfermedadesPort } from '../../domain/EnfermedadesPort';
import { AppDataSource } from '../config/data-base';

export class EnfermedadesAdapter implements EnfermedadesPort {
  private repository: Repository<EnfermedadesEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(EnfermedadesEntity);
  }

  async create(enfermedad: Enfermedades): Promise<Enfermedades> {
    const nuevaEnfermedad = this.repository.create({
      nombre: enfermedad.nombre,
      descripcion: enfermedad.descripcion,
      categoria: enfermedad.categoria,
      estado: enfermedad.estado || 'activo',
      fecha_creacion: enfermedad.fecha_creacion || new Date()
    });

    const saved = await this.repository.save(nuevaEnfermedad);
    return {
      id_enfermedad: saved.id_enfermedad,
      nombre: saved.nombre,
      descripcion: saved.descripcion,
      categoria: saved.categoria,
      estado: saved.estado,
      fecha_creacion: saved.fecha_creacion
    };
  }

  async findById(id: number): Promise<Enfermedades | null> {
    const enfermedad = await this.repository.findOne({
      where: { id_enfermedad: id }
    });

    if (!enfermedad) return null;

    return {
      id_enfermedad: enfermedad.id_enfermedad,
      nombre: enfermedad.nombre,
      descripcion: enfermedad.descripcion,
      categoria: enfermedad.categoria,
      estado: enfermedad.estado,
      fecha_creacion: enfermedad.fecha_creacion
    };
  }

  async findByNombre(nombre: string): Promise<Enfermedades[]> {
    const enfermedades = await this.repository
      .createQueryBuilder('enfermedad')
      .where('LOWER(enfermedad.nombre) LIKE LOWER(:nombre)', { nombre: `%${nombre}%` })
      .orderBy('enfermedad.nombre', 'ASC')
      .getMany();

    return enfermedades.map(enfermedad => ({
      id_enfermedad: enfermedad.id_enfermedad,
      nombre: enfermedad.nombre,
      descripcion: enfermedad.descripcion,
      categoria: enfermedad.categoria,
      estado: enfermedad.estado,
      fecha_creacion: enfermedad.fecha_creacion
    }));
  }

  async findByCategoria(categoria: string): Promise<Enfermedades[]> {
    const enfermedades = await this.repository.find({
      where: { categoria: categoria },
      order: { nombre: 'ASC' }
    });

    return enfermedades.map(enfermedad => ({
      id_enfermedad: enfermedad.id_enfermedad,
      nombre: enfermedad.nombre,
      descripcion: enfermedad.descripcion,
      categoria: enfermedad.categoria,
      estado: enfermedad.estado,
      fecha_creacion: enfermedad.fecha_creacion
    }));
  }

  async findByEstado(estado: string): Promise<Enfermedades[]> {
    const enfermedades = await this.repository.find({
      where: { estado: estado },
      order: { nombre: 'ASC' }
    });

    return enfermedades.map(enfermedad => ({
      id_enfermedad: enfermedad.id_enfermedad,
      nombre: enfermedad.nombre,
      descripcion: enfermedad.descripcion,
      categoria: enfermedad.categoria,
      estado: enfermedad.estado,
      fecha_creacion: enfermedad.fecha_creacion
    }));
  }

  async update(id: number, enfermedad: Partial<Enfermedades>): Promise<Enfermedades | null> {
    const existingEnfermedad = await this.repository.findOne({
      where: { id_enfermedad: id }
    });

    if (!existingEnfermedad) return null;

    // Actualizar solo los campos proporcionados
    if (enfermedad.nombre !== undefined) existingEnfermedad.nombre = enfermedad.nombre;
    if (enfermedad.descripcion !== undefined) existingEnfermedad.descripcion = enfermedad.descripcion;
    if (enfermedad.categoria !== undefined) existingEnfermedad.categoria = enfermedad.categoria;
    if (enfermedad.estado !== undefined) existingEnfermedad.estado = enfermedad.estado;

    const updated = await this.repository.save(existingEnfermedad);
    
    return {
      id_enfermedad: updated.id_enfermedad,
      nombre: updated.nombre,
      descripcion: updated.descripcion,
      categoria: updated.categoria,
      estado: updated.estado,
      fecha_creacion: updated.fecha_creacion
    };
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAll(): Promise<Enfermedades[]> {
    const enfermedades = await this.repository.find({
      order: { nombre: 'ASC' }
    });

    return enfermedades.map(enfermedad => ({
      id_enfermedad: enfermedad.id_enfermedad,
      nombre: enfermedad.nombre,
      descripcion: enfermedad.descripcion,
      categoria: enfermedad.categoria,
      estado: enfermedad.estado,
      fecha_creacion: enfermedad.fecha_creacion
    }));
  }
} 