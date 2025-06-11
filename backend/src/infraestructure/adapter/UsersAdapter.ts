import { UserPort } from "../../domain/UsersPort";
import {User as UserEntity} from "../entities/Users"; //importamos la entidad user
import {Users as UserDomain} from "../../domain/Users"; //importamos el user del dominio
import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-base";

export class UserAdapter implements UserPort{

    private userRepository: Repository<UserEntity>;

    constructor(){
        this.userRepository = AppDataSource.getRepository(UserEntity); //obtenemos el repositorio de la entidad user
    }

    //Transforma la entidad de infraestructura(entidad User.ts) al modelo de dominio (interface User.ts)
    private toDomain(userEntity: UserEntity): UserDomain {
        return {
            id: userEntity.id_user,
            name: userEntity.name_user,
            lastName: userEntity.lastName_user,
            email: userEntity.email_user,
            password: userEntity.password_user,
            status: userEntity.status_user,
            rol: userEntity.rol_user,
            gender: userEntity.gender_user
        };
    }
 
  //Transforma el modelo de dominio a la entidad de infraestructura
    private toEntity(userDomain: Omit<UserDomain, "id">): Omit<UserEntity, "id_user"> {
        const userEntity = new UserEntity();
        userEntity.name_user = userDomain.name;
        userEntity.lastName_user = userDomain.lastName;
        userEntity.email_user = userDomain.email;
        userEntity.password_user = userDomain.password;
        userEntity.status_user = userDomain.status;
        userEntity.rol_user = userDomain.rol;
        userEntity.gender_user = userDomain.gender;
        return userEntity;
    }

    async createUser(user: Omit<UserDomain, "id">): Promise<number> {
        try {
            const userEntity = this.toEntity(user);
            const newUser = await this.userRepository.save(userEntity);
            return newUser.id_user; //retorna el id del usuario creado
        } catch (error) {
            console.error("Error creating user:", error);
            throw new Error("Failed to create user");
            
        }
    }
    
    async updateUser(id: number, user: Partial<UserDomain>): Promise<boolean> {
        try {
            const existingUser = await this.userRepository.findOne({ where:{ id_user: id }});
            if (!existingUser) return false;

            //actualizar solo los campos enviados
            if (user.name) existingUser.name_user = user.name;
            if (user.email) existingUser.email_user = user.email;
            if (user.password) existingUser.password_user = user.password;
            if (user.status !== undefined) existingUser.status_user = user.status;

            await this.userRepository.save(existingUser);
            return true;
        } catch (error) {
            console.error("Error updating user:", error);
            throw new Error("Failed to update user");
            
        }
    }


    async deleteUser(id: number): Promise<boolean> {
        try {
            const existingUser = await this.userRepository.findOne({ where: { id_user: id } });
            if (!existingUser) return false;
            //actualizar el estado del usuario a inactivo
            existingUser.status_user = "inactive";
            await this.userRepository.save(existingUser);
            return true;
        } catch (error) {
            console.error("Error deleting user:", error);
            throw new Error("Failed to delete user");
        }
    }


    async getUserById(id: number): Promise<UserDomain | null> {
        try {
            const user = await this.userRepository.findOne({ where: { id_user: id } });
            return user ? this.toDomain(user) : null;
        } catch (error) {
            console.error("Error fetching user by ID:", error);
            throw new Error("Failed to fecth user by ID");
        }
    }

    async getAllUsers(): Promise<UserDomain[]> {
        try {
            const users = await this.userRepository.find();
            return users.map(user => this.toDomain(user));
        } catch (error) {
            console.error("Error fetching all users:", error);
            throw new Error("Failed to fetch all users");
        }
    }

    async getUserByEmail(email: string): Promise<UserDomain | null> {
        try {
            const user = await this.userRepository.findOne({ where: { email_user: email } });
            return user ? this.toDomain(user) : null;
        } catch (error) {
            console.error("Error fetching user by email:", error);
            throw new Error("Failed to fetch user by email");
        }
    } //implememtacion del userport

}