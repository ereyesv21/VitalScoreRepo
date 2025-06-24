import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Paciente } from './Pacientes';
import { Medico } from './Medico';
import { CitaMedica } from './CitasMedicas';
import { Medicamentos } from './Medicamentos';

@Entity('Prescripciones', { schema: 'vitalscore' })
@Index('idx_prescripciones_cita', ['cita'])
@Index('idx_prescripciones_estado', ['estado'])
@Index('idx_prescripciones_medico', ['medico'])
@Index('idx_prescripciones_paciente', ['paciente'])
export class Prescripciones {
  @PrimaryGeneratedColumn({ name: 'id_prescripcion' })
  id_prescripcion: number;

  @Column({ 
    name: 'paciente', 
    type: 'integer', 
    nullable: false 
  })
  paciente: number;

  @Column({ 
    name: 'medico', 
    type: 'integer', 
    nullable: false 
  })
  medico: number;

  @Column({ 
    name: 'cita', 
    type: 'integer', 
    nullable: true 
  })
  cita: number | null;

  @Column({ 
    name: 'medicamento', 
    type: 'integer', 
    nullable: false 
  })
  medicamento: number;

  @Column({ 
    name: 'dosis', 
    type: 'varchar', 
    length: 100, 
    nullable: false 
  })
  dosis: string;

  @Column({ 
    name: 'frecuencia', 
    type: 'varchar', 
    length: 100, 
    nullable: false 
  })
  frecuencia: string;

  @Column({ 
    name: 'duracion', 
    type: 'varchar', 
    length: 100, 
    nullable: false 
  })
  duracion: string;

  @Column({ 
    name: 'instrucciones', 
    type: 'text', 
    nullable: true 
  })
  instrucciones: string | null;

  @Column({ 
    name: 'fecha_inicio', 
    type: 'date', 
    nullable: false 
  })
  fecha_inicio: Date;

  @Column({ 
    name: 'fecha_fin', 
    type: 'date', 
    nullable: true 
  })
  fecha_fin: Date | null;

  @Column({ 
    name: 'estado', 
    type: 'varchar', 
    length: 50, 
    nullable: false, 
    default: 'activa' 
  })
  estado: string;

  @CreateDateColumn({ 
    name: 'fecha_creacion', 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP' 
  })
  fecha_creacion: Date;

  // Relaciones
  @ManyToOne(() => Paciente, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paciente' })
  pacienteRelacion: Paciente;

  @ManyToOne(() => Medico, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'medico' })
  medicoRelacion: Medico;

  @ManyToOne(() => CitaMedica, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cita' })
  citaRelacion: CitaMedica;

  @ManyToOne(() => Medicamentos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'medicamento' })
  medicamentoRelacion: Medicamentos;
} 