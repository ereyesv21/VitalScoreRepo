import { Request, Response } from 'express';
import { PrescripcionesApplicationService } from '../../application/PrescripcionesApplicationService';

export class PrescripcionesController {
  constructor(private prescripcionesService: PrescripcionesApplicationService) {}

  async create(req: Request, res: Response) {
    try {
      const prescripcion = await this.prescripcionesService.createPrescripcion(req.body);
      res.status(201).json(prescripcion);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const prescripcion = await this.prescripcionesService.getPrescripcionById(Number(req.params.id));
      if (!prescripcion) return res.status(404).json({ error: 'No encontrado' });
      res.json(prescripcion);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getByPaciente(req: Request, res: Response) {
    try {
      const prescripciones = await this.prescripcionesService.getPrescripcionesByPaciente(Number(req.params.pacienteId));
      res.json(prescripciones);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getByMedico(req: Request, res: Response) {
    try {
      const prescripciones = await this.prescripcionesService.getPrescripcionesByMedico(Number(req.params.medicoId));
      res.json(prescripciones);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getByCita(req: Request, res: Response) {
    try {
      const prescripciones = await this.prescripcionesService.getPrescripcionesByCita(Number(req.params.citaId));
      res.json(prescripciones);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getByMedicamento(req: Request, res: Response) {
    try {
      const prescripciones = await this.prescripcionesService.getPrescripcionesByMedicamento(Number(req.params.medicamentoId));
      res.json(prescripciones);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getByEstado(req: Request, res: Response) {
    try {
      const prescripciones = await this.prescripcionesService.getPrescripcionesByEstado(req.params.estado);
      res.json(prescripciones);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getByFechas(req: Request, res: Response) {
    try {
      const { fechaInicio, fechaFin } = req.query;
      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({ error: 'Las fechas de inicio y fin son requeridas' });
      }
      
      const prescripciones = await this.prescripcionesService.getPrescripcionesByFechas(
        new Date(fechaInicio as string),
        new Date(fechaFin as string)
      );
      res.json(prescripciones);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const prescripcion = await this.prescripcionesService.updatePrescripcion(Number(req.params.id), req.body);
      if (!prescripcion) return res.status(404).json({ error: 'No encontrado' });
      res.json(prescripcion);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const deleted = await this.prescripcionesService.deletePrescripcion(Number(req.params.id));
      if (!deleted) return res.status(404).json({ error: 'No encontrado' });
      res.json({ deleted: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(_req: Request, res: Response) {
    try {
      const prescripciones = await this.prescripcionesService.getAllPrescripciones();
      res.json(prescripciones);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
} 