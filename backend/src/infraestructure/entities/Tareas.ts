import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Plan } from "./Planes";

@Entity({ name: "Tareas" })
export class Tarea {
    @PrimaryGeneratedColumn({ name: "id_tarea" })
    id_tarea!: number;

    @ManyToOne(() => Plan)
    @JoinColumn({ name: "plan" }) // El campo 'plan' en Tareas es la FK a planes.id_plan
    plan!: Plan;

    @Column({ name: "nombre_tarea", type: "varchar", length: 255 })
    nombre_tarea!: string;

    @Column({ name: "descripcion", type: "varchar", length: 500 })
    descripcion!: string;

    @Column({ name: "fecha_inicio", type: "date" })
    fecha_inicio!: Date;

    @Column({ name: "fecha_fin", type: "date" })
    fecha_fin!: Date;

    @Column({ name: "estado", type: "varchar", length: 50 })
    estado!: string;
}
