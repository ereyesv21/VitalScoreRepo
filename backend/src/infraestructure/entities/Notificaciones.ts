import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Paciente } from "./Pacientes";

@Entity({ name: "Notificaciones", schema: "vitalscore" })
export class Notificacion {
    @PrimaryGeneratedColumn({ name: "id_notificacion" })
    id_notificacion!: number;

    @ManyToOne(() => Paciente)
    @JoinColumn({ name: "paciente" })
    paciente!: Paciente;

    @Column({ name: "mensaje", type: 'text' })
    mensaje!: string;

    @Column({ name: "fecha_envio", type: 'timestamp' })
    fecha_envio!: Date;
} 