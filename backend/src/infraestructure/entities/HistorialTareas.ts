import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Paciente } from './Pacientes';
import { Tarea } from './Tareas';

@Entity('Historial_Tareas', { schema: 'vitalscore' })
@Index('idx_historial_tareas_fecha', ['fecha_completada'])
@Index('idx_historial_tareas_paciente', ['paciente'])
@Index('idx_historial_tareas_tarea', ['tarea'])
export class HistorialTareas {
  @PrimaryGeneratedColumn({ name: 'id_historial_tarea' })
  id_historial_tarea: number;

  @Column({ name: 'tarea', type: 'integer', nullable: false })
  tarea: number;

  @Column({ name: 'paciente', type: 'integer', nullable: false })
  paciente: number;

  @Column({ name: 'fecha_completada', type: 'date', nullable: false })
  fecha_completada: Date;

  @Column({ name: 'hora_completada', type: 'time', nullable: true })
  hora_completada: string;

  @Column({ name: 'puntos_ganados', type: 'integer', nullable: false })
  puntos_ganados: number;

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  @ManyToOne(() => Paciente, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'paciente' })
  pacienteRelacion: Paciente;

  @ManyToOne(() => Tarea, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'tarea' })
  tareaRelacion: Tarea;
} 