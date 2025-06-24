import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Usuario } from "./Usuarios";
import { EPS } from "./Eps";
import { DisponibilidadTemporal } from "./DisponibilidadTemporal";
import { Especialidades } from "./Especialidades";

@Entity({ name: "Medicos" })
export class Medico {
    @PrimaryGeneratedColumn({ name: "id_medico" })
    id_medico!: number;

    @ManyToOne(() => Especialidades)
    @JoinColumn({ name: "id_especialidad" }) // El campo 'id_especialidad' en Medicos es la FK a Especialidades.id_especialidad
    id_especialidad!: Especialidades;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: "usuario" }) // El campo 'usuario' en Medicos es la FK a usuarios.id_usuario
    usuario!: Usuario;

    @ManyToOne(() => EPS)
    @JoinColumn({ name: "eps" }) // El campo 'eps' en Medicos es la FK a eps.id_eps
    eps!: EPS;

    @OneToMany(() => DisponibilidadTemporal, disponibilidad => disponibilidad.medicoRelacion)
    disponibilidadesTemporales: DisponibilidadTemporal[];
}
