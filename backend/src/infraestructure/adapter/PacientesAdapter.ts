import { PacientePort } from "../../domain/PacientePort";
import { Paciente as PacienteEntity } from "../entities/Pacientes";
import { Pacientes as PacienteDomain } from "../../domain/Paciente";
import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-base";
import { Usuario } from "../entities/Usuarios";
import { EPS } from "../entities/Eps";

export class PacientesAdapter implements PacientePort {

    private pacienteRepository: Repository<PacienteEntity>;

    constructor() {
        this.pacienteRepository = AppDataSource.getRepository(PacienteEntity);
    }

    // Transforma la entidad de infraestructura al modelo de dominio
    private toDomain(pacienteEntity: PacienteEntity): PacienteDomain {
        return {
            id_paciente: pacienteEntity.id_paciente,
            puntos: pacienteEntity.puntos,
            usuario: pacienteEntity.usuario ? pacienteEntity.usuario.id_usuario : 0,
            id_eps: pacienteEntity.eps ? pacienteEntity.eps.id_eps : 0,
            racha_dias: pacienteEntity.racha_dias,
            ultima_fecha_racha: pacienteEntity.ultima_fecha_racha
        };
    }

    // Transforma la entidad de infraestructura al modelo de dominio con datos completos
    private toDomainWithDetails(pacienteEntity: PacienteEntity): any {
        return {
            id_paciente: pacienteEntity.id_paciente,
            puntos: pacienteEntity.puntos,
            usuario: pacienteEntity.usuario ? pacienteEntity.usuario.id_usuario : 0,
            id_eps: pacienteEntity.eps ? pacienteEntity.eps.id_eps : 0,
            racha_dias: pacienteEntity.racha_dias,
            ultima_fecha_racha: pacienteEntity.ultima_fecha_racha,
            // Incluir datos del usuario
            nombre: pacienteEntity.usuario?.nombre,
            apellido: pacienteEntity.usuario?.apellido,
            correo: pacienteEntity.usuario?.correo,
            genero: pacienteEntity.usuario?.genero,
            estado: pacienteEntity.usuario?.estado,
            // Incluir datos de la EPS
            eps_nombre: pacienteEntity.eps?.nombre,
            // También incluir el objeto completo para compatibilidad
            usuario_data: pacienteEntity.usuario ? {
                id_usuario: pacienteEntity.usuario.id_usuario,
                nombre: pacienteEntity.usuario.nombre,
                apellido: pacienteEntity.usuario.apellido,
                correo: pacienteEntity.usuario.correo,
                genero: pacienteEntity.usuario.genero,
                estado: pacienteEntity.usuario.estado,
                rol: pacienteEntity.usuario.rol
            } : null,
            eps_data: pacienteEntity.eps ? {
                id_eps: pacienteEntity.eps.id_eps,
                nombre: pacienteEntity.eps.nombre,
                tipo: pacienteEntity.eps.tipo,
                estado: pacienteEntity.eps.estado
            } : null
        };
    }

    // Transforma el modelo de dominio a la entidad de infraestructura
    private toEntity(pacienteDomain: Omit<PacienteDomain, "id_paciente">, usuarioEntity: Usuario, epsEntity: EPS): Omit<PacienteEntity, "id_paciente"> {
        const pacienteEntity = new PacienteEntity();
        pacienteEntity.puntos = pacienteDomain.puntos;
        pacienteEntity.usuario = usuarioEntity;
        pacienteEntity.eps = epsEntity;
        return pacienteEntity;
    }

    // Método para corregir la secuencia si es necesario
    private async fixSequenceIfNeeded(): Promise<void> {
        try {
            const queryRunner = this.pacienteRepository.manager.connection.createQueryRunner();
            await queryRunner.connect();
            
            // Obtener el máximo ID actual
            const maxIdResult = await queryRunner.query(
                'SELECT COALESCE(MAX(id_paciente), 0) as max_id FROM "vitalscore"."Pacientes"'
            );
            const maxId = parseInt(maxIdResult[0]?.max_id || '0');
            
            // Corregir la secuencia
            await queryRunner.query(
                `SELECT setval('"vitalscore"."Pacientes_id_paciente_seq"', ${maxId + 1}, false)`
            );
            
            await queryRunner.release();
        } catch (error) {
            console.warn("No se pudo corregir la secuencia automáticamente:", error);
        }
    }

    async createPaciente(paciente: Omit<PacienteDomain, "id_paciente">): Promise<number> {
        try {
            // Intentar corregir la secuencia antes de crear
            await this.fixSequenceIfNeeded();

            // Busca el objeto Usuario por id
            const usuarioRepository = this.pacienteRepository.manager.getRepository(Usuario);
            const usuarioEntity = await usuarioRepository.findOne({ where: { id_usuario: paciente.usuario } });
            if (!usuarioEntity) throw new Error("Usuario no encontrado");

            // Busca el objeto EPS por id
            const epsRepository = this.pacienteRepository.manager.getRepository(EPS);
            const epsEntity = await epsRepository.findOne({ where: { id_eps: paciente.id_eps } });
            if (!epsEntity) throw new Error("EPS no encontrada");

            // Crea el pacienteEntity y asigna los objetos relacionados
            const pacienteEntity = this.toEntity(paciente, usuarioEntity, epsEntity) as PacienteEntity;

            const newPaciente = await this.pacienteRepository.save(pacienteEntity);
            return newPaciente.id_paciente;
        } catch (error) {
            console.error("Error creating paciente:", error);
            throw new Error("Failed to create paciente");
        }
    }

