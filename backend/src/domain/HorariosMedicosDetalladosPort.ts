import { HorariosMedicosDetallados } from './HorariosMedicosDetallados';

export interface HorariosMedicosDetalladosPort {
  create(horario: HorariosMedicosDetallados): Promise<HorariosMedicosDetallados>;
  findById(id: number): Promise<HorariosMedicosDetallados | null>;
  findByMedico(medicoId: number): Promise<HorariosMedicosDetallados[]>;
  findByFecha(fecha: Date): Promise<HorariosMedicosDetallados[]>;
  findByMedicoAndFecha(medicoId: number, fecha: Date): Promise<HorariosMedicosDetallados[]>;
  findByTipo(tipo: string): Promise<HorariosMedicosDetallados[]>;
  findByEstado(estado: string): Promise<HorariosMedicosDetallados[]>;
  update(id: number, horario: Partial<HorariosMedicosDetallados>): Promise<HorariosMedicosDetallados | null>;
  delete(id: number): Promise<boolean>;
  findAll(): Promise<HorariosMedicosDetallados[]>;
} 