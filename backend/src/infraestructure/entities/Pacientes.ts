import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Usuario } from "./Usuarios";
import { EPS } from "./Eps";

@Entity({ name: "Pacientes" })
export class Paciente {
    @PrimaryGeneratedColumn({ name: "id_paciente" })
    id_paciente!: number;

    @Column({ name: "puntos", type: 'int' })
    puntos!: number;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: "usuario" }) // El campo 'usuario' en Pacientes es la FK a usuarios.id_usuario
    usuario!: Usuario;

    @ManyToOne(() => EPS)
    @JoinColumn({ name: "id_eps" }) // El campo 'id_eps' en Pacientes es la FK a eps.id_eps
    eps!: EPS;
}
