"use strict";
import joi from "joi";

export const herramientaBodyValidation = joi.object({
    nombre: joi.string().max(100).required(),
    descripcion: joi.string().max(500).required(),
    stock: joi.number().integer().positive().required(),
    categoria_herramienta: joi.string().valid("manual", "electrica").required(),
}).unknown(false);

export const herramientaIdValidation = joi.object({
    id: joi.number().integer().positive().required()
});

export const herramientaqueryValidation = joi.object({
    assigned_to: joi.number().integer().positive().optional(),
    categoria_herramienta: joi.string().valid("manual", "electrica").optional()
});


