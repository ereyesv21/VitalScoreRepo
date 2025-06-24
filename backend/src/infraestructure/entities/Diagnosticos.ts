import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Paciente } from './Pacientes';
import { Medico } from './Medico';
import { CitaMedica } from './CitasMedicas';
// Enfermedad entidad debe existir, si no, dejar como import pendiente
// import { Enfermedad } from './Enfermedades';

@Entity('Diagnosticos', { schema: 'vitalscore' })
export class Diagnostico {
    @PrimaryGeneratedColumn()
    id_diagnostico: number;

    @ManyToOne(() => Paciente)
    @JoinColumn({ name: 'paciente' })
    paciente: Paciente;

    @ManyToOne(() => Medico)
    @JoinColumn({ name: 'medico' })
    medico: Medico;

    @ManyToOne(() => CitaMedica, { nullable: true })
    @JoinColumn({ name: 'cita' })
    cita: CitaMedica | null;

    // @ManyToOne(() => Enfermedad, { nullable: true })
    // @JoinColumn({ name: 'enfermedad' })
    // enfermedad: Enfermedad | null;
    @Column({ type: 'int', name: 'enfermedad', nullable: true })
    enfermedad: number | null;

    @Column({ type: 'text', name: 'diagnostico' })
    diagnostico: string;

    @Column({ type: 'text', name: 'observaciones', nullable: true })
    observaciones?: string;

    @Column({ type: 'date', name: 'fecha_diagnostico' })
    fecha_diagnostico: Date;

    @Column({ type: 'varchar', length: 50, name: 'estado', default: 'activo' })
    estado: 'activo' | 'inactivo' | 'resuelto' | 'pendiente';

    @CreateDateColumn({ type: 'timestamp', name: 'fecha_creacion', default: () => 'CURRENT_TIMESTAMP' })
    fecha_creacion: Date;
} 