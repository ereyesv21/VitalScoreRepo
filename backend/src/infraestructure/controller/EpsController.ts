import { EpsApplicationService } from "../../application/EpsApplicationService";
import { Request, Response } from "express";
import { EPS } from "../../domain/Eps";

export class EpsController {
    private app: EpsApplicationService;

    constructor(app: EpsApplicationService) {
        this.app = app;
    }

    async createEps(req: Request, res: Response): Promise<Response> {
        try {
            const { nombre, tipo, fecha_registro, estado = "activo" } = req.body;

            // Validaciones básicas
            if (!nombre || typeof nombre !== "string" || nombre.trim().length < 3)
                return res.status(400).json({ error: "El nombre debe tener al menos 3 caracteres" });

            if (!tipo || typeof tipo !== "string" || tipo.trim().length < 3)
                return res.status(400).json({ error: "El tipo debe tener al menos 3 caracteres" });

            if (!fecha_registro || isNaN(Date.parse(fecha_registro)))
                return res.status(400).json({ error: "La fecha de registro no es válida" });

            const eps: Omit<EPS, "id_eps"> = {
                nombre,
                tipo,
                fecha_registro: new Date(fecha_registro),
                estado
            };
            const epsId = await this.app.createEps(eps);

            return res.status(201).json({ message: "EPS creada con éxito", epsId });
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

    async getEpsById(req: Request, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: "El id debe ser un número o id invalido" });
            const eps = await this.app.getEpsById(id);
            if (!eps) return res.status(404).json({ error: "EPS no encontrada" });
            return res.status(200).json(eps);
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

    async getEpsByNombre(req: Request, res: Response): Promise<Response> {
        try {
            const { nombre } = req.params;
            if (!nombre || typeof nombre !== "string" || nombre.trim().length < 3)
                return res.status(400).json({ error: "El nombre debe tener al menos 3 caracteres" });

            const eps = await this.app.getEpsByNombre(nombre);
            if (!eps) return res.status(404).json({ error: "EPS no encontrada" });
            return res.status(200).json(eps);
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

    async getAllEps(req: Request, res: Response): Promise<Response> {
        try {
            const epsList = await this.app.getAllEps();
            return res.status(200).json(epsList);
        } catch (error) {
            return res.status(500).json({ error: "Error al obtener las EPS" });
        }
    }

    async deleteEps(req: Request, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: "El id debe ser un número o id invalido" });
            const deleted = await this.app.deleteEps(id);
            if (!deleted) return res.status(404).json({ error: "EPS no encontrada" });
            return res.status(200).json({ message: "EPS eliminada con éxito" });
        } catch (error) {
            return res.status(500).json({ error: "Error al eliminar la EPS" });
        }
    }

    async updateEps(req: Request, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: "El id debe ser un número o id invalido" });
            const { nombre, tipo, fecha_registro, estado } = req.body;

            // Validaciones básicas
            if (nombre && (typeof nombre !== "string" || nombre.trim().length < 3))
                return res.status(400).json({ error: "El nombre debe tener al menos 3 caracteres" });

            if (tipo && (typeof tipo !== "string" || tipo.trim().length < 3))
                return res.status(400).json({ error: "El tipo debe tener al menos 3 caracteres" });

            let fechaRegistroDate: Date | undefined = undefined;
            if (fecha_registro) {
                if (isNaN(Date.parse(fecha_registro)))
                    return res.status(400).json({ error: "La fecha de registro no es válida" });
                fechaRegistroDate = new Date(fecha_registro);
            }

            // Actualizar EPS
            const updated = await this.app.updateEps(id, {
                nombre,
                tipo,
                fecha_registro: fechaRegistroDate,
                estado
            });

            if (!updated) return res.status(404).json({ error: "EPS no encontrada" });

            return res.status(200).json({ message: "EPS actualizada con éxito", eps: updated });
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
}
