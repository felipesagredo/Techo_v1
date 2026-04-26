"use strict";
import joi from "joi";

export const herramientaBodyValidation = joi.object({
    nombre: joi.string().max(100).required(),
    descripcion: joi.string().max(500).required()
});

export const herramientaIdValidation = joi.object({
    id: joi.number().integer().positive().required()
});

export const herramientaqueryValidation = joi.object({
    estado: joi.string().valid("Disponible", "En uso").optional(),
    assigned_to: joi.number().integer().positive().optional()
});


