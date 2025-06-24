import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Usuario } from './Usuarios';

@Entity('Horarios_Medicos_Detallados', { schema: 'vitalscore' })
export class HorariosMedicosDetallados {
  @PrimaryGeneratedColumn({ name: 'id_horario' })
  id_horario: number;

  @Column({ name: 'medico', type: 'integer', nullable: false })
  medico: number;

  @Column({ name: 'fecha', type: 'date', nullable: false })
  fecha: Date;

  @Column({ name: 'hora_inicio', type: 'time', nullable: false })
  hora_inicio: string;

  @Column({ name: 'hora_fin', type: 'time', nullable: false })
  hora_fin: string;

  @Column({ 
    name: 'tipo', 
    type: 'varchar', 
    length: 20, 
    nullable: false, 
    default: 'turno' 
  })
  tipo: string;

  @Column({ 
    name: 'estado', 
    type: 'varchar', 
    length: 20, 
    nullable: false, 
    default: 'activo' 
  })
  estado: string;

  @Column({ name: 'creado_por', type: 'integer', nullable: true })
  creado_por: number;

  @CreateDateColumn({ 
    name: 'fecha_creacion', 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP' 
  })
  fecha_creacion: Date;

  @ManyToOne(() => Usuario, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'medico' })
  medicoRelacion: Usuario;

  @ManyToOne(() => Usuario, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'creado_por' })
  creadoPorRelacion: Usuario;
} 