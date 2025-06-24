export interface HorariosMedicos {
  id_horario?: number;
  medico: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  estado?: string;
  fecha_creacion?: Date;
  fecha_inicio?: Date;
  fecha_fin?: Date;
} 