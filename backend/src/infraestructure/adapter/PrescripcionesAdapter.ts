import { Repository } from 'typeorm';
import { Prescripciones as PrescripcionesEntity } from '../entities/Prescripciones';
import { Prescripciones } from '../../domain/Prescripciones';
import { PrescripcionesPort } from '../../domain/PrescripcionesPort';
import { AppDataSource } from '../config/data-base';

export class PrescripcionesAdapter implements PrescripcionesPort {
  private repository: Repository<PrescripcionesEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(PrescripcionesEntity);
  }

  async create(prescripcion: Prescripciones): Promise<Prescripciones> {
    const nuevaPrescripcion = this.repository.create({
      paciente: prescripcion.paciente,
      medico: prescripcion.medico,
      cita: prescripcion.cita,
      medicamento: prescripcion.medicamento,
      dosis: prescripcion.dosis,
      frecuencia: prescripcion.frecuencia,
      duracion: prescripcion.duracion,
      instrucciones: prescripcion.instrucciones || undefined,
      fecha_inicio: prescripcion.fecha_inicio,
      fecha_fin: prescripcion.fecha_fin,
      estado: prescripcion.estado || 'activa',
      fecha_creacion: prescripcion.fecha_creacion || new Date()
    });

    const saved = await this.repository.save(nuevaPrescripcion);
    return this.toDomain(saved);
  }

  async findById(id: number): Promise<Prescripciones | null> {
    const prescripcion = await this.repository.findOne({
      where: { id_prescripcion: id },
      relations: ['pacienteRelacion', 'medicoRelacion', 'citaRelacion', 'medicamentoRelacion']
    });

    if (!prescripcion) return null;

    return this.toDomain(prescripcion);
  }

  async findByPaciente(pacienteId: number): Promise<Prescripciones[]> {
    const prescripciones = await this.repository.find({
      where: { paciente: pacienteId },
      relations: ['pacienteRelacion', 'medicoRelacion', 'citaRelacion', 'medicamentoRelacion'],
      order: { fecha_creacion: 'DESC' }
    });

    return prescripciones.map(prescripcion => this.toDomain(prescripcion));
  }

  async findByMedico(medicoId: number): Promise<Prescripciones[]> {
    const prescripciones = await this.repository.find({
      where: { medico: medicoId },
      relations: ['pacienteRelacion', 'medicoRelacion', 'citaRelacion', 'medicamentoRelacion'],
      order: { fecha_creacion: 'DESC' }
    });

    return prescripciones.map(prescripcion => this.toDomain(prescripcion));
  }

  async findByCita(citaId: number): Promise<Prescripciones[]> {
    const prescripciones = await this.repository.find({
      where: { cita: citaId },
      relations: ['pacienteRelacion', 'medicoRelacion', 'citaRelacion', 'medicamentoRelacion'],
      order: { fecha_creacion: 'DESC' }
    });

    return prescripciones.map(prescripcion => this.toDomain(prescripcion));
  }

  async findByMedicamento(medicamentoId: number): Promise<Prescripciones[]> {
    const prescripciones = await this.repository.find({
      where: { medicamento: medicamentoId },
      relations: ['pacienteRelacion', 'medicoRelacion', 'citaRelacion', 'medicamentoRelacion'],
      order: { fecha_creacion: 'DESC' }
    });

    return prescripciones.map(prescripcion => this.toDomain(prescripcion));
  }

  async findByEstado(estado: string): Promise<Prescripciones[]> {
    const prescripciones = await this.repository.find({
      where: { estado },
      relations: ['pacienteRelacion', 'medicoRelacion', 'citaRelacion', 'medicamentoRelacion'],
      order: { fecha_creacion: 'DESC' }
    });

    return prescripciones.map(prescripcion => this.toDomain(prescripcion));
  }

  async findByFechas(fechaInicio: Date, fechaFin: Date): Promise<Prescripciones[]> {
    const prescripciones = await this.repository
      .createQueryBuilder('prescripcion')
      .leftJoinAndSelect('prescripcion.pacienteRelacion', 'paciente')
      .leftJoinAndSelect('prescripcion.medicoRelacion', 'medico')
      .leftJoinAndSelect('prescripcion.citaRelacion', 'cita')
      .leftJoinAndSelect('prescripcion.medicamentoRelacion', 'medicamento')
      .where('prescripcion.fecha_inicio <= :fechaFin', { fechaFin })
      .andWhere('(prescripcion.fecha_fin >= :fechaInicio OR prescripcion.fecha_fin IS NULL)', { fechaInicio })
      .orderBy('prescripcion.fecha_creacion', 'DESC')
      .getMany();

    return prescripciones.map(prescripcion => this.toDomain(prescripcion));
  }

  async update(id: number, prescripcion: Partial<Prescripciones>): Promise<Prescripciones | null> {
    const existingPrescripcion = await this.repository.findOne({
      where: { id_prescripcion: id }
    });

    if (!existingPrescripcion) return null;

    // Actualizar solo los campos proporcionados
    if (prescripcion.paciente !== undefined) existingPrescripcion.paciente = prescripcion.paciente;
    if (prescripcion.medico !== undefined) existingPrescripcion.medico = prescripcion.medico;
    if (prescripcion.cita !== undefined) existingPrescripcion.cita = prescripcion.cita;
    if (prescripcion.medicamento !== undefined) existingPrescripcion.medicamento = prescripcion.medicamento;
    if (prescripcion.dosis !== undefined) existingPrescripcion.dosis = prescripcion.dosis;
    if (prescripcion.frecuencia !== undefined) existingPrescripcion.frecuencia = prescripcion.frecuencia;
    if (prescripcion.duracion !== undefined) existingPrescripcion.duracion = prescripcion.duracion;
    if (prescripcion.instrucciones !== undefined) existingPrescripcion.instrucciones = prescripcion.instrucciones;
    if (prescripcion.fecha_inicio !== undefined) existingPrescripcion.fecha_inicio = prescripcion.fecha_inicio;
    if (prescripcion.fecha_fin !== undefined) existingPrescripcion.fecha_fin = prescripcion.fecha_fin;
    if (prescripcion.estado !== undefined) existingPrescripcion.estado = prescripcion.estado;

    const updated = await this.repository.save(existingPrescripcion);
    
    return this.toDomain(updated);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAll(): Promise<Prescripciones[]> {
    const prescripciones = await this.repository.find({
      relations: ['pacienteRelacion', 'medicoRelacion', 'citaRelacion', 'medicamentoRelacion'],
      order: { fecha_creacion: 'DESC' }
    });

    return prescripciones.map(prescripcion => this.toDomain(prescripcion));
  }

  // Transforma la entidad de infraestructura al modelo de dominio
  private toDomain(prescripcionEntity: PrescripcionesEntity): Prescripciones {
    return {
      id_prescripcion: prescripcionEntity.id_prescripcion,
      paciente: prescripcionEntity.paciente,
      medico: prescripcionEntity.medico,
      cita: prescripcionEntity.cita,
      medicamento: prescripcionEntity.medicamento,
      dosis: prescripcionEntity.dosis,
      frecuencia: prescripcionEntity.frecuencia,
      duracion: prescripcionEntity.duracion,
      instrucciones: prescripcionEntity.instrucciones,
      fecha_inicio: prescripcionEntity.fecha_inicio,
      fecha_fin: prescripcionEntity.fecha_fin,
      estado: prescripcionEntity.estado,
      fecha_creacion: prescripcionEntity.fecha_creacion
    };
  }
} 