import { UsuariosApplicationService } from "../../application/UsuariosApplicationService"
import { Request, Response } from "express";
import { Usuarios } from "../../domain/Usuarios";

export class UsuariosController {
    private app: UsuariosApplicationService;

    constructor(app: UsuariosApplicationService) {
        this.app = app;
    }

    async login(req:Request, res:Response):Promise<String | Response>{
      try {
        const {correo,contraseña} = req.body;

        if (!correo || !contraseña) {
          return res.status(400).json({ error: "Error en el email y contraseña" });
        }
        
        const token = await this.app.login(correo, contraseña);
        return res.status(200).json({ message: "Login exitoso", token });

      } catch (error) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
      }
    }

    async createUsuario(req: Request, res: Response): Promise<Response> {
        try {
            const { nombre, apellido, correo, contraseña, estado = "activo", rol = 1, genero } = req.body;

            // Validaciones con expresiones regulares
            if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)?$/.test(nombre.trim()))
                return res.status(400).json({
                    error: "El nombre debe tener al menos 3 caracteres y solo contener letras",
                });

            if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(correo.trim()))
                return res.status(400).json({ error: "Correo electrónico no válido" });

            if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(contraseña.trim()))
                return res.status(400).json({
                    error: "La contraseña debe tener al menos 6 caracteres, incluyendo al menos una letra y un número",
                });

            // Crear usuario
            const usuario: Omit<Usuarios, "id_usuario"> = { 
                nombre, 
                apellido, 
                correo, 
                contraseña, 
                estado, 
                rol,
                genero 
            };
            const usuarioId = await this.app.createUsuario(usuario);

            return res.status(201).json({ message: "Usuario creado con éxito", usuarioId });
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

    async getUsuarioById(req: Request, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: "El id debe ser un número o id invalido" });
            const usuario = await this.app.getUsuarioById(id);
            if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
            return res.status(200).json(usuario);
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

    async getUsuarioByCorreo(req: Request, res: Response): Promise<Response> {
        try {
            const { correo } = req.params;
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
                return res.status(400).json({ error: "Correo electrónico no válido" });
            // Validacion de email exitosa procedemos a buscar el usuario
            const usuario = await this.app.getUsuarioByCorreo(correo);
            if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
            return res.status(200).json(usuario);
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

    async getAllUsuarios(req: Request, res: Response): Promise<Response> {
        try {
            const usuarios = await this.app.getAllUsuarios();
            return res.status(200).json(usuarios);
        } catch (error) {
            return res.status(500).json({ error: "Error al obtener los usuarios" });
        }
    }

    async deleteUsuario(req: Request, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: "El id debe ser un número o id invalido" });
            const deleted = await this.app.deleteUsuario(id);
            if (!deleted) return res.status(404).json({ error: "Usuario no encontrado" });
            return res.status(200).json({ message: "Usuario eliminado con éxito" });
        } catch (error) {
            return res.status(500).json({ error: "Error al eliminar el usuario" });
        }
    }

    async updateUsuario(req: Request, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: "El id debe ser un número o id invalido" });
            let { nombre, correo, contraseña, estado } = req.body;

            // Validaciones con expresiones regulares
            if (nombre && !/^[a-zA-Z\s}]{3,}/.test(nombre.trim()))
                return res
                    .status(400)
                    .json({
                        error:
                            "El nombre debe tener al menos 3 caracteres y solo contener letras",
                    });

            if (correo && !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(correo.trim()))
                return res.status(400).json({ error: "Correo electrónico no válido" });

            if (contraseña && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(contraseña.trim()))
                return res
                    .status(400)
                    .json({
                        error:
                            "La contraseña debe tener al menos 6 caracteres, incluyendo al menos una letra y un número",
                    });

            estado = "activo";

            // Actualizar usuario
            const updated = await this.app.updateUsuario(id, {
                nombre,
                correo,
                contraseña,
                estado
            });

            if (!updated) return res.status(404).json({ error: "Usuario no encontrado" });

            return res.status(200).json({ message: "Usuario actualizado con éxito", usuario: updated });
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