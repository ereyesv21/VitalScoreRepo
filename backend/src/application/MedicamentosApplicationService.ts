import { Medicamentos } from '../domain/Medicamentos';
import { MedicamentosPort } from '../domain/MedicamentosPort';

export class MedicamentosApplicationService {
  constructor(private medicamentosPort: MedicamentosPort) {}

  async createMedicamento(medicamento: Medicamentos): Promise<Medicamentos> {
    // Validaciones
    if (!medicamento.nombre || medicamento.nombre.trim().length === 0) {
      throw new Error('El nombre del medicamento es requerido');
    }

    if (medicamento.nombre.length > 255) {
      throw new Error('El nombre del medicamento no puede exceder 255 caracteres');
    }

    if (medicamento.dosis_recomendada && medicamento.dosis_recomendada.length > 100) {
      throw new Error('La dosis recomendada no puede exceder 100 caracteres');
    }

    if (medicamento.frecuencia && medicamento.frecuencia.length > 100) {
      throw new Error('La frecuencia no puede exceder 100 caracteres');
    }

    if (medicamento.duracion_tratamiento && medicamento.duracion_tratamiento.length > 100) {
      throw new Error('La duración del tratamiento no puede exceder 100 caracteres');
    }

    if (medicamento.estado) {
      const estadosValidos = ['activo', 'inactivo', 'discontinuado'];
      if (!estadosValidos.includes(medicamento.estado)) {
        throw new Error('El estado debe ser uno de: activo, inactivo, discontinuado');
      }
    }

    // Validar que no exista un medicamento con el mismo nombre activo
    const medicamentoExistente = await this.medicamentosPort.findByNombre(medicamento.nombre);
    if (medicamentoExistente && medicamentoExistente.estado === 'activo') {
      throw new Error('Ya existe un medicamento activo con ese nombre');
    }

    // Establecer valores por defecto
    const nuevoMedicamento: Medicamentos = {
      ...medicamento,
      estado: medicamento.estado || 'activo',
      fecha_creacion: medicamento.fecha_creacion || new Date()
    };

    return await this.medicamentosPort.create(nuevoMedicamento);
  }

  async getMedicamentoById(id: number): Promise<Medicamentos | null> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }

    return await this.medicamentosPort.findById(id);
  }

  async getMedicamentoByNombre(nombre: string): Promise<Medicamentos | null> {
    if (!nombre || nombre.trim().length === 0) {
      throw new Error('El nombre es requerido para la búsqueda');
    }

    return await this.medicamentosPort.findByNombre(nombre);
  }

  async getMedicamentosByEstado(estado: string): Promise<Medicamentos[]> {
    if (!estado) {
      throw new Error('El estado es requerido para la búsqueda');
    }

    const estadosValidos = ['activo', 'inactivo', 'discontinuado'];
    if (!estadosValidos.includes(estado)) {
      throw new Error('El estado debe ser uno de: activo, inactivo, discontinuado');
    }

    return await this.medicamentosPort.findByEstado(estado);
  }

  async updateMedicamento(id: number, medicamento: Partial<Medicamentos>): Promise<Medicamentos | null> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }

    // Validar que el medicamento existe
    const medicamentoExistente = await this.medicamentosPort.findById(id);
    if (!medicamentoExistente) {
      throw new Error('El medicamento no existe');
    }

    // Validaciones para campos que se van a actualizar
    if (medicamento.nombre !== undefined) {
      if (!medicamento.nombre || medicamento.nombre.trim().length === 0) {
        throw new Error('El nombre del medicamento es requerido');
      }

      if (medicamento.nombre.length > 255) {
        throw new Error('El nombre del medicamento no puede exceder 255 caracteres');
      }

      // Validar que no exista otro medicamento activo con el mismo nombre
      const medicamentoConMismoNombre = await this.medicamentosPort.findByNombre(medicamento.nombre);
      if (medicamentoConMismoNombre && 
          medicamentoConMismoNombre.id_medicamento !== id && 
          medicamentoConMismoNombre.estado === 'activo') {
        throw new Error('Ya existe otro medicamento activo con ese nombre');
      }
    }

    if (medicamento.dosis_recomendada !== undefined && medicamento.dosis_recomendada && medicamento.dosis_recomendada.length > 100) {
      throw new Error('La dosis recomendada no puede exceder 100 caracteres');
    }

    if (medicamento.frecuencia !== undefined && medicamento.frecuencia && medicamento.frecuencia.length > 100) {
      throw new Error('La frecuencia no puede exceder 100 caracteres');
    }

    if (medicamento.duracion_tratamiento !== undefined && medicamento.duracion_tratamiento && medicamento.duracion_tratamiento.length > 100) {
      throw new Error('La duración del tratamiento no puede exceder 100 caracteres');
    }

    if (medicamento.estado !== undefined) {
      const estadosValidos = ['activo', 'inactivo', 'discontinuado'];
      if (!estadosValidos.includes(medicamento.estado)) {
        throw new Error('El estado debe ser uno de: activo, inactivo, discontinuado');
      }
    }

    return await this.medicamentosPort.update(id, medicamento);
  }

  async deleteMedicamento(id: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }

    // Validar que el medicamento existe
    const medicamentoExistente = await this.medicamentosPort.findById(id);
    if (!medicamentoExistente) {
      throw new Error('El medicamento no existe');
    }

    return await this.medicamentosPort.delete(id);
  }

  async getAllMedicamentos(): Promise<Medicamentos[]> {
    return await this.medicamentosPort.findAll();
  }
} 