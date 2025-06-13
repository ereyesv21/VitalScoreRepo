import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({ name: "Usuarios" })
export class Usuario {
    @PrimaryGeneratedColumn({ name: "id_usuario" })
    id_usuario!: number;
    @Column({ name: "nombre", type: 'varchar', length: 255 })
    nombre!: string;
    @Column({ name: "apellido", type: 'varchar', length: 255 })
    apellido!: string;
    @Column({ name: "correo", type: 'varchar', length: 100, unique: true })
    correo!: string;
    @Column({ name: "contraseña", type: 'varchar', length: 255 })
    contraseña!: string;
    @Column({ name: "estado", type: 'varchar', length: 255 })
    estado!: string;
    @Column({ name: "rol", type: 'int' })
    rol!: number;
    @Column({ name: "genero", type: 'varchar', length: 255 })
    genero!: string;
} 