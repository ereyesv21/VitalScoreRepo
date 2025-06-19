import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { EPS } from "./Eps";

@Entity({ name: "Recompensas" })
export class Recompensa {
    @PrimaryGeneratedColumn({ name: "id_recompensa" })
    id_recompensa!: number;

    @ManyToOne(() => EPS)
    @JoinColumn({ name: "proveedor" }) // El campo 'proveedor' en Recompensas es la FK a eps.id_eps
    proveedor!: EPS;

    @Column({ name: "nombre", type: 'varchar', length: 255 })
    nombre!: string;

    @Column({ name: "descripcion", type: 'varchar', length: 500 })
    descripcion!: string;

    @Column({ name: "puntos_necesarios", type: 'int' })
    puntos_necesarios!: number;

    @Column({ name: "fecha_creacion", type: 'timestamp' })
    fecha_creacion!: Date;

    @Column({ name: "estado", type: 'varchar', length: 50 })
    estado!: string;
}
