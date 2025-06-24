import { HorariosMedicos } from './HorariosMedicos';

export interface HorariosMedicosPort {
  create(horario: HorariosMedicos): Promise<HorariosMedicos>;
  findById(id: number): Promise<HorariosMedicos | null>;
  findByMedico(medicoId: number): Promise<HorariosMedicos[]>;
  findByDiaSemana(diaSemana: number): Promise<HorariosMedicos[]>;
  findByMedicoAndDia(medicoId: number, diaSemana: number): Promise<HorariosMedicos[]>;
  update(id: number, horario: Partial<HorariosMedicos>): Promise<HorariosMedicos | null>;
  delete(id: number): Promise<boolean>;
  findAll(): Promise<HorariosMedicos[]>;
} 