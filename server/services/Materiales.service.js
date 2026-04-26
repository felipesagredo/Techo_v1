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

