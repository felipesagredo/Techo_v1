"use strict"
import pool from "../config/db.js";

export async function createHerramientasService(body){
    try {
        const { nombre, descripcion, stock, categoria_herramienta} = body;
        const result = await pool.query(
            'INSERT INTO herramientas (nombre, descripcion, stock, categoria_herramienta) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, descripcion, stock, categoria_herramienta]
        );
        return result.rows[0];
    } catch(error){
        throw new Error(`Error al crear la herramienta: ${error.message}`);
    }
}

export async function getHerramientasService(){
    try{
        const result = await pool.query('SELECT * FROM herramientas');
        return result.rows;
    } catch(error){
        throw new Error("Error, no se han podido obtener las herramientas")
    }
}

export async function getHerramientasByIdService(id) {
  try {
        const result = await pool.query('SELECT * FROM herramientas WHERE id = $1', [id]);
        return result.rows[0];
  } catch (error) {
    throw new Error("Error al obtener la herramienta por ID");
  }
}

export async function updateHerramientasService(id, body) {
    try{
        const { nombre, descripcion, stock, categoria_herramienta, estado } = body;
        const result = await pool.query(
            'UPDATE herramientas SET nombre = $1, descripcion = $2, stock = $3, categoria_herramienta = $4, estado = $5 WHERE id = $6 RETURNING *',
            [nombre, descripcion, stock, categoria_herramienta, estado, id]
        );
        const herramienta = result.rows[0];
        if (!herramienta) {
            throw new Error("Herramienta no encontrada");
        }
        return herramienta;
    } catch (error){
        throw new Error("Error, no se ha podido actualizar la herramienta");
    }
}

export async function deleteHerramientasService(id) {
    try{
        const result = await pool.query('DELETE FROM herramientas WHERE id = $1 RETURNING *', [id]);
        if(result.rows.length === 0){
            throw new Error("Herramienta no encontrada");
        }
        return result.rows[0];
    } catch (error){
        throw new Error("Error, no se ha podido eliminar la herramienta");
    }
}