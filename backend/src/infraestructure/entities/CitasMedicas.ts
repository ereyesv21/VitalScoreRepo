import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Paciente } from './Pacientes';
import { Medico } from './Medico';

@Entity('Citas_Medicas', { schema: 'vitalscore' })
export class CitaMedica {
    @PrimaryGeneratedColumn()
    id_cita: number;

    @ManyToOne(() => Paciente)
    @JoinColumn({ name: 'paciente' })
    paciente: Paciente;

    @ManyToOne(() => Medico)
    @JoinColumn({ name: 'medico' })
    medico: Medico;

    @Column({ type: 'date', name: 'fecha_cita' })
    fecha_cita: Date;

    @Column({ type: 'time', name: 'hora_inicio' })
    hora_inicio: string;

    @Column({ type: 'time', name: 'hora_fin' })
    hora_fin: string;

    @Column({ 
        type: 'varchar', 
        length: 50, 
        name: 'estado',
        default: 'programada'
    })
    estado: 'programada' | 'confirmada' | 'en_progreso' | 'completada' | 'cancelada' | 'no_asistio';

    @Column({ type: 'text', name: 'motivo_consulta', nullable: true })
    motivo_consulta?: string;

    @Column({ type: 'text', name: 'observaciones', nullable: true })
    observaciones?: string;

    @CreateDateColumn({ type: 'timestamp', name: 'fecha_creacion', default: () => 'CURRENT_TIMESTAMP' })
    fecha_creacion: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'fecha_modificacion', default: () => 'CURRENT_TIMESTAMP' })
    fecha_modificacion: Date;

    @Column({ type: 'varchar', length: 50, name: 'cancelado_por', nullable: true })
    cancelado_por?: string;

    @Column({ type: 'text', name: 'motivo_cancelacion', nullable: true })
    motivo_cancelacion?: string;
} 