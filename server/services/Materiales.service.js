"use strict"
import Materiales from "../entity/Materiales.entity.js";
import { AppDataSource } from "../config/db.js";

export async function createMaterialesService(body){
    try {
        const materialesRepository = AppDataSource.getRepository(Materiales)
        const nuevoMaterial = materialesRepository.create(body);
        return await materialesRepository.save(nuevoMaterial);
    }catch(error){
        throw new Error("Error al crear el material");
    }

}

export async function getMaterialesService(){
    try {
        const materialesRepository = AppDataSource.getRepository(Materiales);
        let material = await materialesRepository.find();
        return material;
    } catch(error){
        throw new Error("Error, no se han podido obtener los materiales");
    }
}

export async function getMaterialesByIdService(id){
    try{
        const materialesRepository = AppDataSource.getRepository(Materiales);
        const material = materialesRepository.findOne({
        where : { id },
        relations: ["user"]
    });
    return material;
    }catch (error) {
        throw new Error("Error al encontrar el material por ID");
    }
}

export async function updateMaterialesService(id, body) {
    try{
        const materialesRepository = AppDataSource.getRepository(Materiales);
        let herramienta = await materialesRepository.findOneBy({id});
        if (!material){
            throw new Error("Material no encontrado");
        }
    material = { ...material, ...body};
    return await materialesRepository.save(material);
    }catch (error){
        throw new Error("Error, no se ha podido actualizar el material");
    }   
}

export async function deleteMaterialService(id) {
    try{
        const materialesRepository = AppDataSource.getRepository(herramienta);
        const material = await materialesRepository.findOneBy({id});
        if(!material){
            throw new Error("Material no encontrado");
        }
        await materialesRepository.remove(material);
        return material
    }catch(error){
        throw new Error("Error, no se ha podido eliminar el material");
    }
    
}