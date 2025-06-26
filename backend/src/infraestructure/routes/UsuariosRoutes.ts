import { Router } from 'express';
import { UsuariosAdapter } from '../adapter/UsuariosAdapter';
import { UsuariosApplicationService } from '../../application/UsuariosApplicationService';
import { UsuariosController } from '../controller/UsuariosController';
import { authenticateToken } from '../web/authMiddleware';
import { PacientesAdapter } from '../adapter/PacientesAdapter';
import { MedicoAdapter } from '../adapter/MedicoAdapter';
import { AdministradoresAdapter } from '../adapter/AdministradoresAdapter';
import { AdministradoresApplicationService } from '../../application/AdministradoresApplicationService';

const router = Router();

//inicializacion de las capas 
const usuariosAdapter = new UsuariosAdapter();
const pacientesAdapter = new PacientesAdapter();
const medicoAdapter = new MedicoAdapter();
const administradoresAdapter = new AdministradoresAdapter();
const administradoresAppService = new AdministradoresApplicationService(administradoresAdapter, usuariosAdapter);
const usuariosAppService = new UsuariosApplicationService(usuariosAdapter, pacientesAdapter, medicoAdapter, administradoresAppService);
const usuariosController = new UsuariosController(usuariosAppService);

//definir las rutas con manejo de errores 

router.post("/login", async (req, res) => {
    await usuariosController.login(req, res);
});

router.post("/usuario", async (req, res) => {
    try {
        await usuariosController.createUsuario(req, res);
    } catch (error) {
        res.status(400).json({message: "Error en la creacion del usuario", error});
    }
});

// New route for complete registration (user + role profile)
router.post("/register", async (req, res) => {
    try {
        await usuariosController.completeRegistration(req, res);
    } catch (error) {
        res.status(400).json({message: "Error en el registro completo", error});
    }
});

router.get("/usuarios", authenticateToken, async(req, res) => {
    try {
        await usuariosController.getAllUsuarios(req, res);
    } catch (error) {
        res.status(400).json({message: "Error al obtener los usuarios", error});  
    }
});

router.get('/usuario/:id', authenticateToken, async (req, res) => {
    try {
        await usuariosController.getUsuarioById(req, res);
    } catch (error) {
        res.status(400).json({message: "Error al obtener el usuario por ID", error});
    }
});

router.get('/usuario/correo/:correo', authenticateToken, async (req, res) => {
    try {
        await usuariosController.getUsuarioByCorreo(req, res);   
    } catch (error) {
        res.status(400).json({message: "Error al obtener el usuario por correo", error});
    }
});

router.put('/usuario/:id', authenticateToken, async (req, res) => {
    try {
        await usuariosController.updateUsuario(req, res);
    } catch (error) {
        res.status(400).json({message: "Error al actualizar el usuario", error});
    }
});

router.delete('/usuario/:id', authenticateToken, async (req, res) => {
    try {
        await usuariosController.deleteUsuario(req, res);
    } catch (error) {
        res.status(400).json({message: "Error al eliminar el usuario", error});
    }
});

export default router; 