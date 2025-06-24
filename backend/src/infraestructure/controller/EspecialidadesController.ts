import { Request, Response } from 'express';
import { EspecialidadesApplicationService } from '../../application/EspecialidadesApplicationService';

export class EspecialidadesController {
  constructor(private especialidadesService: EspecialidadesApplicationService) {}

  async createEspecialidad(req: Request, res: Response): Promise<void> {
    try {
      const especialidadData = req.body;
      const nuevaEspecialidad = await this.especialidadesService.createEspecialidad(especialidadData);
      res.status(201).json({
        success: true,
        message: 'Especialidad creada exitosamente',
        data: nuevaEspecialidad
      });
    } catch (error) {
      console.error('Error al crear especialidad:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getEspecialidadById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const especialidad = await this.especialidadesService.getEspecialidadById(id);
      if (!especialidad) {
        res.status(404).json({
          success: false,
          message: 'Especialidad no encontrada'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: especialidad
      });
    } catch (error) {
      console.error('Error al obtener especialidad:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getEspecialidadByNombre(req: Request, res: Response): Promise<void> {
    try {
      const nombre = req.params.nombre;
      const especialidad = await this.especialidadesService.getEspecialidadByNombre(nombre);
      if (!especialidad) {
        res.status(404).json({
          success: false,
          message: 'Especialidad no encontrada'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: especialidad
      });
    } catch (error) {
      console.error('Error al obtener especialidad por nombre:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getEspecialidadesByEstado(req: Request, res: Response): Promise<void> {
    try {
      const estado = req.params.estado;
      const especialidades = await this.especialidadesService.getEspecialidadesByEstado(estado);
      res.status(200).json({
        success: true,
        data: especialidades
      });
    } catch (error) {
      console.error('Error al obtener especialidades por estado:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async updateEspecialidad(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const especialidadActualizada = await this.especialidadesService.updateEspecialidad(id, updateData);
      if (!especialidadActualizada) {
        res.status(404).json({
          success: false,
          message: 'Especialidad no encontrada'
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Especialidad actualizada exitosamente',
        data: especialidadActualizada
      });
    } catch (error) {
      console.error('Error al actualizar especialidad:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async deleteEspecialidad(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const eliminado = await this.especialidadesService.deleteEspecialidad(id);
      if (!eliminado) {
        res.status(404).json({
          success: false,
          message: 'Especialidad no encontrada'
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Especialidad eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar especialidad:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getAllEspecialidades(req: Request, res: Response): Promise<void> {
    try {
      const especialidades = await this.especialidadesService.getAllEspecialidades();
      res.status(200).json({
        success: true,
        data: especialidades
      });
    } catch (error) {
      console.error('Error al obtener todas las especialidades:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }
} 