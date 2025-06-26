import { Request, Response } from 'express';
import { TareasPacientesApplicationService } from '../../application/TareasPacientesApplicationService';

export class TareasPacientesController {
  private readonly service: TareasPacientesApplicationService;

  constructor(service: TareasPacientesApplicationService) {
    this.service = service;
  }

  async asignarTarea(req: Request, res: Response) {
    try {
      console.log('Body recibido en asignarTarea:', req.body);
      const data = req.body;
      const tarea = await this.service.asignarTarea(data);
      res.status(201).json(tarea);
    } catch (error) {
      console.error('Error real al asignar tarea:', error);
      res.status(400).json({ error: 'No se pudo asignar la tarea', details: error });
    }
  }

  async getTareasPorPaciente(req: Request, res: Response) {
    try {
      const pacienteId = parseInt(req.params.pacienteId);
      const tareas = await this.service.getTareasPorPaciente(pacienteId);
      res.status(200).json(tareas);
    } catch (error) {
      res.status(400).json({ error: 'No se pudieron obtener las tareas', details: error });
    }
  }

  async marcarComoCompletada(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await this.service.marcarComoCompletada(id);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ error: 'No se pudo marcar como completada', details: error });
    }
  }
} 