import { Router } from 'express';
import { UsuariosAdapter } from '../adapter/UsuariosAdapter';
import { UsuariosApplicationService } from '../../application/UsuariosApplicationService';
import { UsuariosController } from '../controller/UsuariosController';

const router = Router();

//inicializacion de las capas 
const usuariosAdapter = new UsuariosAdapter();
const usuariosAppService = new UsuariosApplicationService(usuariosAdapter);
const usuariosController = new UsuariosController(usuariosAppService);

//definir las rutas con manejo de errores 

router.post("/usuario", async (req, res) => {
    try {
        await usuariosController.createUsuario(req, res);
    } catch (error) {
        res.status(400).json({message: "Error en la creacion del usuario", error});
    }
});

router.get("/usuarios", async(req, res) => {
    try {
        await usuariosController.getAllUsuarios(req, res);
    } catch (error) {
        res.status(400).json({message: "Error al obtener los usuarios", error});  
    }
});

router.get('/usuario/:id', async (req, res) => {
    try {
        await usuariosController.getUsuarioById(req, res);
    } catch (error) {
        res.status(400).json({message: "Error al obtener el usuario por ID", error});
    }
});

router.get('/usuario/correo/:correo', async (req, res) => {
    try {
        await usuariosController.getUsuarioByCorreo(req, res);   
    } catch (error) {
        res.status(400).json({message: "Error al obtener el usuario por correo", error});
    }
});

router.put('/usuario/:id', async (req, res) => {
    try {
        await usuariosController.updateUsuario(req, res);
    } catch (error) {
        res.status(400).json({message: "Error al actualizar el usuario", error});
    }
});

router.delete('/usuario/:id', async (req, res) => {
    try {
        await usuariosController.deleteUsuario(req, res);
    } catch (error) {
        res.status(400).json({message: "Error al eliminar el usuario", error});
    }
});

export default router; 