export interface Enfermedades {
  id_enfermedad?: number;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  estado?: string;
  fecha_creacion?: Date;
}

export interface EnfermedadesPort {
  create(enfermedad: Enfermedades): Promise<Enfermedades>;
  findById(id: number): Promise<Enfermedades | null>;
  findByNombre(nombre: string): Promise<Enfermedades[]>;
  findByCategoria(categoria: string): Promise<Enfermedades[]>;
  findByEstado(estado: string): Promise<Enfermedades[]>;
  update(id: number, enfermedad: Partial<Enfermedades>): Promise<Enfermedades | null>;
  delete(id: number): Promise<boolean>;
  findAll(): Promise<Enfermedades[]>;
} 