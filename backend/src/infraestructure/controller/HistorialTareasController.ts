import { Request, Response } from 'express';
import { HistorialTareasApplicationService } from '../../application/HistorialTareasApplicationService';

export class HistorialTareasController {
  constructor(private historialTareasService: HistorialTareasApplicationService) {}

  async createHistorialTarea(req: Request, res: Response): Promise<void> {
    try {
      const historialData = req.body;
      const nuevoHistorial = await this.historialTareasService.createHistorialTarea(historialData);
      res.status(201).json({
        success: true,
        message: 'Historial de tarea creado exitosamente',
        data: nuevoHistorial
      });
    } catch (error) {
      console.error('Error al crear historial de tarea:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getHistorialTareaById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const historial = await this.historialTareasService.getHistorialTareaById(id);
      if (!historial) {
        res.status(404).json({
          success: false,
          message: 'Historial de tarea no encontrado'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: historial
      });
    } catch (error) {
      console.error('Error al obtener historial de tarea:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getHistorialTareasByPaciente(req: Request, res: Response): Promise<void> {
    try {
      const pacienteId = parseInt(req.params.pacienteId);
      const historiales = await this.historialTareasService.getHistorialTareasByPaciente(pacienteId);
      res.status(200).json({
        success: true,
        data: historiales
      });
    } catch (error) {
      console.error('Error al obtener historiales por paciente:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getHistorialTareasByTarea(req: Request, res: Response): Promise<void> {
    try {
      const tareaId = parseInt(req.params.tareaId);
      const historiales = await this.historialTareasService.getHistorialTareasByTarea(tareaId);
      res.status(200).json({
        success: true,
        data: historiales
      });
    } catch (error) {
      console.error('Error al obtener historiales por tarea:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getHistorialTareasByFecha(req: Request, res: Response): Promise<void> {
    try {
      const fecha = new Date(req.params.fecha);
      const historiales = await this.historialTareasService.getHistorialTareasByFecha(fecha);
      res.status(200).json({
        success: true,
        data: historiales
      });
    } catch (error) {
      console.error('Error al obtener historiales por fecha:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async updateHistorialTarea(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const historialActualizado = await this.historialTareasService.updateHistorialTarea(id, updateData);
      if (!historialActualizado) {
        res.status(404).json({
          success: false,
          message: 'Historial de tarea no encontrado'
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Historial de tarea actualizado exitosamente',
        data: historialActualizado
      });
    } catch (error) {
      console.error('Error al actualizar historial de tarea:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async deleteHistorialTarea(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const eliminado = await this.historialTareasService.deleteHistorialTarea(id);
      if (!eliminado) {
        res.status(404).json({
          success: false,
          message: 'Historial de tarea no encontrado'
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Historial de tarea eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar historial de tarea:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getAllHistorialTareas(req: Request, res: Response): Promise<void> {
    try {
      const historiales = await this.historialTareasService.getAllHistorialTareas();
      res.status(200).json({
        success: true,
        data: historiales
      });
    } catch (error) {
      console.error('Error al obtener todos los historiales de tareas:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }
} 