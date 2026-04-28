"use strict";
import joi from "joi";

export const materialBodyValidation = joi.object({
    nombre_material: joi.string().max(30).required(),
    cantidad: joi.number().integer().positive().required(),
    categoria: joi.string().max(40).required(),
    largo: joi.number().positive().optional(),
    ancho: joi.number().positive().optional(),
    peso: joi.number().positive().required()
});

export const materialIdValidation = joi.object({
    id: joi.number().integer().positive().required()
});

export const materialQueryValidation = joi.object({
    categoria: joi.string().max(40).optional(),
    assigned_to: joi.number().integer().positive().optional()
    
});


