import { Prescripciones } from "./Prescripciones";

export interface PrescripcionesPort {
  create(prescripcion: Prescripciones): Promise<Prescripciones>;
  findById(id: number): Promise<Prescripciones | null>;
  findByPaciente(pacienteId: number): Promise<Prescripciones[]>;
  findByMedico(medicoId: number): Promise<Prescripciones[]>;
  findByCita(citaId: number): Promise<Prescripciones[]>;
  findByMedicamento(medicamentoId: number): Promise<Prescripciones[]>;
  findByEstado(estado: string): Promise<Prescripciones[]>;
  findByFechas(fechaInicio: Date, fechaFin: Date): Promise<Prescripciones[]>;
  update(id: number, prescripcion: Partial<Prescripciones>): Promise<Prescripciones | null>;
  delete(id: number): Promise<boolean>;
  findAll(): Promise<Prescripciones[]>;
} 