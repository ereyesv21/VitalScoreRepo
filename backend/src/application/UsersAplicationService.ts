import { UserPort } from "../domain/UsersPort";
import { Users } from "../domain/Users";

export class UserApplicationService {
    private readonly userPort: UserPort;

    constructor(userPort: UserPort) {
        this.userPort = userPort;
    }

    async createUser(userData: Omit<Users, "id">): Promise<number> {
        return await this.userPort.createUser(userData);
    }

    async getAllUsers(): Promise<Users[]> {
        return await this.userPort.getAllUsers();
    }

    async getUserById(id: number): Promise<Users | null> {
        return await this.userPort.getUserById(id);
    }

    async getUserByEmail(email: string): Promise<Users | null> {
        return await this.userPort.getUserByEmail(email);
    }

    async updateUser(id: number, userData: Partial<Users>): Promise<boolean> {
        return await this.userPort.updateUser(id, userData);
    }

    async deleteUser(id: number): Promise<boolean> {
        return await this.userPort.deleteUser(id);
    }
}