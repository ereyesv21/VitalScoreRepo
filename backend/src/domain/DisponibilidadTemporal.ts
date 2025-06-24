export interface DisponibilidadTemporal {
  id_disponibilidad?: number;
  medico: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  tipo: 'vacaciones' | 'ausencia' | 'capacitacion' | 'otro';
  motivo?: string;
  estado?: string;
  fecha_creacion?: Date;
} 