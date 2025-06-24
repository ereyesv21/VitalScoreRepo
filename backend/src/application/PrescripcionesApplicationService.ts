import { Prescripciones } from '../domain/Prescripciones';
import { PrescripcionesPort } from '../domain/PrescripcionesPort';

export class PrescripcionesApplicationService {
  constructor(private prescripcionesPort: PrescripcionesPort) {}

  async createPrescripcion(prescripcion: Prescripciones): Promise<Prescripciones> {
    // Validaciones básicas
    if (!prescripcion.paciente || prescripcion.paciente <= 0) {
      throw new Error('El paciente es requerido y debe ser un ID válido');
    }

    if (!prescripcion.medico || prescripcion.medico <= 0) {
      throw new Error('El médico es requerido y debe ser un ID válido');
    }

    if (!prescripcion.medicamento || prescripcion.medicamento <= 0) {
      throw new Error('El medicamento es requerido y debe ser un ID válido');
    }

    if (!prescripcion.dosis || prescripcion.dosis.trim().length === 0) {
      throw new Error('La dosis es requerida');
    }

    if (prescripcion.dosis.length > 100) {
      throw new Error('La dosis no puede exceder 100 caracteres');
    }

    if (!prescripcion.frecuencia || prescripcion.frecuencia.trim().length === 0) {
      throw new Error('La frecuencia es requerida');
    }

    if (prescripcion.frecuencia.length > 100) {
      throw new Error('La frecuencia no puede exceder 100 caracteres');
    }

    if (!prescripcion.duracion || prescripcion.duracion.trim().length === 0) {
      throw new Error('La duración es requerida');
    }

    if (prescripcion.duracion.length > 100) {
      throw new Error('La duración no puede exceder 100 caracteres');
    }

    if (prescripcion.instrucciones && prescripcion.instrucciones.length > 1000) {
      throw new Error('Las instrucciones no pueden exceder 1000 caracteres');
    }

    if (!prescripcion.fecha_inicio) {
      throw new Error('La fecha de inicio es requerida');
    }

    if (prescripcion.fecha_fin && prescripcion.fecha_inicio > prescripcion.fecha_fin) {
      throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
    }

    if (prescripcion.estado) {
      const estadosValidos = ['activa', 'inactiva', 'completada', 'cancelada'];
      if (!estadosValidos.includes(prescripcion.estado)) {
        throw new Error('El estado debe ser uno de: activa, inactiva, completada, cancelada');
      }
    }

    // Validar que no haya prescripciones activas del mismo medicamento para el mismo paciente
    const prescripcionesActivas = await this.prescripcionesPort.findByPaciente(prescripcion.paciente);
    const prescripcionActivaMismoMedicamento = prescripcionesActivas.find(p => 
      p.medicamento === prescripcion.medicamento && 
      p.estado === 'activa' &&
      (!p.fecha_fin || p.fecha_fin >= prescripcion.fecha_inicio)
    );

    if (prescripcionActivaMismoMedicamento) {
      throw new Error('Ya existe una prescripción activa para este medicamento y paciente');
    }

    // Establecer valores por defecto
    const nuevaPrescripcion: Prescripciones = {
      ...prescripcion,
      estado: prescripcion.estado || 'activa',
      fecha_creacion: prescripcion.fecha_creacion || new Date()
    };

    return await this.prescripcionesPort.create(nuevaPrescripcion);
  }

