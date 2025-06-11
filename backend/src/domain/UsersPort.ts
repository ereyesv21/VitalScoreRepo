import { Users } from "./Users";


export interface UserPort {
    createUser(user:Omit<Users, 'id'>): Promise<number>;
    updateUser(id: number, user: Partial<Users>): Promise<boolean>;
    deleteUser(id: number): Promise<boolean>;
    getUserById(id: number): Promise<Users | null>; //union de tipo de datos por |
    getAllUsers(): Promise<Users[]>;
    getUserByEmail(email: string): Promise<Users | null>;
}