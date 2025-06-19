import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Paciente } from "./Pacientes";
import { Medico } from "./Medico";

@Entity({ name: "Pacientes_Medicos" })
export class Pacientes_Medicos {
    @PrimaryGeneratedColumn({ name: "id" })
    id!: number;

    @ManyToOne(() => Paciente)
    @JoinColumn({ name: "paciente" }) // El campo 'Paciente' es la FK a pacientes.id_paciente
    paciente!: Paciente;

    @ManyToOne(() => Medico)
    @JoinColumn({ name: "medico" }) // El campo 'Medico' es la FK a medicos.id_medico
    medico!: Medico;

    @Column({ name: "fecha_asignacion", type: "date" })
    fecha_asignacion!: Date;
}
