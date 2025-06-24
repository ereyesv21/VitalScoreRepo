import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Paciente } from './Pacientes';
import { Medico } from './Medico';

@Entity('Configuracion_Notificaciones', { schema: 'vitalscore' })
export class ConfiguracionNotificacion {
    @PrimaryGeneratedColumn()
    id_configuracion: number;

    @ManyToOne(() => Paciente, { nullable: true })
    @JoinColumn({ name: 'paciente' })
    paciente: Paciente | null;

    @ManyToOne(() => Medico, { nullable: true })
    @JoinColumn({ name: 'medico' })
    medico: Medico | null;

    @Column({ type: 'varchar', length: 50, name: 'tipo_notificacion' })
    tipo_notificacion: string;

    @Column({ type: 'boolean', default: true })
    activo: boolean;

    @Column({ type: 'time', name: 'hora_inicio', default: '08:00:00' })
    hora_inicio: string;

    @Column({ type: 'time', name: 'hora_fin', default: '20:00:00' })
    hora_fin: string;

    @Column({ type: 'int', array: true, name: 'dias_semana', default: () => "'{1,2,3,4,5,6,7}'" })
    dias_semana: number[];

    @CreateDateColumn({ type: 'timestamp', name: 'fecha_creacion', default: () => 'CURRENT_TIMESTAMP' })
    fecha_creacion: Date;
} 