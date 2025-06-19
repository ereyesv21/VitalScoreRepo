import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Paciente } from "./Pacientes";

@Entity({ name: "Historial_Puntos" })
export class HistorialPunto {
    @PrimaryGeneratedColumn({ name: "id_historial" })
    id_historial!: number;

    @ManyToOne(() => Paciente)
    @JoinColumn({ name: "paciente" }) // El campo 'paciente' en Historial_Puntos es la FK a pacientes.id_paciente
    paciente!: Paciente;

    @Column({ name: "puntos", type: 'int' })
    puntos!: number;

    @Column({ name: "fecha_registro", type: 'timestamp' })
    fecha_registro!: Date;

    @Column({ name: "descripcion", type: 'varchar', length: 500 })
    descripcion!: string;
}
