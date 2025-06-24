import { Request, Response } from 'express';
import { DisponibilidadTemporalApplicationService } from '../../application/DisponibilidadTemporalApplicationService';
import { DisponibilidadTemporal } from '../../domain/DisponibilidadTemporal';

export class DisponibilidadTemporalController {
  constructor(private disponibilidadTemporalService: DisponibilidadTemporalApplicationService) {}

  async createDisponibilidadTemporal(req: Request, res: Response): Promise<void> {
    try {
      const disponibilidadData = req.body;
      
      // Convertir fechas de string a Date
      if (disponibilidadData.fecha_inicio) {
        disponibilidadData.fecha_inicio = new Date(disponibilidadData.fecha_inicio);
      }
      if (disponibilidadData.fecha_fin) {
        disponibilidadData.fecha_fin = new Date(disponibilidadData.fecha_fin);
      }

      const nuevaDisponibilidad = await this.disponibilidadTemporalService.createDisponibilidadTemporal(disponibilidadData);
      
      res.status(201).json({
        success: true,
        message: 'Disponibilidad temporal creada exitosamente',
        data: nuevaDisponibilidad
      });
    } catch (error) {
      console.error('Error al crear disponibilidad temporal:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getDisponibilidadTemporalById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const disponibilidad = await this.disponibilidadTemporalService.getDisponibilidadTemporalById(id);
      
      if (!disponibilidad) {
        res.status(404).json({
          success: false,
          message: 'Disponibilidad temporal no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: disponibilidad
      });
    } catch (error) {
      console.error('Error al obtener disponibilidad temporal:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getDisponibilidadesByMedico(req: Request, res: Response): Promise<void> {
    try {
      const medicoId = parseInt(req.params.medicoId);
      const disponibilidades = await this.disponibilidadTemporalService.getDisponibilidadesByMedico(medicoId);
      
      res.status(200).json({
        success: true,
        data: disponibilidades
      });
    } catch (error) {
      console.error('Error al obtener disponibilidades por médico:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getDisponibilidadesByFechas(req: Request, res: Response): Promise<void> {
    try {
      const { fechaInicio, fechaFin } = req.query;
      
      if (!fechaInicio || !fechaFin) {
        res.status(400).json({
          success: false,
          message: 'Las fechas de inicio y fin son requeridas'
        });
        return;
      }

      const fechaInicioDate = new Date(fechaInicio as string);
      const fechaFinDate = new Date(fechaFin as string);

      const disponibilidades = await this.disponibilidadTemporalService.getDisponibilidadesByFechas(fechaInicioDate, fechaFinDate);
      
      res.status(200).json({
        success: true,
        data: disponibilidades
      });
    } catch (error) {
      console.error('Error al obtener disponibilidades por fechas:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async updateDisponibilidadTemporal(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      // Convertir fechas de string a Date si están presentes
      if (updateData.fecha_inicio) {
        updateData.fecha_inicio = new Date(updateData.fecha_inicio);
      }
      if (updateData.fecha_fin) {
        updateData.fecha_fin = new Date(updateData.fecha_fin);
      }

      const disponibilidadActualizada = await this.disponibilidadTemporalService.updateDisponibilidadTemporal(id, updateData);
      
      if (!disponibilidadActualizada) {
        res.status(404).json({
          success: false,
          message: 'Disponibilidad temporal no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Disponibilidad temporal actualizada exitosamente',
        data: disponibilidadActualizada
      });
    } catch (error) {
      console.error('Error al actualizar disponibilidad temporal:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async deleteDisponibilidadTemporal(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const eliminado = await this.disponibilidadTemporalService.deleteDisponibilidadTemporal(id);
      
      if (!eliminado) {
        res.status(404).json({
          success: false,
          message: 'Disponibilidad temporal no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Disponibilidad temporal eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar disponibilidad temporal:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getAllDisponibilidadesTemporales(req: Request, res: Response): Promise<void> {
    try {
      const disponibilidades = await this.disponibilidadTemporalService.getAllDisponibilidadesTemporales();
      
      res.status(200).json({
        success: true,
        data: disponibilidades
      });
    } catch (error) {
      console.error('Error al obtener todas las disponibilidades temporales:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }
} 