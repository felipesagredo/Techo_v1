"use strict";
import {
    createHerramientasService,
    deleteHerramientasService,
    getHerramientasService,
    getHerramientasByIdService,
    updateHerramientasService,
}from "../services/Herramientas.service.js";

import {
    herramientaBodyValidation,
    herramientaIdValidation,
    herramientaqueryValidation
}from "../validations/Herramientas.validations.js";

import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess
    } from "../handlers/responseHandlers.js";


export async function createHerramientas(req, res) {
    try {
        const body = req.body;
        const user = req.user;

        await herramientaBodyValidation.validateAsync(body);

        const herramientaData = {
            nombre: body.nombre,
            descripcion: body.descripcion,
            stock: body.stock,
            categoria_herramienta: body.categoria_herramienta
        };
        const newHerramienta = await createHerramientasService(herramientaData);
        handleSuccess(res, 201, "Herramienta creada/agregada exitosamente", newHerramienta);
    } catch (error){
        console.error("Error crear herramienta:", error.message);
        handleErrorClient(res, 500, error.message || "Error creando/agregando la herramienta", error);
    }
};

export async function getHerramientas(req, res) {
    try{
        const { user } = req;
        const query = req.query;

        if(!user || !user.role_id || !user.id){
            return handleErrorClient(res, 400, "Token invalido: falta la informacion del usuario");
        }

        await herramientaqueryValidation.validateAsync(query);
        const herramientas = await getHerramientasService();
        handleSuccess(res, 200, "Herramientas obtenidas exitosamente", herramientas);
    } catch (error){
        handleErrorClient(res, 500, "Error al obtener las herramientas", error);
    }
};    

export async function getHerramientasById(req, res) {
    try {
        const { id } = req.params;
        await herramientaIdValidation.validateAsync({ id });

        const herramienta = await getHerramientasByIdService(id);
        if (!herramienta) {
            return handleErrorClient(res, 404, "Herramienta no encontrada");
        }
        handleSuccess(res, 200, "Herramienta obtenida exitosamente", herramienta);
    } catch (error) {
        handleErrorClient(res, 500, "Error al obtener la herramienta", error);
    }
};

export async function updateHerramientas(req, res) {
    try {
        const { id } = req.params;
        const body = req.body;
        await herramientaIdValidation.validateAsync({ id });

        const updatedHerramienta = await updateHerramientasService(id, body);
        if (!updatedHerramienta) {
            return handleErrorClient(res, 404, "Herramienta no encontrada");
        }
        handleSuccess(res, 200, "Herramienta actualizada exitosamente", updatedHerramienta);
    } catch (error) {
        handleErrorClient(res, 500, "Error al actualizar la herramienta", error);
    }
};

export async function deleteHerramientas(req, res) {
    try {
        const { id } = req.params;
        await herramientaIdValidation.validateAsync({ id });
        const deleted = await deleteHerramientasService(id);
        if (!deleted) {
            return handleErrorClient(res, 404, "Herramienta no encontrada");
        }
        handleSuccess(res, 200, "Herramienta eliminada exitosamente", deleted);
    } catch (error) {
        handleErrorClient(res, 500, "Error eliminando la herramienta", error);
    }   
};