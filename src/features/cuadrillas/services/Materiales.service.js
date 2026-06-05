import axios from 'axios';

export async function createMaterial(dataMaterial) {
    try {
        const response = await axios.post('/materiales', dataMaterial); // Cambia la URL según tu configuración
        return response.data; //devuelve respuesta
    } catch (error) {
        return error.response.data; //devuelve error
    }
}

export async function getMateriales() {
    try {
        const response = await axios.get('/materiales');
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}

export async function getMaterialesById(id) {
    try {
        const response = await axios.get('/materiales/${id}');
    }catch (error) {
        return error.response.data;
    }
}

export async function updateMateriales(id, dataMaterial) {
    try{
        const response = await axios.put('/materiales/${id}', dataMaterial);
        return response.data;
    }catch (error) {
        return error.response.data;
    }
}

export async function deleteMateriales(id) {
    try{
        const response = await axios.delete('/materiales/${id}');
    }catch(error) {
        return error.response.data;
    }
    
}