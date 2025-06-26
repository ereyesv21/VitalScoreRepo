import {Request, Response,NextFunction } from "express";
import { AuthService } from "../../application/AuthService";


export function authenticateToken(req:Request, res:Response, next:NextFunction):void{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token){
        res.status(401).json({error:"Token requerido"});
        return;
    }

    console.log("Token recibido:", token);
    try{
        const payload = AuthService.verifyToken(token);
        console.log('[authMiddleware] Payload decodificado del token:', payload);
        (req as any).user = payload;
        next();
    }catch(error){
        console.error("Error verificando token:", error);
        res.status(403).json({error: "Token invalido o ya expiro"});
    }
}