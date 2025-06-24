import { Request, Response } from 'express';
import { EnfermedadesApplicationService } from '../../application/EnfermedadesApplicationService';

export class EnfermedadesController {
  constructor(private enfermedadesService: EnfermedadesApplicationService) {}

  async createEnfermedad(req: Request, res: Response): Promise<void> {
    try {
      const enfermedadData = req.body;
      const nuevaEnfermedad = await this.enfermedadesService.createEnfermedad(enfermedadData);
      
      res.status(201).json({
        success: true,
        message: 'Enfermedad creada exitosamente',
        data: nuevaEnfermedad
      });
    } catch (error) {
      console.error('Error al crear enfermedad:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getEnfermedadById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const enfermedad = await this.enfermedadesService.getEnfermedadById(id);
      
      if (!enfermedad) {
        res.status(404).json({
          success: false,
          message: 'Enfermedad no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: enfermedad
      });
    } catch (error) {
      console.error('Error al obtener enfermedad:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getEnfermedadesByNombre(req: Request, res: Response): Promise<void> {
    try {
      const nombre = req.params.nombre;
      const enfermedades = await this.enfermedadesService.getEnfermedadesByNombre(nombre);
      
      res.status(200).json({
        success: true,
        data: enfermedades
      });
    } catch (error) {
      console.error('Error al obtener enfermedades por nombre:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getEnfermedadesByCategoria(req: Request, res: Response): Promise<void> {
    try {
      const categoria = req.params.categoria;
      const enfermedades = await this.enfermedadesService.getEnfermedadesByCategoria(categoria);
      
      res.status(200).json({
        success: true,
        data: enfermedades
      });
    } catch (error) {
      console.error('Error al obtener enfermedades por categoría:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getEnfermedadesByEstado(req: Request, res: Response): Promise<void> {
    try {
      const estado = req.params.estado;
      const enfermedades = await this.enfermedadesService.getEnfermedadesByEstado(estado);
      
      res.status(200).json({
        success: true,
        data: enfermedades
      });
    } catch (error) {
      console.error('Error al obtener enfermedades por estado:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async updateEnfermedad(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;

      const enfermedadActualizada = await this.enfermedadesService.updateEnfermedad(id, updateData);
      
      if (!enfermedadActualizada) {
        res.status(404).json({
          success: false,
          message: 'Enfermedad no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Enfermedad actualizada exitosamente',
        data: enfermedadActualizada
      });
    } catch (error) {
      console.error('Error al actualizar enfermedad:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async deleteEnfermedad(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const eliminado = await this.enfermedadesService.deleteEnfermedad(id);
      
      if (!eliminado) {
        res.status(404).json({
          success: false,
          message: 'Enfermedad no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Enfermedad eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar enfermedad:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getAllEnfermedades(req: Request, res: Response): Promise<void> {
    try {
      const enfermedades = await this.enfermedadesService.getAllEnfermedades();
      
      res.status(200).json({
        success: true,
        data: enfermedades
      });
    } catch (error) {
      console.error('Error al obtener todas las enfermedades:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }
} 