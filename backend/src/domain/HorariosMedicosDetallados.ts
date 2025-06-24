export interface HorariosMedicosDetallados {
  id_horario?: number;
  medico: number;
  fecha: Date;
  hora_inicio: string;
  hora_fin: string;
  tipo?: string;
  estado?: string;
  creado_por?: number;
  fecha_creacion?: Date;
}

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