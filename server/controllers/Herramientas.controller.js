"use strict";
import {
    createHerramientasService,
    deleteHerramientasService,
    getHerramientasService,
    getHerramientasByIdService,
    updateHerramientasService,
}from "../services/Herramientas.services.js";

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
        const { body, user } = req;

        const herramientaData = {
            ...body,
            assigned_to: user.id,
            estado: "Disponible", 
            archivos: null
        };
        await herramientaBodyValidation.validateAsync(herramientaData);
        const newHerramienta = await createHerramientasService(herramientas);
        handleSuccess(res, 201, "Herramienta creada/agregada exitosamente", newHerramienta);
    } catch (error){
        handleErrorClient(res, 500, "Error creando/agregando la herramienta", error);
    }
};

export async function getHerramientas(req, res) {
    try{
        const { user, query} = res;

        if(!user || !user.rol || user.id){
            return handleErrorClient(res, 400, "Token invalido: falta la informacion del usuario");
        }

        await herramientaqueryValidation.validateAsync(query);
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
        const { body, user } = req;
        await herramientaBodyValidation.validateAsync({ id });

        const updatedHerramienta = await updateHerramientasService(id, body);
        handleSuccess(res, 200, "Herramienta actualizada exitosamente", updatedHerramienta);
    } catch (error) {
        handleErrorClient(res, 500, "Error actualizando la herramienta", error);
    }
};

export async function deleteHerramientas(req, res) {
    try {
        const { id } = req.params;
        await herramientaIdValidation.validateAsync({ id });
        const deletedHerramienta = await deleteHerramientasService(id);
        handleSuccess(res, 200, "Herramienta eliminada exitosamente", deletedHerramienta);
    } catch (error) {
        handleErrorClient(res, 500, "Error eliminando la herramienta", error);
    }
};