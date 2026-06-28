"use strict"
import AppDataSource from "../config/db.js";
import HerramientasSchema from "../entity/Herramientas.entity.js";

export async function createHerramientasService(body){
    try {
        const herramientasRepository = AppDataSource.getRepository(HerramientasSchema);
        const newTool = herramientasRepository.create(body);
        return await herramientasRepository.save(newTool);
    } catch(error){
        throw new Error(`Error al crear la herramienta: ${error.message}`);
    }
}

export async function getHerramientasService(){
    try{
        const herramientasRepository = AppDataSource.getRepository(HerramientasSchema);
        const tools = await herramientasRepository.find({
            relations: ["assignedUser"],
            order: { nombre: "ASC" }
        });
        return tools.map(h => ({
            ...h,
            voluntario_nombre: h.assignedUser ? h.assignedUser.name : null,
            voluntario_email: h.assignedUser ? h.assignedUser.email : null
        }));
    } catch(error){
        throw new Error("Error, no se han podido obtener las herramientas");
    }
}

export async function getHerramientasByIdService(id) {
    try {
        const herramientasRepository = AppDataSource.getRepository(HerramientasSchema);
        const tool = await herramientasRepository.findOne({
            where: { id: parseInt(id, 10) },
            relations: ["assignedUser"]
        });
        if (!tool) return null;
        return {
            ...tool,
            voluntario_nombre: tool.assignedUser ? tool.assignedUser.name : null,
            voluntario_email: tool.assignedUser ? tool.assignedUser.email : null
        };
    } catch (error) {
        throw new Error("Error al obtener la herramienta por ID");
    }
}

export async function updateHerramientasService(id, body) {
    try{
        const herramientasRepository = AppDataSource.getRepository(HerramientasSchema);
        const tool = await herramientasRepository.findOneBy({ id: parseInt(id, 10) });
        if (!tool) {
            throw new Error("Herramienta no encontrada");
        }
        
        // Si assigned_to viene como string o null, nos aseguramos de guardarlo
        if (body.assigned_to !== undefined) {
            tool.assigned_to = body.assigned_to ? parseInt(body.assigned_to, 10) : null;
        }

        herramientasRepository.merge(tool, body);
        return await herramientasRepository.save(tool);
    } catch (error){
        throw new Error("Error, no se ha podido actualizar la herramienta: " + error.message);
    }
}

export async function deleteHerramientasService(id) {
    try{
        const herramientasRepository = AppDataSource.getRepository(HerramientasSchema);
        const tool = await herramientasRepository.findOneBy({ id: parseInt(id, 10) });
        if (!tool) {
            throw new Error("Herramienta no encontrada");
        }
        await herramientasRepository.remove(tool);
        return tool;
    } catch (error){
        throw new Error("Error, no se ha podido eliminar la herramienta");
    }
}