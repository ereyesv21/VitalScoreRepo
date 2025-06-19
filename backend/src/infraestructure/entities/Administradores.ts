import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Usuario } from "./Usuarios";

@Entity({ name: "Administradores" })
export class Administrador {
    @PrimaryGeneratedColumn({ name: "id_administrador" })
    id_administrador!: number;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: "usuario" }) // El campo 'usuario' en Administradores es la FK a usuarios.id_usuario
    usuario!: Usuario;
}
