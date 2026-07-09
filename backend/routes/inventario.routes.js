"use strict";
import express from "express";
import authMiddleware from "../middleware/auth.js";
import authorizeRoles from "../middleware/authorization.middleware.js";
import {
    postLlegadaStockManual,
    postLlegadaLoteKit
} from "../controllers/inventarioController.js";

const router = express.Router();

router.post("/llegada-manual", [authMiddleware, authorizeRoles('admin')], postLlegadaStockManual);
router.post("/llegada-lote-kit", [authMiddleware, authorizeRoles('admin')], postLlegadaLoteKit);

export default router;
