import { api } from './api';

export interface Task {
    id_tarea: number;
    plan: number;
    nombre_tarea: string;
    descripcion: string;
    fecha_inicio: string; // Las fechas se reciben como strings
    fecha_fin: string;
    estado: string;
}

const getTasks = async (): Promise<Task[]> => {
    try {
        const tasks = await api.get('/tareas');
        return tasks as Task[];
    } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
    }
};

const completeTask = async (taskId: number): Promise<any> => {
    try {
        const response = await api.put(`/tarea/${taskId}`, { estado: 'completada' });
        return response;
    } catch (error) {
        console.error(`Error completing task ${taskId}:`, error);
        throw error;
    }
};

export const tasksService = {
    getTasks,
    completeTask,
}; 