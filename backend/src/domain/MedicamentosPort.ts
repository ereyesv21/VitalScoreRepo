import { Medicamentos } from './Medicamentos';

export interface MedicamentosPort {
  create(medicamento: Medicamentos): Promise<Medicamentos>;
  findById(id: number): Promise<Medicamentos | null>;
  findByNombre(nombre: string): Promise<Medicamentos | null>;
  findByEstado(estado: string): Promise<Medicamentos[]>;
  update(id: number, medicamento: Partial<Medicamentos>): Promise<Medicamentos | null>;
  delete(id: number): Promise<boolean>;
  findAll(): Promise<Medicamentos[]>;
} 