import { Router } from 'express';
import { UserAdapter } from '../adapter/UsersAdapter';
import { UserApplicationService } from '../../application/UsersAplicationService';
import { UserController } from '../controller/UsersController';

const router = Router();

//inicializacion de las capas 
const userAdapter = new UserAdapter();
const userAppService = new UserApplicationService(userAdapter);
const userController = new UserController(userAppService);

//definir las rutas con manejo de errores 

router.post("/user", async (req, res) => {
    try {
        await userController.createUser(req, res);
    } catch (error) {
        res.status(400).json({message: "Error en la creacion del usuario",error});
    }
});

router.get("/users",async(req,res)=>{
    try {
        await userController.getAllUsers(req, res);
    } catch (error) {
        res.status(400).json({message: "Error al obtener los usuarios", error});  
    }
});

router.get('/user/:id', async (req, res) => {
    try {
        await userController.getUserById(req, res);
    } catch (error) {
        res.status(400).json({message: "Error al obtener el usuario por ID", error});
    }
});

router.get('/user/email/:email', async (req, res) => {
    try {
        await userController.getUserByEmail(req, res);   
    } catch (error) {
        res.status(400).json({message: "Error al obtener el usuario por email", error});
    }
});

router.put('/user/:id', async (req, res) => {
    try {
        await userController.updateUser(req, res);
    } catch (error) {
        res.status(400).json({message: "Error al actualizar el usuario", error});
    }
});

router.delete('/user/:id', async (req, res) => {
    try {
        await userController.deleteUser(req, res);
    } catch (error) {
        res.status(400).json({message: "Error al eliminar el usuario", error});
    }
});

export default router;
