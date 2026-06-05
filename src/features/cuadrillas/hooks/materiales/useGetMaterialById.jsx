import { useState } from 'react';
import { getMaterialById } from '../../services/Materiales.service';
import Swal from 'sweetalert2';

export function useGetMaterialById() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [material, setMaterial] = useState(null);

    const fetchMaterialById = async (id) => {
        setLoading(true);
        setError(null);
        try{
            const response = await getMaterialById(id);
            if (response.status === 'Success') {
                setMaterial(response.data || response);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'Error al obtener el material por Id',
                    timer: 2000
                });
            }
            return response;
        } catch (error) {
            setError(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error al obtener el material por Id',
                timer: 2000
            });
            return error.response?.data || error;
        } finally {
            setLoading(false);
        }
    };

    return { material, loading, error, fetchMaterialById };
}