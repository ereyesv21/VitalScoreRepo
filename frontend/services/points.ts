import { api } from './api';

export const pointsService = {
  asignarPuntos: async ({ paciente, puntos, descripcion, fecha_registro = new Date().toISOString() }: {
    paciente: number;
    puntos: number;
    descripcion: string;
    fecha_registro?: string;
  }) => {
    return api.post('/historial', {
      paciente,
      puntos,
      descripcion,
      fecha_registro,
    });
  },
}; 