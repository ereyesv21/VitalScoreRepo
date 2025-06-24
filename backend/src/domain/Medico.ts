export interface Medicos {
    id_medico: number;
    especialidad: number;
    usuario: number;  // Llave foránea a Usuarios
    eps: number;      // Llave foránea a EPS
} 