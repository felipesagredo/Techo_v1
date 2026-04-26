"use strict";
import router from "express";

import { 
    createHerramientas,
    getHerramientas,
    getHerramientasById,
    updateHerramientas,
    deleteHerramientas
}from "../controllers/Herramientas.controller.js";  

const router = router();

router.post("/", createHerramientas);
router.get("/", getHerramientas);
router.get("/:id", getHerramientasById);
router.put("/:id", updateHerramientas);
router.delete("/:id", deleteHerramientas);

export default router;