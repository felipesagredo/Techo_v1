"use strict"
import AppDataSource from "../config/db.js";
import MaterialesSchema from "../entity/Materiales.entity.js";

export async function createMaterialesService(body){
    try {
        const repository = AppDataSource.getRepository(MaterialesSchema);
        const newMaterial = repository.create(body);
        return await repository.save(newMaterial);
    } catch(error){
        throw new Error(`Error al crear el material: ${error.message}`);
    }
}

export async function getMaterialesService(){
    try {
        const repository = AppDataSource.getRepository(MaterialesSchema);
        return await repository.find();
    } catch(error){
        throw new Error("Error, no se han podido obtener los materiales");
    }
}

export async function getMaterialesByIdService(id){
    try{
        const repository = AppDataSource.getRepository(MaterialesSchema);
        return await repository.findOneBy({ id: parseInt(id, 10) });
    } catch (error) {
        throw new Error("Error al encontrar el material por ID");
    }
}

export async function updateMaterialesService(id, body) {
    try{
        const repository = AppDataSource.getRepository(MaterialesSchema);
        const material = await repository.findOneBy({ id: parseInt(id, 10) });
        if (!material){
            throw new Error("Material no encontrado");
        }
        repository.merge(material, body);
        return await repository.save(material);
    } catch (error){
        throw new Error("Error, no se ha podido actualizar el material");
    }   
}

export async function deleteMaterialService(id) {
    try{
        const repository = AppDataSource.getRepository(MaterialesSchema);
        const material = await repository.findOneBy({ id: parseInt(id, 10) });
        if (!material){
            throw new Error("Material no encontrado");
        }
        await repository.remove(material);
        return material;
    } catch (error){
        throw new Error("Error, no se ha podido eliminar el material");
    }
}