import { MedicoPort } from "../../domain/MedicoPort";
import { Medico as MedicoEntity } from "../entities/Medico";
import { Medicos as MedicoDomain } from "../../domain/Medico";
import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-base";
import { Usuario } from "../entities/Usuarios";
import { EPS } from "../entities/Eps";
import { Especialidades } from "../entities/Especialidades";

export class MedicoAdapter implements MedicoPort {

    private medicoRepository: Repository<MedicoEntity>;

    constructor() {
        this.medicoRepository = AppDataSource.getRepository(MedicoEntity);
    }

    // Transforma la entidad de infraestructura al modelo de dominio
    private toDomain(medicoEntity: MedicoEntity): MedicoDomain {
        return {
            id_medico: medicoEntity.id_medico,
            especialidad: medicoEntity.id_especialidad ? medicoEntity.id_especialidad.id_especialidad : 0,
            usuario: medicoEntity.usuario ? medicoEntity.usuario.id_usuario : 0,
            eps: medicoEntity.eps ? medicoEntity.eps.id_eps : 0
        };
    }

    // Transforma el modelo de dominio a la entidad de infraestructura
    private toEntity(medicoDomain: Omit<MedicoDomain, "id_medico">, usuarioEntity: Usuario, epsEntity: EPS, especialidadEntity: Especialidades): Omit<MedicoEntity, "id_medico"> {
        const medicoEntity = new MedicoEntity();
        medicoEntity.id_especialidad = especialidadEntity;
        medicoEntity.usuario = usuarioEntity;
        medicoEntity.eps = epsEntity;
        return medicoEntity;
    }

    // Método para corregir la secuencia si es necesario
    private async fixSequenceIfNeeded(): Promise<void> {
        try {
            const queryRunner = this.medicoRepository.manager.connection.createQueryRunner();
            await queryRunner.connect();
            
            // Obtener el máximo ID actual
            const maxIdResult = await queryRunner.query(
                'SELECT COALESCE(MAX(id_medico), 0) as max_id FROM "vitalscore"."Medicos"'
            );
            const maxId = parseInt(maxIdResult[0]?.max_id || '0');
            
            // Corregir la secuencia
            await queryRunner.query(
                `SELECT setval('"vitalscore"."Medicos_id_medico_seq"', ${maxId + 1}, false)`
            );
            
            await queryRunner.release();
        } catch (error) {
            console.warn("No se pudo corregir la secuencia automáticamente:", error);
        }
    }

    async createMedico(medico: Omit<MedicoDomain, "id_medico">): Promise<number> {
        try {
            // Intentar corregir la secuencia antes de crear
            await this.fixSequenceIfNeeded();

            // Busca el objeto Usuario por id
            const usuarioRepository = this.medicoRepository.manager.getRepository(Usuario);
            const usuarioEntity = await usuarioRepository.findOne({ where: { id_usuario: medico.usuario } });
            if (!usuarioEntity) throw new Error("Usuario no encontrado");

            // Busca el objeto EPS por id
            const epsRepository = this.medicoRepository.manager.getRepository(EPS);
            const epsEntity = await epsRepository.findOne({ where: { id_eps: medico.eps } });
            if (!epsEntity) throw new Error("EPS no encontrada");

            // Busca el objeto Especialidades por id (asegura que sea number)
            const especialidadRepository = this.medicoRepository.manager.getRepository(Especialidades);
            const especialidadId = Number(medico.especialidad);
            const especialidadEntity = await especialidadRepository.findOne({ where: { id_especialidad: especialidadId } });
            if (!especialidadEntity) throw new Error("Especialidad no encontrada");

            // Crea el medicoEntity y asigna los objetos relacionados
            const medicoEntity = this.toEntity(medico, usuarioEntity, epsEntity, especialidadEntity) as MedicoEntity;

            const newMedico = await this.medicoRepository.save(medicoEntity);
            return newMedico.id_medico;
        } catch (error) {
            console.error("Error creating medico:", error);
            throw new Error("Failed to create medico");
        }
    }

