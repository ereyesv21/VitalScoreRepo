import { Request, Response } from 'express';
import { HorariosMedicosApplicationService } from '../../application/HorariosMedicosApplicationService';

export class HorariosMedicosController {
  constructor(private horariosMedicosService: HorariosMedicosApplicationService) {}

  async createHorarioMedico(req: Request, res: Response): Promise<void> {
    try {
      const horarioData = req.body;
      const nuevoHorario = await this.horariosMedicosService.createHorarioMedico(horarioData);
      res.status(201).json({
        success: true,
        message: 'Horario médico creado exitosamente',
        data: nuevoHorario
      });
    } catch (error) {
      console.error('Error al crear horario médico:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getHorarioMedicoById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const horario = await this.horariosMedicosService.getHorarioMedicoById(id);
      if (!horario) {
        res.status(404).json({
          success: false,
          message: 'Horario médico no encontrado'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: horario
      });
    } catch (error) {
      console.error('Error al obtener horario médico:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getHorariosByMedico(req: Request, res: Response): Promise<void> {
    try {
      const medicoId = parseInt(req.params.medicoId);
      const horarios = await this.horariosMedicosService.getHorariosByMedico(medicoId);
      res.status(200).json({
        success: true,
        data: horarios
      });
    } catch (error) {
      console.error('Error al obtener horarios por médico:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getHorariosByDiaSemana(req: Request, res: Response): Promise<void> {
    try {
      const diaSemana = parseInt(req.params.diaSemana);
      const horarios = await this.horariosMedicosService.getHorariosByDiaSemana(diaSemana);
      res.status(200).json({
        success: true,
        data: horarios
      });
    } catch (error) {
      console.error('Error al obtener horarios por día de la semana:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getHorariosByMedicoAndDia(req: Request, res: Response): Promise<void> {
    try {
      const medicoId = parseInt(req.params.medicoId);
      const diaSemana = parseInt(req.params.diaSemana);
      const horarios = await this.horariosMedicosService.getHorariosByMedicoAndDia(medicoId, diaSemana);
      res.status(200).json({
        success: true,
        data: horarios
      });
    } catch (error) {
      console.error('Error al obtener horarios por médico y día:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async updateHorarioMedico(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const horarioActualizado = await this.horariosMedicosService.updateHorarioMedico(id, updateData);
      if (!horarioActualizado) {
        res.status(404).json({
          success: false,
          message: 'Horario médico no encontrado'
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Horario médico actualizado exitosamente',
        data: horarioActualizado
      });
    } catch (error) {
      console.error('Error al actualizar horario médico:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async deleteHorarioMedico(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const eliminado = await this.horariosMedicosService.deleteHorarioMedico(id);
      if (!eliminado) {
        res.status(404).json({
          success: false,
          message: 'Horario médico no encontrado'
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Horario médico eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar horario médico:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getAllHorariosMedicos(req: Request, res: Response): Promise<void> {
    try {
      const horarios = await this.horariosMedicosService.getAllHorariosMedicos();
      res.status(200).json({
        success: true,
        data: horarios
      });
    } catch (error) {
      console.error('Error al obtener todos los horarios médicos:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // NUEVO MÉTODO: Obtener horarios disponibles de un médico para una fecha
  async getDisponibilidadByMedicoYFecha(req: Request, res: Response): Promise<void> {
    try {
      const medicoId = parseInt(req.params.medicoId);
      const fecha = req.query.fecha as string;
      if (!fecha) {
        res.status(400).json({ success: false, message: 'La fecha es requerida' });
        return;
      }
      const result = await this.horariosMedicosService.getDisponibilidadByMedicoYFecha(medicoId, fecha);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al obtener disponibilidad de horarios:', error);
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Error interno del servidor' });
    }
  }
} 