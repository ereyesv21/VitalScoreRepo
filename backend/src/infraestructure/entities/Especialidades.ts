import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('Especialidades', { schema: 'vitalscore' })
@Index('IDX_ESPECIALIDADES_NOMBRE', ['nombre'], { unique: true })
export class Especialidades {
  @PrimaryGeneratedColumn({ name: 'id_especialidad' })
  id_especialidad: number;

  @Column({ 
    name: 'nombre', 
    type: 'varchar', 
    length: 100, 
    nullable: false,
    unique: true
  })
  nombre: string;

  @Column({ 
    name: 'descripcion', 
    type: 'text', 
    nullable: true 
  })
  descripcion: string;

  @Column({ 
    name: 'estado', 
    type: 'varchar', 
    length: 20, 
    nullable: false, 
    default: 'activa',
    enum: ['activa', 'inactiva']
  })
  estado: string;
} 