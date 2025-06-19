import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity({ name: "Roles" })
export class Rol {
    @PrimaryGeneratedColumn()
    id_rol: number;

    @Column()
    descripcion: string;

}