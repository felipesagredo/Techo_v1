"use strict"
import Herramientas from "../entity/Herramientas.entity.js";
import { AppDataSource } from "../config/db.js";

export async function createHerramientasService(body){
    try {
    const comentarioRepository = AppDataSource.getRepository(Herramientas)
    const nuevaHerramienta = herramientasRepository.create(body);
    return await comentarioRepository.save(nuevaHerramienta);
    }catch(error){
        throw new Error("Error al crear la herramienta");
    }
}

export async function getHerramientasService(){
    try{
        const herramientasRepository = AppDataSource.getRepository(Herramientas);
        let herramienta = await herramientasRepository.find();
        return herramienta;
    }catch(error){
        throw new Error("Error, no se han podido obtener las herramientas")
    }
}


export async function getHerramientasByIdService(id) {
  try {
    const herramientasRepository = AppDataSource.getRepository(Herramientas);
    const herramienta = await herramientasRepository.findOne({
      where: { id },
      relations: ["user"]
    });
    return herramienta;
  } catch (error) {
    throw new Error("Error al obtener la herramienta por ID");
  }
}

export async function updateHerramientasService(id, body) {
    try{
        const herramientasRepository = AppDataSource.getRepository(Herramientas);
        let herramienta = await herramientasRepository.findOneBy({ id });
        if (!herramienta) {
            throw new Error("Herramienta no encontrada");
    }
    herramienta = { ...herramienta, ...body };
    return await herramientasRepository.save(herramienta);
    }catch (error){
        throw new Error("Error, no se ha podido actualizar la herramienta");
    }
}

export async function deleteHerramientasService(id) {
    try{
        const herramientasRepository = AppDataSource.getRepository(Herramientas);
        const herramienta = await herramientasRepository.findOneBy({id});
        if(!herramienta){
            throw new Error("Herramienta no encontrada");
        }
        await herramientasRepository.remove(herramienta);
        return herramienta
    }catch (error){
        throw new Error("Error, no se ha podido eliminar la herramienta");
    }
}