export interface HistorialTareas {
  id_historial_tarea?: number;
  tarea: number;
  paciente: number;
  fecha_completada: Date;
  hora_completada?: string;
  puntos_ganados: number;
  observaciones?: string;
  fecha_creacion?: Date;
}

export interface HistorialTareasPort {
  create(historial: HistorialTareas): Promise<HistorialTareas>;
  findById(id: number): Promise<HistorialTareas | null>;
  findByPaciente(pacienteId: number): Promise<HistorialTareas[]>;
  findByTarea(tareaId: number): Promise<HistorialTareas[]>;
  findByFecha(fecha: Date): Promise<HistorialTareas[]>;
  update(id: number, historial: Partial<HistorialTareas>): Promise<HistorialTareas | null>;
  delete(id: number): Promise<boolean>;
  findAll(): Promise<HistorialTareas[]>;
} 