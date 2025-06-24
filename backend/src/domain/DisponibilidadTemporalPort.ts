import { DisponibilidadTemporal } from './DisponibilidadTemporal';

export interface DisponibilidadTemporalPort {
  create(disponibilidad: DisponibilidadTemporal): Promise<DisponibilidadTemporal>;
  findById(id: number): Promise<DisponibilidadTemporal | null>;
  findByMedico(medicoId: number): Promise<DisponibilidadTemporal[]>;
  findByFechas(fechaInicio: Date, fechaFin: Date): Promise<DisponibilidadTemporal[]>;
  update(id: number, disponibilidad: Partial<DisponibilidadTemporal>): Promise<DisponibilidadTemporal | null>;
  delete(id: number): Promise<boolean>;
  findAll(): Promise<DisponibilidadTemporal[]>;
} 