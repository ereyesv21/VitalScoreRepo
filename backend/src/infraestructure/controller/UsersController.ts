import { UserApplicationService } from "../../application/UsersAplicationService"
import { Request, Response } from "express";
import { Users } from "../../domain/Users";

export class UserController {
     private app: UserApplicationService;

    constructor(app: UserApplicationService) {
        this.app = app;
    }

    async createUser(req: Request, res: Response): Promise<Response> {
        try {
            const { name, lastName, email, password, status = "active", rol = 1, gender } = req.body;

            // Validaciones con expresiones regulares
            if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)?$/.test(name.trim()))
                return res.status(400).json({
                    error: "El nombre debe tener al menos 3 caracteres y solo contener letras",
                });

            if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email.trim()))
                return res.status(400).json({ error: "Correo electrónico no válido" });

            if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password.trim()))
                return res.status(400).json({
                    error: "La contraseña debe tener al menos 6 caracteres, incluyendo al menos una letra y un número",
                });

            // Crear usuario
            const user: Omit<Users, "id"> = { 
                name, 
                lastName, 
                email, 
                password, 
                status, 
                rol,
                gender 
            };
            const userId = await this.app.createUser(user);

            return res.status(201).json({ message: "Usuario creado con éxito", userId });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({
                    error: "Error interno del servidor",
                    details: error.message,
                });
            }
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getUserById(req: Request, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: "El id debe ser un número o id invalido" });
            const user = await this.app.getUserById(id);
            if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
            return res.status(200).json(user);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json({
                        error: "Error interno del servidor",
                        details: error.message,
                    });
            }
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getUserByEmail(req: Request, res: Response): Promise<Response> {
        try {
            const { email } = req.params;
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                return res.status(400).json({ error: "Correo electrónico no válido" });
            // Validacion de email exitosa procedemos a buscar el usuario
            const user = await this.app.getUserByEmail(email);
            if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
            return res.status(200).json(user);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json({
                        error: "Error interno del servidor",
                        details: error.message,
                    });
            }
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getAllUsers(req: Request, res: Response): Promise<Response> {
        try {
            const users = await this.app.getAllUsers();
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json({ error: "Error al obtener los usuarios" });
        }
    }

    async deleteUser(req: Request, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: "El id debe ser un número o id invalido" });
            const deleted = await this.app.deleteUser(id);
            if (!deleted) return res.status(404).json({ error: "Usuario no encontrado" });
            return res.status(200).json({ message: "Usuario eliminado con éxito" });
        } catch (error) {
            return res.status(500).json({ error: "Error al eliminar el usuario" });
        }
    }

    async updateUser(req: Request, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: "El id debe ser un número o id invalido" });
            let { name, email, password, status } = req.body;

            // Validaciones con expresiones regulares
            if (name && !/^[a-zA-Z\s}]{3,}/.test(name.trim()))
                return res
                    .status(400)
                    .json({
                        error:
                            "El nombre debe tener al menos 3 caracteres y solo contener letras",
                    });

            if (email && !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email.trim()))
                return res.status(400).json({ error: "Correo electrónico no válido" });

            if (password && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password.trim()))
                return res
                    .status(400)
                    .json({
                        error:
                            "La contraseña debe tener al menos 6 caracteres, incluyendo al menos una letra y un número",
                    });

            status = "active";

            // Actualizar usuario
            const updated = await this.app.updateUser(id, {
                name,
                email,
                password,
                status
            });

            if (!updated) return res.status(404).json({ error: "Usuario no encontrado" });

            return res.status(200).json({ message: "Usuario actualizado con éxito", user: updated });
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json({
                        error: "Error interno del servidor",
                        details: error.message,
                    });
            }
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }
}