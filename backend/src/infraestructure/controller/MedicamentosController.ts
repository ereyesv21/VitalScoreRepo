import { Request, Response } from 'express';
import { MedicamentosApplicationService } from '../../application/MedicamentosApplicationService';

export class MedicamentosController {
  constructor(private medicamentosService: MedicamentosApplicationService) {}

  async create(req: Request, res: Response) {
    try {
      const medicamento = await this.medicamentosService.createMedicamento(req.body);
      res.status(201).json(medicamento);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const medicamento = await this.medicamentosService.getMedicamentoById(Number(req.params.id));
      if (!medicamento) return res.status(404).json({ error: 'No encontrado' });
      res.json(medicamento);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getByNombre(req: Request, res: Response) {
    try {
      const medicamento = await this.medicamentosService.getMedicamentoByNombre(req.params.nombre);
      if (!medicamento) return res.status(404).json({ error: 'No encontrado' });
      res.json(medicamento);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getByEstado(req: Request, res: Response) {
    try {
      const medicamentos = await this.medicamentosService.getMedicamentosByEstado(req.params.estado);
      res.json(medicamentos);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const medicamento = await this.medicamentosService.updateMedicamento(Number(req.params.id), req.body);
      if (!medicamento) return res.status(404).json({ error: 'No encontrado' });
      res.json(medicamento);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const deleted = await this.medicamentosService.deleteMedicamento(Number(req.params.id));
      if (!deleted) return res.status(404).json({ error: 'No encontrado' });
      res.json({ deleted: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(_req: Request, res: Response) {
    try {
      const medicamentos = await this.medicamentosService.getAllMedicamentos();
      res.json(medicamentos);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
} 