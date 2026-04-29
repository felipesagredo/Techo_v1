import axios from './root.service.js';

export async function createHerramienta(dataHerramienta) {
    try {
        const response = await axios.post('/herramientas', dataHerramienta);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}

export async function getHerramientas() {
    try {
        const response = await axios.get('/herramientas');
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}

export async function getHerramientasById(id) {
    try {
        const response = await axios.get(`/herramientas/${id}`);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}

export async function updateHerramientas(id, dataHerramientas){
    try{
        const response = await axios.put(`/herramientas/${id}`, dataHerramientas);
        return response.data;
    }catch (error) {
        const respopnse = await axios.get(`/herramientas/${id}`);
        return response.data;
    }
}

export async function deleteHerramientas(id){
    try{
        const response = await axios.delete(`/herramientas/${id}`);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}