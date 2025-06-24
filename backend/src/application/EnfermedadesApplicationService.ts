import { Enfermedades, EnfermedadesPort } from '../domain/Enfermedades';

export class EnfermedadesApplicationService {
  constructor(private enfermedadesPort: EnfermedadesPort) {}

  async createEnfermedad(enfermedad: Enfermedades): Promise<Enfermedades> {
    // Validaciones
    if (!enfermedad.nombre || enfermedad.nombre.trim().length === 0) {
      throw new Error('El nombre de la enfermedad es requerido');
    }

    if (enfermedad.nombre.length > 255) {
      throw new Error('El nombre de la enfermedad no puede exceder 255 caracteres');
    }

    if (enfermedad.categoria && enfermedad.categoria.length > 100) {
      throw new Error('La categoría no puede exceder 100 caracteres');
    }

    if (enfermedad.estado) {
      const estadosValidos = ['activo', 'inactivo'];
      if (!estadosValidos.includes(enfermedad.estado)) {
        throw new Error('El estado debe ser activo o inactivo');
      }
    }

    // Validar que no exista una enfermedad con el mismo nombre
    const enfermedadesExistentes = await this.enfermedadesPort.findByNombre(enfermedad.nombre.trim());
    const enfermedadExistente = enfermedadesExistentes.find(e => 
      e.estado === 'activo' && e.nombre.toLowerCase() === enfermedad.nombre.trim().toLowerCase()
    );

    if (enfermedadExistente) {
      throw new Error('Ya existe una enfermedad activa con ese nombre');
    }

    // Establecer valores por defecto
    const nuevaEnfermedad: Enfermedades = {
      ...enfermedad,
      nombre: enfermedad.nombre.trim(),
      estado: enfermedad.estado || 'activo',
      fecha_creacion: new Date()
    };

    return await this.enfermedadesPort.create(nuevaEnfermedad);
  }

  async getEnfermedadById(id: number): Promise<Enfermedades | null> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }

    return await this.enfermedadesPort.findById(id);
  }

  async getEnfermedadesByNombre(nombre: string): Promise<Enfermedades[]> {
    if (!nombre || nombre.trim().length === 0) {
      throw new Error('El nombre es requerido para la búsqueda');
    }

    return await this.enfermedadesPort.findByNombre(nombre.trim());
  }

  async getEnfermedadesByCategoria(categoria: string): Promise<Enfermedades[]> {
    if (!categoria || categoria.trim().length === 0) {
      throw new Error('La categoría es requerida para la búsqueda');
    }

    return await this.enfermedadesPort.findByCategoria(categoria.trim());
  }

  async getEnfermedadesByEstado(estado: string): Promise<Enfermedades[]> {
    if (!estado) {
      throw new Error('El estado es requerido para la búsqueda');
    }

    const estadosValidos = ['activo', 'inactivo'];
    if (!estadosValidos.includes(estado)) {
      throw new Error('El estado debe ser activo o inactivo');
    }

    return await this.enfermedadesPort.findByEstado(estado);
  }

  async updateEnfermedad(id: number, enfermedad: Partial<Enfermedades>): Promise<Enfermedades | null> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }

    // Validar que la enfermedad existe
    const enfermedadExistente = await this.enfermedadesPort.findById(id);
    if (!enfermedadExistente) {
      throw new Error('La enfermedad no existe');
    }

    // Validaciones para campos que se van a actualizar
    if (enfermedad.nombre) {
      if (enfermedad.nombre.trim().length === 0) {
        throw new Error('El nombre de la enfermedad no puede estar vacío');
      }
      if (enfermedad.nombre.length > 255) {
        throw new Error('El nombre de la enfermedad no puede exceder 255 caracteres');
      }

      // Validar que no exista otra enfermedad activa con el mismo nombre
      const enfermedadesExistentes = await this.enfermedadesPort.findByNombre(enfermedad.nombre!.trim());
      const enfermedadConMismoNombre = enfermedadesExistentes.find(e => 
        e.id_enfermedad !== id && e.estado === 'activo' && 
        e.nombre.toLowerCase() === enfermedad.nombre!.trim().toLowerCase()
      );

      if (enfermedadConMismoNombre) {
        throw new Error('Ya existe otra enfermedad activa con ese nombre');
      }
    }

    if (enfermedad.categoria && enfermedad.categoria.length > 100) {
      throw new Error('La categoría no puede exceder 100 caracteres');
    }

    if (enfermedad.estado) {
      const estadosValidos = ['activo', 'inactivo'];
      if (!estadosValidos.includes(enfermedad.estado)) {
        throw new Error('El estado debe ser activo o inactivo');
      }
    }

    return await this.enfermedadesPort.update(id, enfermedad);
  }

  async deleteEnfermedad(id: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error('El ID debe ser un número mayor a 0');
    }

    // Validar que la enfermedad existe
    const enfermedadExistente = await this.enfermedadesPort.findById(id);
    if (!enfermedadExistente) {
      throw new Error('La enfermedad no existe');
    }

    return await this.enfermedadesPort.delete(id);
  }

  async getAllEnfermedades(): Promise<Enfermedades[]> {
    return await this.enfermedadesPort.findAll();
  }
} 