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
        
        // Obtener información del usuario para devolver el rol
        const usuario = await this.app.getUsuarioByCorreo(correo);
        
        if (!usuario) {
          return res.status(401).json({ error: "Usuario no encontrado" });
        }

        // Determinar el rol basado en el ID del rol
        function getRoleName(rol: number): string {
          switch (rol) {
            case 1: return 'paciente';
            case 2: return 'medico';
            case 3: return 'administrador';
            default: return 'paciente';
          }
        }
        const rol = getRoleName(usuario.rol);

        return res.status(200).json({ 
          message: "Login exitoso", 
          token,
          user: {
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            correo: usuario.correo,
            genero: usuario.genero,
            rol: usuario.rol
          }
        });

      } catch (error) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
      }
    }

    async createUsuario(req: Request, res: Response): Promise<Response> {
        try {
            const { nombre, apellido, correo, contraseña, password, estado = "activo", rol = 1, genero } = req.body;

            // Usar password si está disponible, sino usar contraseña
            const passwordToUse = password || contraseña;

            // Validaciones con expresiones regulares
            if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)?$/.test(nombre.trim()))
                return res.status(400).json({
                    error: "El nombre debe tener al menos 3 caracteres y solo contener letras",
                });

            if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(correo.trim()))
                return res.status(400).json({ error: "Correo electrónico no válido" });

            if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(passwordToUse.trim()))
                return res.status(400).json({
                    error: "La contraseña debe tener al menos 6 caracteres, incluyendo al menos una letra y un número",
                });

            // Crear usuario
            const usuario: Omit<Usuarios, "id_usuario"> = { 
                nombre, 
                apellido, 
                correo, 
                contraseña: passwordToUse, 
                estado, 
                rol,
                genero 
            };
            const usuarioId = await this.app.createUsuario(usuario);

            return res.status(201).json({ message: "Usuario creado con éxito", usuarioId });
        } catch (error) {
            if (error instanceof Error) {
                // Si el error es sobre correo duplicado, enviar mensaje genérico
                if (error.message.includes("Error en el registro")) {
                    return res.status(400).json({
                        error: "Error en el registro. Verifica los datos ingresados."
                    });
                }
                return res.status(500).json({
                    error: "Error interno del servidor",
                    details: error.message,
                });
            }
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async completeRegistration(req: Request, res: Response): Promise<Response> {
        try {
            console.log("Datos recibidos en registro:", req.body);
            const { 
                nombre, 
                apellido, 
                correo, 
                contraseña, 
                password,
                estado = "activo", 
                rol = 1, 
                genero,
                especialidad, // For doctors
                id_eps = 1 // Default EPS
            } = req.body;

            // Usar password si está disponible, sino usar contraseña
            const passwordToUse = password || contraseña;

            // Validaciones con expresiones regulares
            if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)?$/.test(nombre.trim()))
                return res.status(400).json({
                    error: "El nombre debe tener al menos 3 caracteres y solo contener letras",
                });

            if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(correo.trim()))
                return res.status(400).json({ error: "Correo electrónico no válido" });

            if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(passwordToUse.trim()))
                return res.status(400).json({
                    error: "La contraseña debe tener al menos 6 caracteres, incluyendo al menos una letra y un número",
                });

            // Crear usuario
            const usuario: Omit<Usuarios, "id_usuario"> = { 
                nombre, 
                apellido, 
                correo, 
                contraseña: passwordToUse, 
                estado, 
                rol,
                genero 
            };
            const usuarioId = await this.app.createUsuario(usuario);

            // Crear perfil específico según el rol
            if (rol === 1) { // Paciente
                await this.app.createPacienteProfile(usuarioId, { puntos: 0, id_eps });
            } else if (rol === 2) { // Médico
                console.log("Entrando a creación de médico:", { usuarioId, especialidad, id_eps });
                if (!especialidad) {
                    return res.status(400).json({ error: "La especialidad es requerida para médicos" });
                }
                await this.app.createMedicoProfile(usuarioId, { especialidad, eps: id_eps });
            } else if (rol === 3) { // Administrador
                await this.app.createAdministradorProfile(usuarioId);
            }

            // Generar token de autenticación
            const token = await this.app.login(correo, passwordToUse);

            return res.status(201).json({ 
                message: "Registro completo exitoso", 
                usuarioId,
                token,
                rol: rol === 1 ? 'paciente' : rol === 2 ? 'medico' : 'administrador'
            });
        } catch (error) {
            console.log("🔍 Error completo en completeRegistration:", error);
            if (error instanceof Error) {
                console.log("🔍 Error message:", error.message);
                // Si el error es sobre correo duplicado, enviar mensaje genérico
                if (error.message.includes("Error en el registro")) {
                    console.log("🔍 Enviando error 400 para correo duplicado");
                    return res.status(400).json({
                        error: "Error en el registro. Verifica los datos ingresados."
                    });
                }
                console.log("🔍 Enviando error 500 genérico");
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
            let { nombre, apellido, correo, contraseña, estado, genero } = req.body;

            // Validaciones con expresiones regulares
            if (nombre && !/^[a-zA-Z\s}]{3,}/.test(nombre.trim()))
                return res
                    .status(400)
                    .json({
                        error:
                            "El nombre debe tener al menos 3 caracteres y solo contener letras",
                    });

            if (apellido && !/^[a-zA-Z\s}]{3,}/.test(apellido.trim()))
                return res
                    .status(400)
                    .json({
                        error:
                            "El apellido debe tener al menos 3 caracteres y solo contener letras",
                    });

            if (correo && !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(correo.trim()))
                return res.status(400).json({ error: "Correo electrónico no válido" });

            if (contraseña && !/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(contraseña.trim()))
                return res
                    .status(400)
                    .json({
                        error:
                            "La contraseña debe tener al menos 6 caracteres, incluyendo al menos una letra y un número",
                    });

            // Actualizar usuario
            const updated = await this.app.updateUsuario(id, {
                nombre,
                apellido,
                correo,
                contraseña,
                estado,
                genero
            });

            if (!updated) return res.status(404).json({ error: "Usuario no encontrado" });

            // Obtener los datos actualizados del usuario
            const updatedUser = await this.app.getUsuarioById(id);
            if (!updatedUser) return res.status(404).json({ error: "Usuario no encontrado después de la actualización" });

            return res.status(200).json({ 
                message: "Usuario actualizado con éxito", 
                usuario: updatedUser 
            });
        } catch (error) {
            if (error instanceof Error) {
                // Si el error es sobre correo duplicado, enviar mensaje genérico
                if (error.message.includes("Error en la actualización")) {
                    return res.status(400).json({
                        error: "Error en la actualización. Verifica los datos ingresados."
                    });
                }
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