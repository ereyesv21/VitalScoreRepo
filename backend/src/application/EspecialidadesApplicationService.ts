import { Especialidades } from '../domain/Especialidades';
import { EspecialidadesPort } from '../domain/EspecialidadesPort';

export class EspecialidadesApplicationService {
  constructor(private especialidadesPort: EspecialidadesPort) {}

  async createEspecialidad(especialidad: Especialidades): Promise<Especialidades> {
    // Validaciones
    if (!especialidad.nombre || especialidad.nombre.trim().length === 0) {
      throw new Error('El nombre de la especialidad es requerido');
    }

    if (especialidad.nombre.length > 100) {
      throw new Error('El nombre de la especialidad no puede exceder 100 caracteres');
    }

    if (especialidad.estado) {
      const estadosValidos = ['activa', 'inactiva'];
      if (!estadosValidos.includes(especialidad.estado)) {
        throw new Error('El estado debe ser activa o inactiva');
      }
    }

    // Validar que no exista una especialidad con el mismo nombre
    const especialidadExistente = await this.especialidadesPort.findByNombre(especialidad.nombre.trim());
    if (especialidadExistente) {
      throw new Error('Ya existe una especialidad con ese nombre');
    }

    // Establecer valores por defecto
    const nuevaEspecialidad: Especialidades = {
      ...especialidad,
      nombre: especialidad.nombre.trim(),
      estado: especialidad.estado || 'activa'
    };

    return await this.especialidadesPort.create(nuevaEspecialidad);
  }

  async getEspecialidadById(id: number): Promise<Especialidades | null> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }

    return await this.especialidadesPort.findById(id);
  }

  async getEspecialidadByNombre(nombre: string): Promise<Especialidades | null> {
    if (!nombre || nombre.trim().length === 0) {
      throw new Error('El nombre es requerido para la búsqueda');
    }

    return await this.especialidadesPort.findByNombre(nombre.trim());
  }

  async getEspecialidadesByEstado(estado: string): Promise<Especialidades[]> {
    if (!estado) {
      throw new Error('El estado es requerido para la búsqueda');
    }

    const estadosValidos = ['activa', 'inactiva'];
    if (!estadosValidos.includes(estado)) {
      throw new Error('El estado debe ser activa o inactiva');
    }

    return await this.especialidadesPort.findByEstado(estado);
  }

  async updateEspecialidad(id: number, especialidad: Partial<Especialidades>): Promise<Especialidades | null> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }

    // Validar que la especialidad existe
    const especialidadExistente = await this.especialidadesPort.findById(id);
    if (!especialidadExistente) {
      throw new Error('La especialidad no existe');
    }

    // Validaciones para campos que se van a actualizar
    if (especialidad.nombre) {
      if (especialidad.nombre.trim().length === 0) {
        throw new Error('El nombre de la especialidad no puede estar vacío');
      }
      if (especialidad.nombre.length > 100) {
        throw new Error('El nombre de la especialidad no puede exceder 100 caracteres');
      }

      // Validar que no exista otra especialidad con el mismo nombre
      const especialidadConMismoNombre = await this.especialidadesPort.findByNombre(especialidad.nombre.trim());
      if (especialidadConMismoNombre && especialidadConMismoNombre.id_especialidad !== id) {
        throw new Error('Ya existe otra especialidad con ese nombre');
      }
    }

    if (especialidad.estado) {
      const estadosValidos = ['activa', 'inactiva'];
      if (!estadosValidos.includes(especialidad.estado)) {
        throw new Error('El estado debe ser activa o inactiva');
      }
    }

    return await this.especialidadesPort.update(id, especialidad);
  }

  async deleteEspecialidad(id: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }

    // Validar que la especialidad existe
    const especialidadExistente = await this.especialidadesPort.findById(id);
    if (!especialidadExistente) {
      throw new Error('La especialidad no existe');
    }

    return await this.especialidadesPort.delete(id);
  }

  async getAllEspecialidades(): Promise<Especialidades[]> {
    return await this.especialidadesPort.findAll();
  }
} 