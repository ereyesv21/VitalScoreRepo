import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Paciente } from "./Pacientes";
import { Recompensa } from "./Recompensas";

@Entity({ name: "Canjes" })
export class Canje {
    @PrimaryGeneratedColumn({ name: "id_canje" })
    id_canje!: number;

    @ManyToOne(() => Paciente)
    @JoinColumn({ name: "paciente" }) // El campo 'paciente' en Canjes es la FK a pacientes.id_paciente
    paciente!: Paciente;

    @ManyToOne(() => Recompensa)
    @JoinColumn({ name: "recompensa" }) // El campo 'recompensa' en Canjes es la FK a recompensas.id_recompensa
    recompensa!: Recompensa;

    @Column({ name: "puntos_utilizados", type: "int" })
    puntos_utilizados!: number;

    @Column({ name: "fecha_canje", type: "timestamp" })
    fecha_canje!: Date;

    @Column({ name: "estado", type: "varchar", length: 50 })
    estado!: string;
}
