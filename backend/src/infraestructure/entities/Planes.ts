import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Paciente } from "./Pacientes";
import { Medico } from "./Medico";

@Entity({ name: "Planes" })
export class Plan {
    @PrimaryGeneratedColumn({ name: "id_plan" })
    id_plan!: number;

    @Column({ name: "descripcion", type: 'varchar', length: 500 })
    descripcion!: string;

    @Column({ name: "fecha_inicio", type: 'date' })
    fecha_inicio!: Date;

    @Column({ name: "fecha_fin", type: 'date' })
    fecha_fin!: Date;

    @Column({ name: "estado", type: 'varchar', length: 50 })
    estado!: string;

    @ManyToOne(() => Paciente)
    @JoinColumn({ name: "paciente" }) // El campo 'paciente' en Planes es la FK a pacientes.id_paciente
    paciente!: Paciente;

    @ManyToOne(() => Medico)
    @JoinColumn({ name: "medico" }) // El campo 'medico' en Planes es la FK a medicos.id_medico
    medico!: Medico;
}
