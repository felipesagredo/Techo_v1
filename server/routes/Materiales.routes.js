"use strict";
import router from "express";

import { 
    createMateriales,
    getMateriales,
    getMaterialesById,
    updateMateriales,
    deleteMateriales
}from "../controllers/Materiales.controller.js";

const router = router();

router.post("/", createMateriales);
router.get("/", getMateriales);
router.get("/:id", getMaterialesById);
router.put("/:id", updateMateriales);
router.delete("/:id", deleteMateriales);

export default router;