import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Paciente } from "./Pacientes";

@Entity({ name: "Archivos" })
export class Archivo {
    @PrimaryGeneratedColumn({ name: "id_archivo" })
    id_archivo!: number;

    @ManyToOne(() => Paciente)
    @JoinColumn({ name: "paciente" }) // El campo 'paciente' en Archivos es la FK a pacientes.id_paciente
    paciente!: Paciente;

    @Column({ name: "tipo", type: "varchar", length: 100 })
    tipo!: string;

    @Column({ name: "url_archivo", type: "varchar", length: 500 })
    url_archivo!: string;

    @Column({ name: "fecha_subida", type: "timestamp" })
    fecha_subida!: Date;
}
