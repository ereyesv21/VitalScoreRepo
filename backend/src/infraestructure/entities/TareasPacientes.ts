import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Paciente } from './Pacientes';
import { Tarea } from './Tareas';

@Entity({ name: 'Tareas_Pacientes', schema: 'vitalscore' })
export class TareasPacientes {
  @PrimaryGeneratedColumn({ name: 'id_tarea_paciente' })
  id_tarea_paciente: number;

  @ManyToOne(() => Paciente)
  @JoinColumn({ name: 'paciente_id' })
  paciente: Paciente;

  @ManyToOne(() => Tarea)
  @JoinColumn({ name: 'tarea_id' })
  tarea: Tarea;

  @Column({ name: 'nombre_tarea', type: 'varchar', length: 255, nullable: true })
  nombre_tarea: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'diagnostico', type: 'text', nullable: true })
  diagnostico: string;

  @Column({ name: 'recomendacion', type: 'text', nullable: true })
  recomendacion: string;

  @Column({ name: 'estado', type: 'varchar', length: 50, default: 'pendiente' })
  estado: string;

  @CreateDateColumn({ name: 'fecha_asignacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_asignacion: Date;

  @Column({ name: 'fecha_completada', type: 'timestamp', nullable: true })
  fecha_completada: Date;
} 