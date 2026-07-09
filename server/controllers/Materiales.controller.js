"use strict";

import {
    createMaterialesService,
    deleteMaterialService, 
    getMaterialesService,
    getMaterialesByIdService,
    updateMaterialesService
}from "../services/Materiales.service.js";

import {
    materialBodyValidation,
    materialIdValidation
}from "../validations/Materiales.validations.js";

import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess
}from "../handlers/responseHandlers.js"

export async function createMateriales(req, res) {
    try{
        const body = req.body;
        
        await materialBodyValidation.validateAsync(body);
        
        const materialData = {
            nombre_material: body.nombre_material,
            cantidad: body.cantidad,
            categoria: body.categoria,
            largo: body.largo,
            ancho: body.ancho,
            peso: body.peso
        };
        const newMaterial = await createMaterialesService(materialData);
        handleSuccess(res, 201, "Material creado/agregado exitosamente", newMaterial);
    } catch (error) {
        console.error("Error crear material:", error.message);
        handleErrorClient(res, 500, error.message || "Error creando/agregando materiales", error);
    }
};

export async function getMateriales(req, res) {
    try{
        const materiales = await getMaterialesService();
        handleSuccess(res, 200, "Materiales obtenidos correctamente", materiales);
    } catch (error){
        handleErrorClient(res, 500, error.message || "Error al obtener los materiales", error);
    }
};

export async function getMaterialesById(req, res) {
    try{
        const { id } = req.params;
        await materialIdValidation.validateAsync({ id });
        
        const material = await getMaterialesByIdService(id);
        if (!material) {
            return handleErrorClient(res, 404, "Material no encontrado");
        }
        handleSuccess(res, 200, "Material obtenido correctamente", material);
    } catch (error) {
        handleErrorClient(res, 500, error.message || "Error al obtener el material", error);
    }
};

export async function updateMateriales(req, res) {
    try {
        const { id } = req.params;
        const body = req.body;
        await materialIdValidation.validateAsync({ id });

        const updatedMaterial = await updateMaterialesService(id, body);
        handleSuccess(res, 200, "Material actualizado correctamente", updatedMaterial);
    } catch (error) {
        handleErrorClient(res, 500, error.message || "Error al actualizar el material", error);
    }
};

export async function deleteMaterial(req, res) {
    try {
        const { id } = req.params;
        await materialIdValidation.validateAsync({ id });   
        const deletedMaterial = await deleteMaterialService(id);
        handleSuccess(res, 200, "Material eliminado correctamente", deletedMaterial);
    } catch (error) {
        handleErrorClient(res, 500, error.message || "Error al eliminar el material", error);
    }
};
