import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Medico } from './Medico';

@Entity('Horarios_Medicos', { schema: 'vitalscore' })
@Index('idx_horarios_dia_hora', ['dia_semana', 'hora_inicio', 'hora_fin'])
@Index('idx_horarios_medico', ['medico'])
export class HorariosMedicos {
  @PrimaryGeneratedColumn({ name: 'id_horario' })
  id_horario: number;

  @Column({ name: 'medico', type: 'integer', nullable: false })
  medico: number;

  @Column({ 
    name: 'dia_semana', 
    type: 'integer', 
    nullable: false
  })
  dia_semana: number;

  @Column({ name: 'hora_inicio', type: 'time', nullable: false })
  hora_inicio: string;

  @Column({ name: 'hora_fin', type: 'time', nullable: false })
  hora_fin: string;

  @Column({ 
    name: 'estado', 
    type: 'varchar', 
    length: 50, 
    nullable: false, 
    default: 'activo' 
  })
  estado: string;

  @CreateDateColumn({ 
    name: 'fecha_creacion', 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP' 
  })
  fecha_creacion: Date;

  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  fecha_inicio: Date;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fecha_fin: Date;

  @ManyToOne(() => Medico, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'medico' })
  medicoRelacion: Medico;
} 