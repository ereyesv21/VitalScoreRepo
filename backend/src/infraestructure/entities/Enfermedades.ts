import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('Enfermedades', { schema: 'vitalscore' })
export class Enfermedades {
  @PrimaryGeneratedColumn({ name: 'id_enfermedad' })
  id_enfermedad: number;

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
    name: 'categoria', 
    type: 'varchar', 
    length: 100, 
    nullable: true 
  })
  categoria: string;

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