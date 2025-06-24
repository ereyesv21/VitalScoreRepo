import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('Medicamentos', { schema: 'vitalscore' })
export class Medicamentos {
  @PrimaryGeneratedColumn({ name: 'id_medicamento' })
  id_medicamento: number;

  @Column({ 
    name: 'nombre', 
    type: 'varchar', 
    length: 255, 
    nullable: false 
  })
  nombre: string;

  @Column({ 
    name: 'descripcion', 
    type: 'text', 
    nullable: true 
  })
  descripcion: string;

  @Column({ 
    name: 'dosis_recomendada', 
    type: 'varchar', 
    length: 100, 
    nullable: true 
  })
  dosis_recomendada: string;

  @Column({ 
    name: 'frecuencia', 
    type: 'varchar', 
    length: 100, 
    nullable: true 
  })
  frecuencia: string;

  @Column({ 
    name: 'duracion_tratamiento', 
    type: 'varchar', 
    length: 100, 
    nullable: true 
  })
  duracion_tratamiento: string;

  @Column({ 
    name: 'efectos_secundarios', 
    type: 'text', 
    nullable: true 
  })
  efectos_secundarios: string;

  @Column({ 
    name: 'contraindicaciones', 
    type: 'text', 
    nullable: true 
  })
  contraindicaciones: string;

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
} 