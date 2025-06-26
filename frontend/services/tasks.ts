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

const getCompletedTasksByPatient = async (patientId: number) => {
    try {
        const response = await api.get(`/historial-tareas/paciente/${patientId}`);
        // El backend devuelve { success: true, data: [...] }
        return response.data || [];
    } catch (error) {
        console.error('Error fetching completed tasks by patient:', error);
        return [];
    }
};

export const tasksService = {
    getTasks,
    completeTask,
    getCompletedTasksByPatient,
};

// --- TAREAS PACIENTE ---

export interface TareaPaciente {
    id_tarea_paciente: number;
    paciente: any;
    tarea: any;
    nombre_tarea: string;
    descripcion: string;
    diagnostico: string;
    recomendacion: string;
    estado: string;
    fecha_asignacion: string;
    fecha_completada?: string;
}

const asignarTareaAPaciente = async (data: Record<string, any>) => {
    const res = await api.post('/tareas-paciente', data);
    return res;
};

const getTareasPorPaciente = async (pacienteId: number): Promise<TareaPaciente[]> => {
    const res = await api.get(`/tareas-paciente/${pacienteId}`);
    return res;
};

const marcarTareaComoCompletada = async (id_tarea_paciente: number) => {
    return await api.put(`/tareas-paciente/${id_tarea_paciente}/completar`, {});
};

export const tareasPacienteService = {
    asignarTareaAPaciente,
    getTareasPorPaciente,
    marcarTareaComoCompletada,
}; 