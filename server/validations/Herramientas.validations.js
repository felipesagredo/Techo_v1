"use strict";
import joi from "joi";

export const herramientaBodyValidation = joi.object({
    description: joi.string().max(500).required().min(10).messages({
        "string.empty": "La descripcion no puede estar vacia",
        "string.base": "La descripcion debe ser del tipo string",
        "string.min": "La descripcion debe tener al menos 10 caracteres",
        "string.max": "La descripcion no puede exceder los 500 caracteres"
    }),
    id: joi.number().required().messages({
        "number.base": "El ID de la herramienta debe ser un numero",
        "numero.empty": "El ID de la herramienta no puede estar vacío"
    }),
    stock: joi.number().required().messages({
        "number.base": "El stock de la herramienta debe ser un numero"
    }),
    asigned_to: joi.string().max(30).optional().allow(null, " ").messages({
        "string.base": "El campo de asignacion de herramientas debe ser del tipo string",
        "string.max": "El campo de asignacion no puede exceder los 30 caracteres"
    }),
    nombre: joi.string().max(30).required().min(3).messages({
        "string.empty": "El nombre de la herramienta no puede estar vacio",
        "string.base": "El nombre de la herramienta debe ser del tipo string",
        "string.min": "El nombre de la herramienta debe tener al menos 3 caracteres",
        "string.max": "El nombre de la herramienta no puede exceder los 30 caracteres"
    }),
})