    async updatePaciente(id: number, paciente: Partial<PacienteDomain>): Promise<boolean> {
        try {
            const existingPaciente = await this.pacienteRepository.findOne({ where: { id_paciente: id }, relations: ["usuario", "eps"] });
            if (!existingPaciente) return false;

            // Actualizar solo los campos enviados
            if (paciente.puntos !== undefined) existingPaciente.puntos = paciente.puntos;
            if (paciente.racha_dias !== undefined) existingPaciente.racha_dias = paciente.racha_dias;
            if (paciente.ultima_fecha_racha !== undefined) existingPaciente.ultima_fecha_racha = paciente.ultima_fecha_racha;

            // Si se actualiza el usuario, buscar la nueva entidad
            if (paciente.usuario) {
                const usuarioRepository = this.pacienteRepository.manager.getRepository(Usuario);
                const usuarioEntity = await usuarioRepository.findOne({ where: { id_usuario: paciente.usuario } });
                if (!usuarioEntity) throw new Error("Usuario no encontrado");
                existingPaciente.usuario = usuarioEntity;
            }

            // Si se actualiza la EPS, buscar la nueva entidad
            if (paciente.id_eps) {
                const epsRepository = this.pacienteRepository.manager.getRepository(EPS);
                const epsEntity = await epsRepository.findOne({ where: { id_eps: paciente.id_eps } });
                if (!epsEntity) throw new Error("EPS no encontrada");
                existingPaciente.eps = epsEntity;
            }

            await this.pacienteRepository.save(existingPaciente);
            return true;
        } catch (error) {
            console.error("Error updating paciente:", error);
            throw new Error("Failed to update paciente");
        }
    }

    async deletePaciente(id: number): Promise<boolean> {
        try {
            const existingPaciente = await this.pacienteRepository.findOne({ where: { id_paciente: id } });
            if (!existingPaciente) return false;
            
            // Eliminar físicamente el registro (soft delete no aplica aquí)
            await this.pacienteRepository.remove(existingPaciente);
            return true;
        } catch (error) {
            console.error("Error deleting paciente:", error);
            throw new Error("Failed to delete paciente");
        }
    }

    async getPacienteById(id: number): Promise<PacienteDomain | null> {
        try {
            const paciente = await this.pacienteRepository.findOne({ 
                where: { id_paciente: id }, 
                relations: ["usuario", "eps"] 
            });
            return paciente ? this.toDomainWithDetails(paciente) : null;
        } catch (error) {
            console.error("Error fetching paciente by ID:", error);
            throw new Error("Failed to fetch paciente by ID");
        }
    }

    async getAllPacientes(): Promise<PacienteDomain[]> {
        try {
            const pacientes = await this.pacienteRepository.find({ relations: ["usuario", "eps"] });
            return pacientes.map(paciente => this.toDomain(paciente));
        } catch (error) {
            console.error("Error fetching all pacientes:", error);
            throw new Error("Failed to fetch all pacientes");
        }
    }

    async getPacienteByUsuario(usuario: number): Promise<PacienteDomain | null> {
        try {
            console.log('[PacientesAdapter] Buscando paciente por usuario:', usuario);
            const paciente = await this.pacienteRepository
                .createQueryBuilder("paciente")
                .leftJoinAndSelect("paciente.usuario", "usuario")
                .leftJoinAndSelect("paciente.eps", "eps")
                .where("usuario.id_usuario = :usuarioId", { usuarioId: usuario })
                .getOne();
            console.log('[PacientesAdapter] Resultado paciente para usuario', usuario, ':', paciente);
            if (!paciente) {
                // Log extra: mostrar todos los pacientes y sus usuarios
                const all = await this.pacienteRepository.find({ relations: ["usuario"] });
                console.log('[PacientesAdapter] Todos los pacientes y sus usuarios:', all.map(p => ({ id_paciente: p.id_paciente, usuario: p.usuario })));
            }
            return paciente ? this.toDomain(paciente) : null;
        } catch (error) {
            console.error("Error fetching paciente by usuario:", error);
            throw new Error("Failed to fetch paciente by usuario");
        }
    }

    async getPacienteByEps(eps: number): Promise<PacienteDomain[]> {
        try {
            const pacientes = await this.pacienteRepository
                .createQueryBuilder("paciente")
                .leftJoinAndSelect("paciente.usuario", "usuario")
                .leftJoinAndSelect("paciente.eps", "eps")
                .where("eps.id_eps = :epsId", { epsId: eps })
                .getMany();
            
            return pacientes.map(paciente => this.toDomain(paciente));
        } catch (error) {
            console.error("Error fetching pacientes by EPS:", error);
            throw new Error("Failed to fetch pacientes by EPS");
        }
    }

    async getPacientesByPuntos(puntos: number): Promise<PacienteDomain[]> {
        try {
            const pacientes = await this.pacienteRepository.find({ 
                where: { puntos: puntos }, 
                relations: ["usuario", "eps"] 
            });
            return pacientes.map(paciente => this.toDomain(paciente));
        } catch (error) {
            console.error("Error fetching pacientes by puntos:", error);
            throw new Error("Failed to fetch pacientes by puntos");
        }
    }
}
