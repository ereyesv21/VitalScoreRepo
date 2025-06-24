export interface Prescripciones {
  id_prescripcion: number;
  paciente: number;
  medico: number;
  cita: number | null;
  medicamento: number;
  dosis: string;
  frecuencia: string;
  duracion: string;
  instrucciones: string | null;
  fecha_inicio: Date;
  fecha_fin: Date | null;
  estado: string;
  fecha_creacion: Date;
} 