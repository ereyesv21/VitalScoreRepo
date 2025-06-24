import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Usuario } from "./Usuarios";
import { EPS } from "./Eps";
import { DisponibilidadTemporal } from "./DisponibilidadTemporal";

@Entity({ name: "Medicos" })
export class Medico {
    @PrimaryGeneratedColumn({ name: "id_medico" })
    id_medico!: number;

    @Column({ name: "especialidad", type: 'varchar', length: 255 })
    especialidad!: string;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: "usuario" }) // El campo 'usuario' en Medicos es la FK a usuarios.id_usuario
    usuario!: Usuario;

    @ManyToOne(() => EPS)
    @JoinColumn({ name: "eps" }) // El campo 'eps' en Medicos es la FK a eps.id_eps
    eps!: EPS;

    @OneToMany(() => DisponibilidadTemporal, disponibilidad => disponibilidad.medicoRelacion)
    disponibilidadesTemporales: DisponibilidadTemporal[];
}
