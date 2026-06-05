"use strict";
import express from "express";
import authMiddleware from "../middleware/auth.js";
import authorizeRoles from "../middleware/authorization.middleware.js";
import { 
    createMateriales,
    getMateriales,
    getMaterialesById,
    updateMateriales,
    deleteMaterial
} from "../controllers/Materiales.controller.js";

const router = express.Router();

// RUTAS DE LECTURA - Acceso: admin y voluntario
router.get("/", [authMiddleware, authorizeRoles('admin', 'voluntario')], getMateriales);
router.get("/:id", [authMiddleware, authorizeRoles('admin', 'voluntario')], getMaterialesById);

// RUTAS DE ESCRITURA - Acceso: solo admin
router.post("/", [authMiddleware, authorizeRoles('admin')], createMateriales);
router.put("/:id", [authMiddleware, authorizeRoles('admin')], updateMateriales);
router.delete("/:id", [authMiddleware, authorizeRoles('admin')], deleteMaterial);

export default router;