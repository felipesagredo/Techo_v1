import api from './root.service';

const unwrapResponse = (response) => response.data;
const unwrapError = (error) => error.response?.data || { status: 'Error', message: error.message };

export async function createMaterial(dataMaterial) {
    try {
        const response = await api.post('/materiales', dataMaterial);
        return unwrapResponse(response);
    } catch (error) {
        return unwrapError(error);
    }
}

export async function getMateriales() {
    try {
        const response = await api.get('/materiales');
        return unwrapResponse(response);
    } catch (error) {
        return unwrapError(error);
    }
}

export async function getMaterialById(id) {
    try {
        const response = await api.get(`/materiales/${id}`);
        return unwrapResponse(response);
    } catch (error) {
        return unwrapError(error);
    }
}

export async function getMaterialesById(id) {
    return getMaterialById(id);
}

export async function updateMaterial(id, dataMaterial) {
    try {
        const response = await api.put(`/materiales/${id}`, dataMaterial);
        return unwrapResponse(response);
    } catch (error) {
        return unwrapError(error);
    }
}

export async function updateMateriales(id, dataMaterial) {
    return updateMaterial(id, dataMaterial);
}

export async function deleteMaterial(id) {
    try {
        const response = await api.delete(`/materiales/${id}`);
        return unwrapResponse(response);
    } catch (error) {
        return unwrapError(error);
    }
}

export async function deleteMateriales(id) {
    return deleteMaterial(id);
}