    async updateMedico(id: number, medico: Partial<MedicoDomain>): Promise<boolean> {
        try {
            const existingMedico = await this.medicoRepository.findOne({ where: { id_medico: id }, relations: ["usuario", "eps", "id_especialidad"] });
            if (!existingMedico) return false;

            // Actualizar solo los campos enviados
            if (medico.especialidad) {
                const especialidadRepository = this.medicoRepository.manager.getRepository(Especialidades);
                const especialidadId = Number(medico.especialidad);
                const especialidadEntity = await especialidadRepository.findOne({ where: { id_especialidad: especialidadId } });
                if (!especialidadEntity) throw new Error("Especialidad no encontrada");
                existingMedico.id_especialidad = especialidadEntity;
            }

            // Si se actualiza el usuario, buscar la nueva entidad
            if (medico.usuario) {
                const usuarioRepository = this.medicoRepository.manager.getRepository(Usuario);
                const usuarioEntity = await usuarioRepository.findOne({ where: { id_usuario: medico.usuario } });
                if (!usuarioEntity) throw new Error("Usuario no encontrado");
                existingMedico.usuario = usuarioEntity;
            }

            // Si se actualiza la EPS, buscar la nueva entidad
            if (medico.eps) {
                const epsRepository = this.medicoRepository.manager.getRepository(EPS);
                const epsEntity = await epsRepository.findOne({ where: { id_eps: medico.eps } });
                if (!epsEntity) throw new Error("EPS no encontrada");
                existingMedico.eps = epsEntity;
            }

            await this.medicoRepository.save(existingMedico);
            return true;
        } catch (error) {
            console.error("Error updating medico:", error);
            throw new Error("Failed to update medico");
        }
    }

    async deleteMedico(id: number): Promise<boolean> {
        try {
            const existingMedico = await this.medicoRepository.findOne({ where: { id_medico: id } });
            if (!existingMedico) return false;
            
            // Eliminar físicamente el registro (soft delete no aplica aquí)
            await this.medicoRepository.remove(existingMedico);
            return true;
        } catch (error) {
            console.error("Error deleting medico:", error);
            throw new Error("Failed to delete medico");
        }
    }

    async getMedicoById(id: number): Promise<MedicoDomain | null> {
        try {
            const medico = await this.medicoRepository.findOne({ 
                where: { id_medico: id }, 
                relations: ["usuario", "eps"] 
            });
            return medico ? this.toDomain(medico) : null;
        } catch (error) {
            console.error("Error fetching medico by ID:", error);
            throw new Error("Failed to fetch medico by ID");
        }
    }

    async getAllMedicos(): Promise<MedicoDomain[]> {
        try {
            const medicos = await this.medicoRepository.find({ relations: ["usuario", "eps"] });
            return medicos.map(medico => this.toDomain(medico));
        } catch (error) {
            console.error("Error fetching all medicos:", error);
            throw new Error("Failed to fetch all medicos");
        }
    }

    async getMedicoByEspecialidad(especialidad: number): Promise<MedicoDomain[]> {
        try {
            const medicos = await this.medicoRepository.find({ 
                where: { id_especialidad: { id_especialidad: especialidad } }, 
                relations: ["usuario", "eps", "id_especialidad"] 
            });
            return medicos.map(medico => this.toDomain(medico));
        } catch (error) {
            console.error("Error fetching medicos by especialidad:", error);
            throw new Error("Failed to fetch medicos by especialidad");
        }
    }

    async getMedicoByUsuario(usuario: number): Promise<MedicoDomain | null> {
        try {
            const medico = await this.medicoRepository.findOne({ 
                where: { usuario: { id_usuario: usuario } }, 
                relations: ["usuario", "eps"] 
            });
            return medico ? this.toDomain(medico) : null;
        } catch (error) {
            console.error("Error fetching medico by usuario:", error);
            throw new Error("Failed to fetch medico by usuario");
        }
    }

    async getMedicoByEps(eps: number): Promise<MedicoDomain[]> {
        try {
            const medicos = await this.medicoRepository.find({ 
                where: { eps: { id_eps: eps } }, 
                relations: ["usuario", "eps"] 
            });
            return medicos.map(medico => this.toDomain(medico));
        } catch (error) {
            console.error("Error fetching medicos by EPS:", error);
            throw new Error("Failed to fetch medicos by EPS");
        }
    }
}
