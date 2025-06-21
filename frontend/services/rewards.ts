import { api } from './api';

export interface Reward {
  id_recompensa: number;
  nombre: string;
  descripcion: string;
  puntos_necesarios: number;
  proveedor: {
    id_eps: number;
    nombre: string;
  };
  estado: string;
  fecha_creacion: string;
}

export const rewardsService = {
  getRewards: async (): Promise<Reward[]> => {
    try {
      const response = await api.get('/recompensas');
      return response;
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
      throw new Error('No se pudieron obtener las recompensas.');
    }
  },
  
  getAvailableRewards: async (): Promise<Reward[]> => {
    try {
      const response = await api.get('/recompensas/disponibles');
      return response;
    } catch (error) {
      console.error('Failed to fetch available rewards:', error);
      throw new Error('No se pudieron obtener las recompensas disponibles.');
    }
  },
}; 