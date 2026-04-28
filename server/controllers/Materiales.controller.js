"use strict";

import {
    createMaterialesService,
    deleteMaterialService, 
    getMaterialesService,
    getMaterialesByIdService,
}from "../services/Materiales.service.js";



import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess
}from "../handlers/responseHandlers.js"

export async function createMateriales(req, res) {
    try{
        const { body, user} = req;
        const materialData = {
            ...body,
            assigned_to: user.id,
            estado: "Disponible",
            archivos: null
        };
        const newMaterial = await createMaterialesService(materialData);
        handleSuccess(res, 201, "Material creado/agregado existosamente");
    } catch (error) {
        handleErr(res, 500, "Error creando/agregando materiales");
    }
};

export async function getMateriales(req, res) {
    try{
        const { user, query} = res;

        if (!user || user.rol || user.id){
            return handleErrorClient(res, 400, "Token invalido, falta la informacion del usuario");
        } 
        await materialesqueryValidation.validateAsync(query);
        handleSuccess(res, 200, "Materiales obtenidos correctamente");
    } catch (error){
        handleErrorClient(res, 500, "Error al obtener los materiales");
    }
};

