import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Medico } from './Medico';

@Entity('Disponibilidad_Temporal', { schema: 'vitalscore' })
@Index('idx_disponibilidad_fechas', ['fecha_inicio', 'fecha_fin'])
@Index('idx_disponibilidad_medico', ['medico'])
export class DisponibilidadTemporal {
  @PrimaryGeneratedColumn({ name: 'id_disponibilidad' })
  id_disponibilidad: number;

  @Column({ name: 'medico', type: 'integer', nullable: false })
  medico: number;

  @Column({ name: 'fecha_inicio', type: 'date', nullable: false })
  fecha_inicio: Date;

  @Column({ name: 'fecha_fin', type: 'date', nullable: false })
  fecha_fin: Date;

  @Column({ 
    name: 'tipo', 
    type: 'varchar', 
    length: 50, 
    nullable: false,
    enum: ['vacaciones', 'ausencia', 'capacitacion', 'otro']
  })
  tipo: 'vacaciones' | 'ausencia' | 'capacitacion' | 'otro';

  @Column({ name: 'motivo', type: 'text', nullable: true })
  motivo: string;

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

  // Relación con Medico
  @ManyToOne(() => Medico, medico => medico.disponibilidadesTemporales, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION'
  })
  @JoinColumn({ name: 'medico' })
  medicoRelacion: Medico;
} 