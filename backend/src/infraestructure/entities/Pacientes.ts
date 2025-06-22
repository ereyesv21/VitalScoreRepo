import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './Usuarios';
import { EPS } from './Eps';

@Entity('Pacientes', { schema: 'vitalscore' })
export class Paciente {
    @PrimaryGeneratedColumn()
    id_paciente: number;

    @Column('int')
    puntos: number;

    @ManyToOne(() => EPS)
    @JoinColumn({ name: 'id_eps' })
    eps: EPS;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'usuario' })
    usuario: Usuario;

    @Column({ type: 'int', name: 'racha_dias', default: 0 })
    racha_dias: number;

    @Column({ type: 'date', name: 'ultima_fecha_racha', nullable: true })
    ultima_fecha_racha: Date;
}
