"use strict"
import pool from "../config/db.js";

export async function createMaterialesService(body){
    try {
        const { nombre_material, cantidad, categoria, largo, ancho, peso } = body;
        const result = await pool.query(
            'INSERT INTO materiales (nombre_material, cantidad, categoria, largo, ancho, peso) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nombre_material, cantidad, categoria, largo || null, ancho || null, peso]
        );
        return result.rows[0];
    } catch(error){
        throw new Error(`Error al crear el material: ${error.message}`);
    }
}

export async function getMaterialesService(){
    try {
        const result = await pool.query('SELECT * FROM materiales');
        return result.rows;
    } catch(error){
        throw new Error("Error, no se han podido obtener los materiales");
    }
}

export async function getMaterialesByIdService(id){
    try{
        const result = await pool.query('SELECT * FROM materiales WHERE id = $1', [id]);
        return result.rows[0];
    } catch (error) {
        throw new Error("Error al encontrar el material por ID");
    }
}

export async function updateMaterialesService(id, body) {
    try{
        const { nombre_material, cantidad, categoria, largo, ancho, peso, estado } = body;
        const result = await pool.query(
            'UPDATE materiales SET nombre_material = $1, cantidad = $2, categoria = $3, largo = $4, ancho = $5, peso = $6, estado = $7 WHERE id = $8 RETURNING *',
            [nombre_material, cantidad, categoria, largo || null, ancho || null, peso, estado, id]
        );
        if (result.rows.length === 0){
            throw new Error("Material no encontrado");
        }
        return result.rows[0];
    } catch (error){
        throw new Error("Error, no se ha podido actualizar el material");
    }   
}

export async function deleteMaterialService(id) {
    try{
        const result = await pool.query('DELETE FROM materiales WHERE id = $1 RETURNING *', [id]);
        if(result.rows.length === 0){
            throw new Error("Material no encontrado");
        }
        return result.rows[0];
    } catch(error){
        throw new Error("Error, no se ha podido eliminar el material");
    }
}