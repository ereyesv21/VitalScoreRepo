import { Especialidades } from './Especialidades';

export interface EspecialidadesPort {
  create(especialidad: Especialidades): Promise<Especialidades>;
  findById(id: number): Promise<Especialidades | null>;
  findByNombre(nombre: string): Promise<Especialidades | null>;
  findByEstado(estado: string): Promise<Especialidades[]>;
  update(id: number, especialidad: Partial<Especialidades>): Promise<Especialidades | null>;
  delete(id: number): Promise<boolean>;
  findAll(): Promise<Especialidades[]>;
} 