  async getPrescripcionById(id: number): Promise<Prescripciones | null> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }

    return await this.prescripcionesPort.findById(id);
  }

  async getPrescripcionesByPaciente(pacienteId: number): Promise<Prescripciones[]> {
    if (!pacienteId || pacienteId <= 0) {
      throw new Error('El ID del paciente debe ser un número mayor a 0');
    }

    return await this.prescripcionesPort.findByPaciente(pacienteId);
  }

  async getPrescripcionesByMedico(medicoId: number): Promise<Prescripciones[]> {
    if (!medicoId || medicoId <= 0) {
      throw new Error('El ID del médico debe ser un número mayor a 0');
    }

    return await this.prescripcionesPort.findByMedico(medicoId);
  }

  async getPrescripcionesByCita(citaId: number): Promise<Prescripciones[]> {
    if (!citaId || citaId <= 0) {
      throw new Error('El ID de la cita debe ser un número mayor a 0');
    }

    return await this.prescripcionesPort.findByCita(citaId);
  }

  async getPrescripcionesByMedicamento(medicamentoId: number): Promise<Prescripciones[]> {
    if (!medicamentoId || medicamentoId <= 0) {
      throw new Error('El ID del medicamento debe ser un número mayor a 0');
    }

    return await this.prescripcionesPort.findByMedicamento(medicamentoId);
  }

  async getPrescripcionesByEstado(estado: string): Promise<Prescripciones[]> {
    if (!estado) {
      throw new Error('El estado es requerido para la búsqueda');
    }

    const estadosValidos = ['activa', 'inactiva', 'completada', 'cancelada'];
    if (!estadosValidos.includes(estado)) {
      throw new Error('El estado debe ser uno de: activa, inactiva, completada, cancelada');
    }

    return await this.prescripcionesPort.findByEstado(estado);
  }

  async getPrescripcionesByFechas(fechaInicio: Date, fechaFin: Date): Promise<Prescripciones[]> {
    if (!fechaInicio) {
      throw new Error('La fecha de inicio es requerida');
    }

    if (!fechaFin) {
      throw new Error('La fecha de fin es requerida');
    }

    if (fechaInicio > fechaFin) {
      throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
    }

    return await this.prescripcionesPort.findByFechas(fechaInicio, fechaFin);
  }

  async updatePrescripcion(id: number, prescripcion: Partial<Prescripciones>): Promise<Prescripciones | null> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }

    // Validar que la prescripción existe
    const prescripcionExistente = await this.prescripcionesPort.findById(id);
    if (!prescripcionExistente) {
      throw new Error('La prescripción no existe');
    }

    // Validaciones para campos que se van a actualizar
    if (prescripcion.paciente !== undefined && (!prescripcion.paciente || prescripcion.paciente <= 0)) {
      throw new Error('El paciente debe ser un ID válido');
    }

    if (prescripcion.medico !== undefined && (!prescripcion.medico || prescripcion.medico <= 0)) {
      throw new Error('El médico debe ser un ID válido');
    }

    if (prescripcion.medicamento !== undefined && (!prescripcion.medicamento || prescripcion.medicamento <= 0)) {
      throw new Error('El medicamento debe ser un ID válido');
    }

    if (prescripcion.dosis !== undefined) {
      if (!prescripcion.dosis || prescripcion.dosis.trim().length === 0) {
        throw new Error('La dosis es requerida');
      }
      if (prescripcion.dosis.length > 100) {
        throw new Error('La dosis no puede exceder 100 caracteres');
      }
    }

    if (prescripcion.frecuencia !== undefined) {
      if (!prescripcion.frecuencia || prescripcion.frecuencia.trim().length === 0) {
        throw new Error('La frecuencia es requerida');
      }
      if (prescripcion.frecuencia.length > 100) {
        throw new Error('La frecuencia no puede exceder 100 caracteres');
      }
    }

    if (prescripcion.duracion !== undefined) {
      if (!prescripcion.duracion || prescripcion.duracion.trim().length === 0) {
        throw new Error('La duración es requerida');
      }
      if (prescripcion.duracion.length > 100) {
        throw new Error('La duración no puede exceder 100 caracteres');
      }
    }

    if (prescripcion.instrucciones !== undefined && prescripcion.instrucciones && prescripcion.instrucciones.length > 1000) {
      throw new Error('Las instrucciones no pueden exceder 1000 caracteres');
    }

    if (prescripcion.fecha_inicio !== undefined && prescripcion.fecha_fin !== undefined && prescripcion.fecha_fin !== null) {
      if (prescripcion.fecha_inicio > prescripcion.fecha_fin) {
        throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
      }
    }

    if (prescripcion.estado !== undefined) {
      const estadosValidos = ['activa', 'inactiva', 'completada', 'cancelada'];
      if (!estadosValidos.includes(prescripcion.estado)) {
        throw new Error('El estado debe ser uno de: activa, inactiva, completada, cancelada');
      }
    }

    return await this.prescripcionesPort.update(id, prescripcion);
  }

  async deletePrescripcion(id: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }

    // Validar que la prescripción existe
    const prescripcionExistente = await this.prescripcionesPort.findById(id);
    if (!prescripcionExistente) {
      throw new Error('La prescripción no existe');
    }

    return await this.prescripcionesPort.delete(id);
  }

  async getAllPrescripciones(): Promise<Prescripciones[]> {
    return await this.prescripcionesPort.findAll();
  }
} 