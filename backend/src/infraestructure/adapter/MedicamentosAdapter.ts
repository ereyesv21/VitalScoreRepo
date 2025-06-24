import { Repository } from 'typeorm';
import { Medicamentos as MedicamentosEntity } from '../entities/Medicamentos';
import { Medicamentos } from '../../domain/Medicamentos';
import { MedicamentosPort } from '../../domain/MedicamentosPort';
import { AppDataSource } from '../config/data-base';

export class MedicamentosAdapter implements MedicamentosPort {
  private repository: Repository<MedicamentosEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(MedicamentosEntity);
  }

  async create(medicamento: Medicamentos): Promise<Medicamentos> {
    const nuevoMedicamento = this.repository.create({
      nombre: medicamento.nombre,
      descripcion: medicamento.descripcion,
      dosis_recomendada: medicamento.dosis_recomendada,
      frecuencia: medicamento.frecuencia,
      duracion_tratamiento: medicamento.duracion_tratamiento,
      efectos_secundarios: medicamento.efectos_secundarios,
      contraindicaciones: medicamento.contraindicaciones,
      estado: medicamento.estado || 'activo',
      fecha_creacion: medicamento.fecha_creacion || new Date()
    });

    const medicamentoGuardado = await this.repository.save(nuevoMedicamento);
    return this.mapToDomain(medicamentoGuardado);
  }

  async findById(id: number): Promise<Medicamentos | null> {
    const medicamento = await this.repository.findOne({
      where: { id_medicamento: id }
    });

    return medicamento ? this.mapToDomain(medicamento) : null;
  }

  async findByNombre(nombre: string): Promise<Medicamentos | null> {
    const medicamento = await this.repository.findOne({
      where: { nombre: nombre }
    });

    return medicamento ? this.mapToDomain(medicamento) : null;
  }

  async findByEstado(estado: string): Promise<Medicamentos[]> {
    const medicamentos = await this.repository.find({
      where: { estado: estado },
      order: { nombre: 'ASC' }
    });

    return medicamentos.map(medicamento => this.mapToDomain(medicamento));
  }

  async update(id: number, medicamento: Partial<Medicamentos>): Promise<Medicamentos | null> {
    const medicamentoExistente = await this.repository.findOne({
      where: { id_medicamento: id }
    });

    if (!medicamentoExistente) {
      return null;
    }

    const medicamentoActualizado = await this.repository.save({
      ...medicamentoExistente,
      ...medicamento
    });

    return this.mapToDomain(medicamentoActualizado);
  }

  async delete(id: number): Promise<boolean> {
    const resultado = await this.repository.delete(id);
    return (resultado.affected ?? 0) > 0;
  }

  async findAll(): Promise<Medicamentos[]> {
    const medicamentos = await this.repository.find({
      order: { nombre: 'ASC' }
    });

    return medicamentos.map(medicamento => this.mapToDomain(medicamento));
  }

  private mapToDomain(entity: MedicamentosEntity): Medicamentos {
    return {
      id_medicamento: entity.id_medicamento,
      nombre: entity.nombre,
      descripcion: entity.descripcion,
      dosis_recomendada: entity.dosis_recomendada,
      frecuencia: entity.frecuencia,
      duracion_tratamiento: entity.duracion_tratamiento,
      efectos_secundarios: entity.efectos_secundarios,
      contraindicaciones: entity.contraindicaciones,
      estado: entity.estado,
      fecha_creacion: entity.fecha_creacion
    };
  }
} 