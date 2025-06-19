import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "EPS" })
export class EPS {
    @PrimaryGeneratedColumn({ name: "id_eps" })
    id_eps!: number;

    @Column({ name: "nombre", type: 'varchar', length: 255 })
    nombre!: string;

    @Column({ name: "tipo", type: 'varchar', length: 10 })
    tipo!: string;

    @Column({ name: "fecha_registro", type: 'timestamp' })
    fecha_registro!: Date;

    @Column({ name: "estado", type: 'varchar', length: 255 })
    estado!: string;
}
