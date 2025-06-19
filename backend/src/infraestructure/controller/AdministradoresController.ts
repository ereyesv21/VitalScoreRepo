import { Request, Response } from "express";
import { Administradores } from "../../domain/Administradores";
import { AdministradoresApplicationService } from "../../application/AdministradoresApplicationService";

export class AdministradoresController {
    private app: AdministradoresApplicationService;

    constructor(app: AdministradoresApplicationService) {
        this.app = app;
    }

    async createAdministrador(req: Request, res: Response): Promise<Response> {
        try {
            const { usuario } = req.body;
            if (!usuario || isNaN(Number(usuario))) {
                return res.status(400).json({ error: "El campo usuario es obligatorio y debe ser un número válido" });
            }
            const administrador: Omit<Administradores, "id_administrador"> = { usuario: Number(usuario) };
            const id = await this.app.createAdministrador(administrador);
            return res.status(201).json({ message: "Administrador creado con éxito", id_administrador: id });
        } catch (error) {
            return res.status(500).json({ error: "Error al crear administrador", details: (error as Error).message });
        }
    }

    async updateAdministrador(req: Request, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id);
            const { usuario } = req.body;
            if (isNaN(id)) return res.status(400).json({ error: "El id debe ser un número válido" });
            const updated = await this.app.updateAdministrador(id, { usuario });
            if (!updated) return res.status(404).json({ error: "Administrador no encontrado" });
            return res.status(200).json({ message: "Administrador actualizado con éxito" });
        } catch (error) {
            return res.status(500).json({ error: "Error al actualizar administrador", details: (error as Error).message });
        }
    }

    async deleteAdministrador(req: Request, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: "El id debe ser un número válido" });
            const deleted = await this.app.deleteAdministrador(id);
            if (!deleted) return res.status(404).json({ error: "Administrador no encontrado" });
            return res.status(200).json({ message: "Administrador eliminado con éxito" });
        } catch (error) {
            return res.status(500).json({ error: "Error al eliminar administrador", details: (error as Error).message });
        }
    }

    async getAdministradorById(req: Request, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: "El id debe ser un número válido" });
            const administrador = await this.app.getAdministradorById(id);
            if (!administrador) return res.status(404).json({ error: "Administrador no encontrado" });
            return res.status(200).json(administrador);
        } catch (error) {
            return res.status(500).json({ error: "Error al obtener administrador", details: (error as Error).message });
        }
    }

    async getAllAdministradores(req: Request, res: Response): Promise<Response> {
        try {
            const administradores = await this.app.getAllAdministradores();
            return res.status(200).json(administradores);
        } catch (error) {
            return res.status(500).json({ error: "Error al obtener administradores", details: (error as Error).message });
        }
    }

    async getAdministradorByUsuario(req: Request, res: Response): Promise<Response> {
        try {
            const usuario = parseInt(req.params.usuario);
            if (isNaN(usuario)) return res.status(400).json({ error: "El usuario debe ser un número válido" });
            const administrador = await this.app.getAdministradorByUsuario(usuario);
            if (!administrador) return res.status(404).json({ error: "Administrador no encontrado para este usuario" });
            return res.status(200).json(administrador);
        } catch (error) {
            return res.status(500).json({ error: "Error al obtener administrador por usuario", details: (error as Error).message });
        }
    }
}
