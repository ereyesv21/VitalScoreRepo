import { Request, Response } from "express";
import { Archivos } from "../../domain/Archivos";
import { ArchivosApplicationService } from "../../application/ArchivosApplicationService";

export class ArchivosController {
    private app: ArchivosApplicationService;

    constructor(app: ArchivosApplicationService) {
        this.app = app;
    }

    async createArchivo(req: Request, res: Response): Promise<Response> {
        try {
            const { paciente, tipo, url_archivo, fecha_subida } = req.body;
            if (!paciente || isNaN(Number(paciente))) {
                return res.status(400).json({ error: "El campo paciente es obligatorio y debe ser un número válido" });
            }
            if (!tipo || typeof tipo !== 'string') {
                return res.status(400).json({ error: "El campo tipo es obligatorio y debe ser una cadena de texto" });
            }
            if (!url_archivo || typeof url_archivo !== 'string') {
                return res.status(400).json({ error: "El campo url_archivo es obligatorio y debe ser una cadena de texto" });
            }
            if (!fecha_subida || isNaN(new Date(fecha_subida).getTime())) {
                return res.status(400).json({ error: "El campo fecha_subida es obligatorio y debe ser una fecha válida" });
            }
            const archivo: Omit<Archivos, "id_archivo"> = {
                paciente: Number(paciente),
                tipo: tipo.trim(),
                url_archivo: url_archivo.trim(),
                fecha_subida: new Date(fecha_subida)
            };
            const id = await this.app.createArchivo(archivo);
            return res.status(201).json({ message: "Archivo creado con éxito", id_archivo: id });
        } catch (error) {
            return res.status(500).json({ error: "Error al crear archivo", details: (error as Error).message });
        }
    }

    async updateArchivo(req: Request, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id);
            const { paciente, tipo, url_archivo, fecha_subida } = req.body;
            if (isNaN(id)) return res.status(400).json({ error: "El id debe ser un número válido" });
            const updateData: Partial<Archivos> = {};
            if (paciente !== undefined) {
                if (isNaN(Number(paciente))) return res.status(400).json({ error: "El campo paciente debe ser un número válido" });
                updateData.paciente = Number(paciente);
            }
            if (tipo !== undefined) {
                if (typeof tipo !== 'string' || tipo.trim().length === 0) return res.status(400).json({ error: "El campo tipo debe ser una cadena de texto no vacía" });
                updateData.tipo = tipo.trim();
            }
            if (url_archivo !== undefined) {
                if (typeof url_archivo !== 'string' || url_archivo.trim().length === 0) return res.status(400).json({ error: "El campo url_archivo debe ser una cadena de texto no vacía" });
                updateData.url_archivo = url_archivo.trim();
            }
            if (fecha_subida !== undefined) {
                const fecha = new Date(fecha_subida);
                if (isNaN(fecha.getTime())) return res.status(400).json({ error: "El campo fecha_subida debe ser una fecha válida" });
                updateData.fecha_subida = fecha;
            }
            const updated = await this.app.updateArchivo(id, updateData);
            if (!updated) return res.status(404).json({ error: "Archivo no encontrado" });
            return res.status(200).json({ message: "Archivo actualizado con éxito" });
        } catch (error) {
            return res.status(500).json({ error: "Error al actualizar archivo", details: (error as Error).message });
        }
    }

    async deleteArchivo(req: Request, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: "El id debe ser un número válido" });
            const deleted = await this.app.deleteArchivo(id);
            if (!deleted) return res.status(404).json({ error: "Archivo no encontrado" });
            return res.status(200).json({ message: "Archivo eliminado con éxito" });
        } catch (error) {
            return res.status(500).json({ error: "Error al eliminar archivo", details: (error as Error).message });
        }
    }

    async getArchivoById(req: Request, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: "El id debe ser un número válido" });
            const archivo = await this.app.getArchivoById(id);
            if (!archivo) return res.status(404).json({ error: "Archivo no encontrado" });
            return res.status(200).json(archivo);
        } catch (error) {
            return res.status(500).json({ error: "Error al obtener archivo", details: (error as Error).message });
        }
    }

    async getAllArchivos(req: Request, res: Response): Promise<Response> {
        try {
            const archivos = await this.app.getAllArchivos();
            return res.status(200).json(archivos);
        } catch (error) {
            return res.status(500).json({ error: "Error al obtener archivos", details: (error as Error).message });
        }
    }

    async getArchivosByPaciente(req: Request, res: Response): Promise<Response> {
        try {
            const paciente = parseInt(req.params.paciente);
            if (isNaN(paciente)) return res.status(400).json({ error: "El paciente debe ser un número válido" });
            const archivos = await this.app.getArchivosByPaciente(paciente);
            return res.status(200).json(archivos);
        } catch (error) {
            return res.status(500).json({ error: "Error al obtener archivos por paciente", details: (error as Error).message });
        }
    }

    async getArchivosByFecha(req: Request, res: Response): Promise<Response> {
        try {
            const { fechaInicio, fechaFin } = req.query;
            if (!fechaInicio || !fechaFin) return res.status(400).json({ error: "Debe proporcionar fechaInicio y fechaFin" });
            const inicio = new Date(fechaInicio as string);
            const fin = new Date(fechaFin as string);
            if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return res.status(400).json({ error: "Las fechas deben ser válidas" });
            const archivos = await this.app.getArchivosByFecha(inicio, fin);
            return res.status(200).json(archivos);
        } catch (error) {
            return res.status(500).json({ error: "Error al obtener archivos por fecha", details: (error as Error).message });
        }
    }
}
