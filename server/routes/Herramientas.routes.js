import express from "express";
import authMiddleware from "../middleware/auth.js";
import authorizeRoles from "../middleware/authorization.middleware.js";

import { 
    createHerramientas,
    getHerramientas,
    getHerramientasById,
    updateHerramientas,
    deleteHerramientas
} from "../controllers/Herramientas.controller.js";  

const router = express.Router();

// RUTAS DE LECTURA - Acceso: admin y voluntario
router.get("/", [authMiddleware, authorizeRoles('admin', 'voluntario')], getHerramientas);
router.get("/:id", [authMiddleware, authorizeRoles('admin', 'voluntario')], getHerramientasById);

// RUTAS DE ESCRITURA - Acceso: solo admin
router.post("/", [authMiddleware, authorizeRoles('admin')], createHerramientas);
router.put("/:id", [authMiddleware, authorizeRoles('admin')], updateHerramientas);
router.delete("/:id", [authMiddleware, authorizeRoles('admin')], deleteHerramientas);

export default router;