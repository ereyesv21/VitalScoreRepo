import { Request, Response } from 'express';
import { HorariosMedicosDetalladosApplicationService } from '../../application/HorariosMedicosDetalladosApplicationService';

export class HorariosMedicosDetalladosController {
  constructor(private horariosMedicosDetalladosService: HorariosMedicosDetalladosApplicationService) {}

  async create(req: Request, res: Response) {
    try {
      const horario = await this.horariosMedicosDetalladosService.createHorarioMedicoDetallado(req.body);
      res.status(201).json(horario);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const horario = await this.horariosMedicosDetalladosService.getHorarioMedicoDetalladoById(Number(req.params.id));
      if (!horario) return res.status(404).json({ error: 'No encontrado' });
      res.json(horario);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getByMedico(req: Request, res: Response) {
    try {
      const horarios = await this.horariosMedicosDetalladosService.getHorariosByMedico(Number(req.params.medicoId));
      res.json(horarios);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getByFecha(req: Request, res: Response) {
    try {
      const fecha = new Date(req.params.fecha);
      const horarios = await this.horariosMedicosDetalladosService.getHorariosByFecha(fecha);
      res.json(horarios);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getByMedicoAndFecha(req: Request, res: Response) {
    try {
      const medicoId = Number(req.params.medicoId);
      const fecha = new Date(req.params.fecha);
      const horarios = await this.horariosMedicosDetalladosService.getHorariosByMedicoAndFecha(medicoId, fecha);
      res.json(horarios);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getByTipo(req: Request, res: Response) {
    try {
      const horarios = await this.horariosMedicosDetalladosService.getHorariosByTipo(req.params.tipo);
      res.json(horarios);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getByEstado(req: Request, res: Response) {
    try {
      const horarios = await this.horariosMedicosDetalladosService.getHorariosByEstado(req.params.estado);
      res.json(horarios);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const horario = await this.horariosMedicosDetalladosService.updateHorarioMedicoDetallado(Number(req.params.id), req.body);
      if (!horario) return res.status(404).json({ error: 'No encontrado' });
      res.json(horario);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const deleted = await this.horariosMedicosDetalladosService.deleteHorarioMedicoDetallado(Number(req.params.id));
      if (!deleted) return res.status(404).json({ error: 'No encontrado' });
      res.json({ deleted: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(_req: Request, res: Response) {
    try {
      const horarios = await this.horariosMedicosDetalladosService.getAllHorariosMedicosDetallados();
      res.json(horarios);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
} 